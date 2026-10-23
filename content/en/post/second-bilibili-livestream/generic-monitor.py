from __future__ import annotations

import asyncio
import json
import logging
import os
import threading
import time
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

from bilibili_api import video
from flask import Flask, jsonify, render_template_string
from flask_cors import CORS


logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(message)s",
)
log = logging.getLogger("bili-monitor")

METRIC_LABELS = {
    "reply": "comments",
    "view": "views",
    "danmaku": "danmaku",
    "like": "likes",
    "favorite": "favorites",
    "coin": "coins",
    "share": "shares",
}

PALETTE = (
    "#fb7299",
    "#ff9f1c",
    "#4cc9a7",
    "#65a9ff",
    "#c792ea",
    "#f2d16b",
)


@dataclass(frozen=True)
class VideoSpec:
    bvid: str
    name: str
    color: str


@dataclass
class VideoState:
    spec: VideoSpec
    history: deque[dict[str, Any]]
    current: int | None = None
    last_success_at: str | None = None
    last_error: str | None = None
    consecutive_failures: int = 0


def load_config(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as handle:
        config = json.load(handle)

    metric = str(config.get("metric", "reply"))
    if metric not in METRIC_LABELS:
        supported = ", ".join(sorted(METRIC_LABELS))
        raise ValueError(f"Unsupported metric {metric!r}. Use one of: {supported}")

    videos = config.get("videos")
    if not isinstance(videos, list) or not videos:
        raise ValueError("config.json must contain a non-empty 'videos' list")

    seen: set[str] = set()
    for index, item in enumerate(videos):
        if not isinstance(item, dict) or not item.get("bvid"):
            raise ValueError(f"videos[{index}] is missing a bvid")
        bvid = str(item["bvid"]).strip()
        if bvid in seen:
            raise ValueError(f"Duplicate bvid: {bvid}")
        seen.add(bvid)

    return config


def parse_specs(config: dict[str, Any]) -> list[VideoSpec]:
    specs = []
    for index, item in enumerate(config["videos"]):
        bvid = str(item["bvid"]).strip()
        specs.append(
            VideoSpec(
                bvid=bvid,
                name=str(item.get("name") or bvid),
                color=str(item.get("color") or PALETTE[index % len(PALETTE)]),
            )
        )
    return specs


class VideoMetricMonitor:
    def __init__(
        self,
        specs: list[VideoSpec],
        metric: str,
        interval_seconds: float,
        history_limit: int,
        request_timeout_seconds: float,
    ) -> None:
        self.metric = metric
        self.interval_seconds = max(5.0, float(interval_seconds))
        self.request_timeout_seconds = max(3.0, float(request_timeout_seconds))
        self.history_limit = max(2, int(history_limit))
        self.states = [
            VideoState(
                spec=spec,
                history=deque(maxlen=self.history_limit),
            )
            for spec in specs
        ]
        self.last_update: str | None = None
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._thread = threading.Thread(
            target=self._run,
            name="bili-metric-poller",
            daemon=True,
        )

    def start(self) -> None:
        if not self._thread.is_alive():
            self._thread.start()

    def stop(self) -> None:
        self._stop.set()

    def is_alive(self) -> bool:
        return self._thread.is_alive()

    async def _fetch_one(
        self,
        state: VideoState,
        semaphore: asyncio.Semaphore,
    ) -> int:
        async with semaphore:
            info = await asyncio.wait_for(
                video.Video(bvid=state.spec.bvid).get_info(),
                timeout=self.request_timeout_seconds,
            )
            value = info.get("stat", {}).get(self.metric)
            if isinstance(value, bool) or not isinstance(value, int):
                raise ValueError(
                    f"Bilibili returned no integer '{self.metric}' for {state.spec.bvid}"
                )
            return value

    async def _poll_once(self) -> list[int | BaseException]:
        semaphore = asyncio.Semaphore(min(4, len(self.states)))
        tasks = [
            self._fetch_one(state, semaphore)
            for state in self.states
        ]
        return await asyncio.gather(*tasks, return_exceptions=True)

    def _record_success(self, state: VideoState, value: int, now: datetime) -> None:
        label = now.strftime("%H:%M:%S")
        with self._lock:
            state.current = value
            state.last_error = None
            state.consecutive_failures = 0
            state.last_success_at = now.isoformat(timespec="seconds")
            state.history.append(
                {
                    "timestamp": int(now.timestamp()),
                    "time": label,
                    "count": value,
                }
            )

    def _record_failure(
        self,
        state: VideoState,
        error: BaseException,
    ) -> None:
        message = str(error).splitlines()[0][:240]
        with self._lock:
            state.consecutive_failures += 1
            state.last_error = message
        log.warning("Failed to fetch %s: %s", state.spec.bvid, message)

    def _run(self) -> None:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            while not self._stop.is_set():
                started = time.monotonic()
                now = datetime.now().astimezone()
                try:
                    results = loop.run_until_complete(self._poll_once())
                    successes = 0
                    for state, result in zip(self.states, results):
                        if isinstance(result, BaseException):
                            self._record_failure(state, result)
                        else:
                            self._record_success(state, result, now)
                            successes += 1

                    with self._lock:
                        if successes:
                            self.last_update = now.isoformat(timespec="seconds")
                    log.info(
                        "Polled %s/%s videos for %s",
                        successes,
                        len(self.states),
                        self.metric,
                    )
                except Exception:
                    log.exception("Polling cycle failed")

                elapsed = time.monotonic() - started
                delay = max(0.5, self.interval_seconds - elapsed)
                if self._stop.wait(delay):
                    break
        finally:
            loop.close()

    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            videos = []
            for state in self.states:
                videos.append(
                    {
                        "bvid": state.spec.bvid,
                        "name": state.spec.name,
                        "color": state.spec.color,
                        "current": state.current,
                        "history": list(state.history),
                        "last_success_at": state.last_success_at,
                        "last_error": state.last_error,
                        "consecutive_failures": state.consecutive_failures,
                    }
                )
            return {
                "metric": self.metric,
                "metric_label": METRIC_LABELS[self.metric],
                "last_update": self.last_update,
                "videos": videos,
            }


PAGE_TEMPLATE = """
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bilibili metric tracker</title>
  <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>
  <style>
    :root {
      color-scheme: dark;
      --page: #101412;
      --panel: #191f1c;
      --panel-2: #222a26;
      --line: #344139;
      --ink: #eff5f1;
      --muted: #99a79f;
      --positive: #68d391;
      --negative: #ff7b72;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: radial-gradient(circle at 50% 0, #1b2b23, var(--page) 46%);
      color: var(--ink);
      font-family: Inter, "Microsoft YaHei", system-ui, sans-serif;
    }
    main { width: min(1500px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 48px; }
    header { display: flex; justify-content: space-between; gap: 24px; align-items: end; margin-bottom: 24px; }
    h1 { margin: 0 0 6px; font-size: clamp(1.8rem, 4vw, 3.1rem); line-height: 1; }
    header p, .status, .error, .meta { color: var(--muted); }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 14px; }
    .card, .chart, .growth {
      border: 1px solid var(--line);
      border-radius: 14px;
      background: color-mix(in srgb, var(--panel) 94%, white);
      box-shadow: 0 16px 44px #0004;
    }
    .card { border-top: 4px solid var(--series); padding: 20px; min-width: 0; }
    .card h2 { margin: 0 0 8px; font-size: 0.93rem; color: var(--muted); }
    .card .name { min-height: 2.7em; font-weight: 650; line-height: 1.35; overflow-wrap: anywhere; }
    .card .bvid { margin-top: 4px; color: var(--muted); font: 0.76rem ui-monospace, monospace; }
    .card .value { margin-top: 20px; color: var(--series); font: 700 clamp(2rem, 4vw, 3.4rem)/1 ui-monospace, monospace; }
    .card .error { margin: 12px 0 0; font-size: 0.72rem; line-height: 1.35; }
    .layout { display: grid; grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr); gap: 14px; margin-top: 14px; }
    .chart { padding: 18px; min-width: 0; }
    #chart { width: 100%; height: min(62vh, 570px); min-height: 360px; }
    .growth { padding: 18px; display: grid; align-content: start; gap: 12px; }
    .growth-card { border-radius: 10px; background: var(--panel-2); padding: 14px; }
    .growth-card h3 { margin: 0; font-size: 0.88rem; color: var(--muted); }
    .delta { margin-top: 8px; font: 700 1.9rem ui-monospace, monospace; }
    .delta.positive { color: var(--positive); }
    .delta.negative { color: var(--negative); }
    .delta.zero { color: var(--muted); }
    .growth-list { margin: 10px 0 0; padding: 8px 0 0; border-top: 1px solid var(--line); list-style: none; }
    .growth-list li { display: flex; justify-content: space-between; padding: 4px 0; color: var(--muted); font-size: 0.76rem; }
    footer { display: flex; justify-content: space-between; gap: 16px; margin-top: 18px; color: var(--muted); font-size: 0.76rem; }
    @media (max-width: 860px) {
      header, footer { align-items: start; flex-direction: column; }
      .layout { grid-template-columns: 1fr; }
      #chart { height: 380px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>Bilibili metric tracker</h1>
        <p>{{ metric_label|capitalize }} / refresh every {{ interval_seconds }} seconds</p>
      </div>
      <div class="status" id="status">Waiting for the first poll...</div>
    </header>

    <section class="cards" id="cards" aria-label="Latest values"></section>

    <section class="layout">
      <div class="chart">
        <div id="chart" role="img" aria-label="Metric history across tracked videos"></div>
      </div>
      <aside class="growth" id="growth" aria-label="Recent changes"></aside>
    </section>

    <footer>
      <span>Source: Bilibili video API</span>
      <span id="updated">Last update: --</span>
    </footer>
  </main>

  <script>
    const numberFormat = new Intl.NumberFormat("en-US");
    const chart = echarts.init(document.getElementById("chart"));
    const cards = document.getElementById("cards");
    const growthPanel = document.getElementById("growth");
    const statusNode = document.getElementById("status");
    const updatedNode = document.getElementById("updated");

    function formatDelta(value) {
      if (value == null) return "--";
      return (value > 0 ? "+" : "") + numberFormat.format(value);
    }

    function deltaClass(value) {
      if (value == null || value === 0) return "zero";
      return value > 0 ? "positive" : "negative";
    }

    function makeCard(video) {
      const card = document.createElement("article");
      card.className = "card";
      card.style.setProperty("--series", video.color);

      const heading = document.createElement("h2");
      heading.textContent = "Tracked video";

      const name = document.createElement("div");
      name.className = "name";
      name.textContent = video.name;

      const bvid = document.createElement("div");
      bvid.className = "bvid";
      bvid.textContent = video.bvid;

      const value = document.createElement("div");
      value.className = "value";
      value.textContent = video.current == null ? "--" : numberFormat.format(video.current);

      card.append(heading, name, bvid, value);
      if (video.last_error) {
        const error = document.createElement("p");
        error.className = "error";
        error.textContent = "Last poll failed: " + video.last_error;
        card.append(error);
      }
      return card;
    }

    function makeGrowth(video) {
      const card = document.createElement("section");
      card.className = "growth-card";

      const title = document.createElement("h3");
      title.textContent = video.name;

      const history = video.history || [];
      const latestDelta = history.length >= 2
        ? history.at(-1).count - history.at(-2).count
        : null;

      const delta = document.createElement("div");
      delta.className = "delta " + deltaClass(latestDelta);
      delta.textContent = formatDelta(latestDelta);

      const list = document.createElement("ul");
      list.className = "growth-list";
      const pairs = [];
      for (let index = Math.max(1, history.length - 5); index < history.length; index += 1) {
        const item = document.createElement("li");
        const left = document.createElement("span");
        left.textContent = history[index].time;
        const right = document.createElement("span");
        const difference = history[index].count - history[index - 1].count;
        right.textContent = formatDelta(difference);
        right.className = deltaClass(difference);
        item.append(left, right);
        pairs.push(item);
      }

      list.append(...pairs.reverse());
      if (!pairs.length) {
        const empty = document.createElement("li");
        empty.textContent = "Waiting for two samples...";
        list.append(empty);
      }

      card.append(title, delta, list);
      return card;
    }

    function updateChart(videos) {
      const timestamps = new Map();
      for (const video of videos) {
        for (const point of video.history || []) {
          timestamps.set(point.timestamp, point.time);
        }
      }
      const sorted = [...timestamps.keys()].sort((left, right) => left - right);
      const labels = sorted.map((timestamp) => timestamps.get(timestamp));

      chart.setOption({
        backgroundColor: "transparent",
        animationDurationUpdate: 350,
        tooltip: { trigger: "axis" },
        legend: {
          top: 4,
          textStyle: { color: "#dbe5df" },
          data: videos.map((video) => video.name),
        },
        grid: { left: 22, right: 26, top: 58, bottom: 22, containLabel: true },
        xAxis: {
          type: "category",
          data: labels,
          axisLabel: { color: "#99a79f" },
          axisLine: { lineStyle: { color: "#344139" } },
        },
        yAxis: {
          type: "value",
          scale: true,
          axisLabel: { color: "#99a79f" },
          splitLine: { lineStyle: { color: "#2a342f" } },
        },
        series: videos.map((video) => {
          const points = new Map(
            (video.history || []).map((point) => [point.timestamp, point.count])
          );
          return {
            name: video.name,
            type: "line",
            smooth: true,
            connectNulls: true,
            showSymbol: false,
            data: sorted.map((timestamp) => points.get(timestamp) ?? null),
            lineStyle: { width: 3, color: video.color },
            itemStyle: { color: video.color },
          };
        }),
      });
    }

    async function refresh() {
      try {
        const response = await fetch("/api/series", { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const data = await response.json();

        cards.replaceChildren(...data.videos.map(makeCard));
        growthPanel.replaceChildren(...data.videos.map(makeGrowth));
        updateChart(data.videos);
        updatedNode.textContent = "Last update: " + (data.last_update || "--");
        const failed = data.videos.filter((video) => video.last_error).length;
        statusNode.textContent = failed
          ? `${failed} video${failed === 1 ? "" : "s"} failed on the last poll`
          : "All videos responded on the last poll";
      } catch (error) {
        statusNode.textContent = "Could not reach the monitor API: " + error.message;
      }
    }

    refresh();
    setInterval(refresh, {{ interval_ms }});
  </script>
</body>
</html>
"""


def create_app(config_path: Path) -> Flask:
    config = load_config(config_path)
    specs = parse_specs(config)
    monitor = VideoMetricMonitor(
        specs=specs,
        metric=str(config.get("metric", "reply")),
        interval_seconds=float(config.get("update_interval_seconds", 10)),
        history_limit=int(config.get("history_limit", 180)),
        request_timeout_seconds=float(config.get("request_timeout_seconds", 15)),
    )

    app = Flask(__name__)
    allowed_origins = config.get("cors_origins")
    if allowed_origins:
        CORS(app, resources={r"/api/*": {"origins": allowed_origins}})

    @app.get("/")
    def index() -> str:
        return render_template_string(
            PAGE_TEMPLATE,
            interval_seconds=monitor.interval_seconds,
            interval_ms=int(monitor.interval_seconds * 1000),
            metric_label=METRIC_LABELS[monitor.metric],
        )

    @app.get("/api/series")
    def series():
        return jsonify(monitor.snapshot())

    @app.get("/api/health")
    def health():
        return jsonify(
            {
                "status": "ok",
                "worker_alive": monitor.is_alive(),
                "last_update": monitor.last_update,
            }
        )

    app.extensions["metric_monitor"] = monitor
    monitor.start()
    return app


def main() -> None:
    config_path = Path(os.getenv("MONITOR_CONFIG", "config.json"))
    if not config_path.exists():
        raise SystemExit(f"Config file not found: {config_path.resolve()}")

    app = create_app(config_path)
    host = os.getenv("MONITOR_HOST", "127.0.0.1")
    port = int(os.getenv("MONITOR_PORT", "5000"))
    app.run(host=host, port=port, debug=False)


if __name__ == "__main__":
    main()
