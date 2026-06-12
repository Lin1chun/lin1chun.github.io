#!/usr/bin/env python3
"""Migrate selected posts to Hugo page bundles and move their images."""

from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POST = ROOT / "content" / "post"
IMG = ROOT / "static" / "images"


def git_mv(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "mv", str(src), str(dst)], check=True, cwd=ROOT)


def to_bundle(md_name: str, images: list[tuple[str, str | None]] | None = None) -> None:
    md = POST / md_name
    if not md.exists():
        raise FileNotFoundError(md)
    bundle = POST / md.stem
    bundle.mkdir(parents=True, exist_ok=True)
    git_mv(md, bundle / "index.md")
    if images:
        for src_rel, dst_name in images:
            src = ROOT / src_rel if not Path(src_rel).is_absolute() else Path(src_rel)
            dst = bundle / (dst_name or src.name)
            if src.exists():
                git_mv(src, dst)


def main() -> None:
    sagi_dir = IMG / "art" / "sagi"
    sagi_images = [(str(p.relative_to(ROOT)), None) for p in sorted(sagi_dir.glob("*"))] if sagi_dir.exists() else []

    to_bundle("画过的一些小兔子~.md", sagi_images)

    a16z_images = [
        ("static/images/channels4_banner.jpg", None),
        ("static/images/a16zScreenshot.png", None),
        ("static/images/ShizukuYoutube.png", None),
        ("static/images/demo_07.gif", None),
        ("static/images/demo_09.gif", None),
        ("static/images/ShizukuLive2D.png", None),
        ("static/images/Hatunemiku.png", None),
        ("static/images/posts/vtuber/vtuber-ai-top-twitch-streamer.webp", None),
    ]
    to_bundle("a16z为何押注日本“宅男极客”？一场关于AI虚拟人的路线之争.md", a16z_images)

    to_bundle("我的NSEP项目.md", [("static/images/water-bottles.jpg", None)])

    to_bundle("谁定义了娱乐AI的新范式？Neuro-sama的爆火，为何值得让开发者重点关注？.md")

    for empty in (sagi_dir, IMG / "art"):
        if empty.exists() and not any(empty.iterdir()):
            empty.rmdir()

    print("Page bundle migration complete.")


if __name__ == "__main__":
    main()
