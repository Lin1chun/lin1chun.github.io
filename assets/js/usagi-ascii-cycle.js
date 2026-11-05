(() => {
    "use strict";

    const roots = [...document.querySelectorAll("[data-usagi-cycle]")];
    if (!roots.length) return;

    const TRANSITION_MS = 3600;
    const HOLD_MS = 2500;
    const CELL_ASPECT = 1.75;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const getLines = (text) => (
        text
            .replace(/\r/g, "")
            .replace(/\n+$/, "")
            .split("\n")
    );

    const parseFrame = (text, columns, rows) => {
        const lines = getLines(text);
        const symbols = [];

        for (let row = 0; row < rows; row += 1) {
            const line = lines[row] || "";
            for (let column = 0; column < columns; column += 1) {
                const glyph = line[column] || " ";
                if (glyph !== " ") {
                    symbols.push({ column, row, glyph });
                }
            }
        }
        return symbols;
    };

    const ease = (value) => (
        value < 0.5
            ? 4 * value * value * value
            : 1 - Math.pow(-2 * value + 2, 3) / 2
    );

    const clamp = (value) => Math.max(0, Math.min(1, value));

    const hash = (value) => {
        value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
        value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
        value ^= value >>> 16;
        return (value >>> 0) / 4294967295;
    };

    const weightedDistance = (start, end) => {
        const column = end.column - start.column;
        const row = (end.row - start.row) * CELL_ASPECT;
        return column * column + row * row;
    };

    class UsagiCycle {
        constructor(root) {
            this.root = root;
            this.fallback = root.querySelector("[data-usagi-fallback]");
            this.canvas = root.querySelector("[data-usagi-canvas]");
            this.toggle = root.querySelector("[data-usagi-toggle]");
            this.frameData = root.querySelector("[data-usagi-frames]");
            if (!this.fallback || !this.canvas || !this.toggle || !this.frameData) {
                return;
            }

            try {
                const sourceFrames = JSON.parse(this.frameData.textContent)
                    .map((frame) => frame.text);
                this.columns = Math.max(1, ...sourceFrames.map((frame) => (
                    Math.max(0, ...getLines(frame).map((line) => line.length))
                )));
                this.rows = Math.max(1, ...sourceFrames.map((frame) => (
                    getLines(frame).length
                )));
                this.frames = sourceFrames.map((frame) => (
                    parseFrame(frame, this.columns, this.rows)
                ));
            } catch {
                return;
            }
            if (this.frames.length < 2) return;

            this.context = this.canvas.getContext("2d");
            if (!this.context) return;

            this.index = 0;
            this.transition = null;
            this.transitionFrame = 0;
            this.holdTimer = 0;
            this.resizeFrame = 0;
            this.pausedProgress = 0;
            this.inView = true;
            this.playing = !reduceMotion.matches;
            this.width = 0;
            this.height = 0;
            this.cellWidth = 0;
            this.cellHeight = 0;
            this.fontSize = 0;

            root.style.setProperty(
                "--usagi-aspect",
                String((this.columns * 0.54) / this.rows),
            );
            root.dataset.enhanced = "true";
            this.toggle.hidden = false;
            this.toggle.addEventListener("click", () => this.setPlaying(!this.playing));
            if ("ResizeObserver" in window) {
                this.resizeObserver = new ResizeObserver(() => this.queueResize());
                this.resizeObserver.observe(this.canvas);
            } else {
                window.addEventListener("resize", () => this.queueResize());
            }

            if ("IntersectionObserver" in window) {
                this.observer = new IntersectionObserver(([entry]) => {
                    this.inView = entry.isIntersecting;
                    this.syncPlayback();
                }, { rootMargin: "120px" });
                this.observer.observe(this.root);
            }

            document.addEventListener("visibilitychange", () => this.syncPlayback());
            reduceMotion.addEventListener?.("change", () => {
                if (reduceMotion.matches) this.setPlaying(false);
            });

            this.resize();
            this.renderFrame(this.index);
            this.syncButton();
            this.syncPlayback();
        }

        canRun() {
            return this.playing && this.inView && !document.hidden;
        }

        setPlaying(playing) {
            this.playing = playing;
            this.syncButton();
            this.syncPlayback();
        }

        syncButton() {
            this.toggle.dataset.playing = String(this.playing);
            this.toggle.setAttribute(
                "aria-label",
                this.playing
                    ? "Pause usagi ASCII animation"
                    : "Play usagi ASCII animation",
            );
        }

        syncPlayback() {
            if (!this.canRun()) {
                this.pausePlayback();
                return;
            }

            if (this.transition) {
                this.transition.started = performance.now() - (
                    this.pausedProgress * TRANSITION_MS
                );
                cancelAnimationFrame(this.transitionFrame);
                this.transitionFrame = requestAnimationFrame((now) => this.step(now));
            } else if (!this.holdTimer) {
                this.schedule(HOLD_MS);
            }
        }

        pausePlayback() {
            window.clearTimeout(this.holdTimer);
            this.holdTimer = 0;
            cancelAnimationFrame(this.transitionFrame);
            this.transitionFrame = 0;

            if (this.transition) {
                this.pausedProgress = clamp(
                    (performance.now() - this.transition.started) / TRANSITION_MS,
                );
            }
        }

        schedule(delay) {
            window.clearTimeout(this.holdTimer);
            this.holdTimer = 0;
            if (!this.canRun()) return;

            this.holdTimer = window.setTimeout(() => {
                this.holdTimer = 0;
                this.startTransition();
            }, delay);
        }

        startTransition() {
            if (!this.canRun()) return;

            const from = this.index;
            const next = (from + 1) % this.frames.length;
            this.transition = {
                from,
                next,
                started: performance.now(),
                symbols: this.buildSymbolMoves(from, next),
            };
            this.pausedProgress = 0;
            this.transitionFrame = requestAnimationFrame((now) => this.step(now));
        }

        buildSymbolMoves(from, next) {
            const source = this.frames[from];
            const target = this.frames[next];
            const moves = [];
            const claimedTargets = new Set();
            const orderedSources = source
                .map((symbol, index) => ({ symbol, index }))
                .sort((a, b) => (
                    hash(a.index * 2246822519 + 3266489917)
                    - hash(b.index * 2246822519 + 3266489917)
                ));

            for (const { symbol: start } of orderedSources) {
                let nearestIndex = 0;
                let nearestDistance = Infinity;
                let nearestFreeIndex = 0;
                let nearestFreeDistance = Infinity;

                for (let index = 0; index < target.length; index += 1) {
                    const distance = weightedDistance(start, target[index]);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestIndex = index;
                    }
                    if (!claimedTargets.has(index) && distance < nearestFreeDistance) {
                        nearestFreeDistance = distance;
                        nearestFreeIndex = index;
                    }
                }

                const targetIndex = nearestFreeDistance <= nearestDistance * 1.7 + 6
                    ? nearestFreeIndex
                    : nearestIndex;
                claimedTargets.add(targetIndex);
                moves.push({
                    start,
                    end: target[targetIndex],
                    targetIndex,
                });
            }

            for (let index = 0; index < target.length; index += 1) {
                if (claimedTargets.has(index)) continue;
                let nearestSource = source[0];
                let nearestDistance = Infinity;
                for (const candidate of source) {
                    const distance = weightedDistance(candidate, target[index]);
                    if (distance < nearestDistance) {
                        nearestDistance = distance;
                        nearestSource = candidate;
                    }
                }
                moves.push({
                    start: nearestSource,
                    end: target[index],
                    targetIndex: index,
                });
            }

            for (let index = 0; index < moves.length; index += 1) {
                const move = moves[index];
                const timingSeed = index * 2654435761 + move.targetIndex * 1597334677;
                move.startAt = hash(timingSeed) * 0.14;
                move.endAt = 0.72 + hash(timingSeed + 193) * 0.28;
            }
            return moves;
        }

        queueResize() {
            cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = requestAnimationFrame(() => {
                this.resizeFrame = 0;
                this.resize();
                if (this.transition) {
                    this.renderTransition(this.pausedProgress);
                } else {
                    this.renderFrame(this.index);
                }
            });
        }

        resize() {
            const rectangle = this.canvas.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            this.width = rectangle.width;
            this.height = rectangle.height;
            this.canvas.width = Math.max(1, Math.round(this.width * ratio));
            this.canvas.height = Math.max(1, Math.round(this.height * ratio));
            this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
            this.context.textAlign = "center";
            this.context.textBaseline = "middle";
            this.cellWidth = this.width / this.columns;
            this.cellHeight = this.height / this.rows;
            this.fontSize = this.cellHeight;

            const fontFamily = getComputedStyle(this.canvas).fontFamily;
            this.context.font = `${this.fontSize}px ${fontFamily}`;
            const measuredWidth = this.context.measureText("M").width;
            if (measuredWidth > this.cellWidth * 0.96) {
                this.fontSize *= this.cellWidth * 0.96 / measuredWidth;
                this.context.font = `${this.fontSize}px ${fontFamily}`;
            }
            this.context.fillStyle = getComputedStyle(this.canvas).color;
        }

        drawGlyph(glyph, column, row) {
            this.drawGlyphAt(
                glyph,
                Math.round((column + 0.5) * this.cellWidth),
                Math.round((row + 0.5) * this.cellHeight),
            );
        }

        drawGlyphAt(glyph, x, y) {
            this.context.fillText(glyph, x, y);
        }

        clear() {
            this.context.clearRect(0, 0, this.width, this.height);
        }

        renderFrame(frameIndex) {
            this.clear();
            for (const symbol of this.frames[frameIndex]) {
                this.drawGlyph(symbol.glyph, symbol.column, symbol.row);
            }
        }

        step(now) {
            if (!this.canRun() || !this.transition) return;

            const progress = Math.min(
                1,
                (now - this.transition.started) / TRANSITION_MS,
            );
            this.pausedProgress = progress;
            this.renderTransition(progress);

            if (progress < 1) {
                this.transitionFrame = requestAnimationFrame((tick) => this.step(tick));
                return;
            }

            this.index = this.transition.next;
            this.transition = null;
            this.transitionFrame = 0;
            this.pausedProgress = 0;
            this.renderFrame(this.index);
            this.schedule(HOLD_MS);
        }

        renderTransition(progress) {
            if (!this.transition) return;

            this.clear();
            const drawn = new Set();
            for (const symbol of this.transition.symbols) {
                const local = ease(clamp(
                    (progress - symbol.startAt) / (symbol.endAt - symbol.startAt),
                ));
                const column = symbol.start.column
                    + (symbol.end.column - symbol.start.column) * local;
                const row = symbol.start.row
                    + (symbol.end.row - symbol.start.row) * local;
                const glyph = local >= 0.72
                    ? symbol.end.glyph
                    : symbol.start.glyph;
                const x = Math.round((column + 0.5) * this.cellWidth);
                const y = Math.round((row + 0.5) * this.cellHeight);
                const seen = `${glyph}:${x}:${y}`;

                if (drawn.has(seen)) continue;
                drawn.add(seen);
                this.drawGlyphAt(glyph, x, y);
            }
        }
    }

    for (const root of roots) new UsagiCycle(root);
})();
