#!/usr/bin/env python3
"""Compress oversized images in static/ (in-place). Report large files in content/."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow first: pip install Pillow", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "static"
CONTENT = ROOT / "content" / "post"
MAX_WIDTH = 1200
WEBP_QUALITY = 82
JPEG_QUALITY = 85
WARN_MB = 0.5


def optimize_file(path: Path) -> tuple[int, int] | None:
    ext = path.suffix.lower()
    before = path.stat().st_size

    if ext == ".webp":
        with Image.open(path) as im:
            im.load()
            if im.width <= MAX_WIDTH and before < 150 * 1024:
                return None
            if im.width > MAX_WIDTH:
                ratio = MAX_WIDTH / im.width
                im = im.resize((MAX_WIDTH, max(1, round(im.height * ratio))), Image.Resample.LANCZOS)
            im.save(path, "WEBP", quality=WEBP_QUALITY, method=6)
    elif ext in {".jpg", ".jpeg"}:
        with Image.open(path) as im:
            im.load()
            if im.mode != "RGB":
                im = im.convert("RGB")
            if im.width > MAX_WIDTH:
                ratio = MAX_WIDTH / im.width
                im = im.resize((MAX_WIDTH, max(1, round(im.height * ratio))), Image.Resample.LANCZOS)
            im.save(path, "JPEG", quality=JPEG_QUALITY, optimize=True)
    elif ext == ".png":
        with Image.open(path) as im:
            im.load()
            if im.width > MAX_WIDTH:
                ratio = MAX_WIDTH / im.width
                im = im.resize((MAX_WIDTH, max(1, round(im.height * ratio))), Image.Resample.LANCZOS)
            im.save(path, "PNG", optimize=True)
    else:
        return None

    after = path.stat().st_size
    if before - after < 4 * 1024 and ext != ".jpg":
        return None
    return before, after


def report_large_files() -> None:
    for base in (STATIC, CONTENT):
        if not base.exists():
            continue
        for path in sorted(base.rglob("*")):
            if not path.is_file():
                continue
            size_mb = path.stat().st_size / 1024 / 1024
            if size_mb < WARN_MB:
                continue
            rel = path.relative_to(ROOT)
            if path.suffix.lower() == ".gif":
                print(f"[WARN] GIF {size_mb:.1f} MB — consider shortening or using video: {rel}")
            elif "content" in path.parts:
                print(f"[INFO] Large content asset {size_mb:.1f} MB (Hugo build will resize in {{< img >}}): {rel}")
            else:
                print(f"[INFO] Large static file {size_mb:.1f} MB: {rel}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    report_large_files()
    print()

    targets = []
    if STATIC.exists():
        targets.extend(
            p
            for p in STATIC.rglob("*")
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
            and "resources" not in p.parts
        )

    for path in sorted(targets):
        before = path.stat().st_size
        if not args.apply:
            if before > 100 * 1024:
                print(f"[PLAN] {path.relative_to(ROOT)} ({before/1024:.0f} KB)")
            continue
        result = optimize_file(path)
        if result:
            b, a = result
            print(f"[OK] {path.relative_to(ROOT)}: {b/1024:.0f} KB -> {a/1024:.0f} KB")

    if not args.apply:
        print("\nDry run. Use --apply to compress static/ images.")


if __name__ == "__main__":
    main()
