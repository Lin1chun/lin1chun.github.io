#!/usr/bin/env python3
"""Extract the first frame from Windows .ani cursor files to PNG."""

from __future__ import annotations

import struct
import sys
from io import BytesIO
from pathlib import Path

from PIL import Image


def _parse_ico_cur(data: bytes) -> bytes:
    if data[:4] not in (b"\x00\x00\x01\x00", b"\x00\x00\x02\x00"):
        return data
    count = struct.unpack("<H", data[4:6])[0]
    best = None
    best_area = -1
    for i in range(count):
        off = 6 + i * 16
        width = data[off] or 256
        height = data[off + 1] or 256
        size = struct.unpack("<I", data[off + 8 : off + 12])[0]
        start = struct.unpack("<I", data[off + 12 : off + 16])[0]
        area = width * height
        if area > best_area:
            best_area = area
            best = data[start : start + size]
    if best is None:
        raise ValueError("empty ICO/CUR")
    return best


def _bmp_to_png(bmp: bytes, out: Path) -> None:
    if bmp[:4] == b"\x00\x00\x01\x00" or bmp[:4] == b"\x00\x00\x02\x00":
        bmp = _parse_ico_cur(bmp)
    header_size = struct.unpack("<I", bmp[0:4])[0]
    if header_size != 40:
        raise ValueError(f"unsupported BMP header size {header_size}")
    width = struct.unpack("<i", bmp[4:8])[0]
    height = struct.unpack("<i", bmp[8:12])[0] // 2
    bpp = struct.unpack("<H", bmp[14:16])[0]
    xor_size = width * height * (bpp // 8)
    xor = bmp[40 : 40 + xor_size]

    if bpp == 32:
        img = Image.frombytes("RGBA", (width, height), xor, "raw", "BGRA")
        img = img.transpose(Image.FLIP_TOP_BOTTOM)
    elif bpp == 24:
        rgb = Image.frombytes("RGB", (width, height), xor, "raw", "BGR")
        img = rgb.transpose(Image.FLIP_TOP_BOTTOM).convert("RGBA")
    else:
        raise ValueError(f"unsupported bpp {bpp}")

    # Trim to reasonable cursor hotspot size for web (max 64px)
    max_size = 64
    if max(img.size) > max_size:
        ratio = max_size / max(img.size)
        new_size = (max(1, round(img.size[0] * ratio)), max(1, round(img.size[1] * ratio)))
        img = img.resize(new_size, Image.Resampling.LANCZOS)

    img.save(out, "PNG")


def _collect_frames(data: bytes) -> list[bytes]:
    frames: list[bytes] = []

    def walk(chunk: bytes) -> None:
        pos = 0
        while pos + 8 <= len(chunk):
            cid = chunk[pos : pos + 4]
            size = struct.unpack("<I", chunk[pos + 4 : pos + 8])[0]
            body = chunk[pos + 8 : pos + 8 + size]
            pos += 8 + size + (size % 2)
            if cid == b"LIST" and body[:4] == b"fram":
                walk(body[4:])
            elif cid in (b"icon", b"cur ", b"rate", b"seq "):
                if cid in (b"icon", b"cur "):
                    frames.append(body)

    if data[:4] != b"RIFF" or data[8:12] != b"ACON":
        raise ValueError("not an ANI file")
    walk(data[12:])
    return frames


def ani_to_png(ani_path: Path, out_path: Path) -> None:
    frames = _collect_frames(ani_path.read_bytes())
    if not frames:
        raise ValueError(f"no frames in {ani_path}")
    _bmp_to_png(frames[0], out_path)


def main(argv: list[str]) -> int:
    if len(argv) != 3:
        print("usage: ani_to_png.py input.ani output.png", file=sys.stderr)
        return 1
    ani_to_png(Path(argv[1]), Path(argv[2]))
    print(f"Wrote {argv[2]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
