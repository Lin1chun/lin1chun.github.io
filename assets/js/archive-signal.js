(() => {
    "use strict";

    const roots = [...document.querySelectorAll("[data-archive-signal]")];
    if (!roots.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    class ArchiveField {
        constructor(root) {
            this.root = root;
            this.visual = root.querySelector("[data-archive-signal-visual]");
            if (!this.visual) return;
            this.targetX = 0;
            this.targetY = 0;
            this.currentX = 0;
            this.currentY = 0;
            this.frame = 0;

            this.visual.addEventListener("pointermove", (event) => {
                if (reduceMotion.matches) return;
                const rect = this.visual.getBoundingClientRect();
                this.targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
                this.targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
                this.start();
            }, { passive: true });
            this.visual.addEventListener("pointerleave", () => {
                this.targetX = 0;
                this.targetY = 0;
                this.start();
            });
        }

        start() {
            if (this.frame) return;
            this.frame = requestAnimationFrame(() => this.render());
        }

        render() {
            this.frame = 0;
            this.currentX += (this.targetX - this.currentX) * 0.1;
            this.currentY += (this.targetY - this.currentY) * 0.1;
            this.visual.style.setProperty("--archive-x", this.currentX.toFixed(3));
            this.visual.style.setProperty("--archive-y", this.currentY.toFixed(3));

            const settled = Math.abs(this.targetX - this.currentX) < 0.002
                && Math.abs(this.targetY - this.currentY) < 0.002;
            if (!settled) this.start();
        }
    }

    for (const root of roots) new ArchiveField(root);
})();
