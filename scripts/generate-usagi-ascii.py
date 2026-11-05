#!/usr/bin/env python3
"""Generate the usagi ASCII frames from the article's source images."""

from argparse import ArgumentParser
import re
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps
import numpy as np
from scipy import ndimage


EDGE_RAMP = ".:-=+*#%@"
OUTPUT_SLUGS = {
    "a-very-tiny-prince": "prince",
    "the-haqi": "haqi",
    "festive-red": "festival",
    "usasgi-in-yunfeng": "yunfeng",
}
EXCLUDED_SOURCE_SLUGS = {"the-haqi"}


def crop_subject(image):
    pixels = np.asarray(image.convert("RGB")).astype(np.float32)
    corners = np.concatenate([
        pixels[:28, :28].reshape(-1, 3),
        pixels[:28, -28:].reshape(-1, 3),
        pixels[-28:, :28].reshape(-1, 3),
        pixels[-28:, -28:].reshape(-1, 3),
    ])
    background = np.median(corners, axis=0)
    distance = np.sqrt(((pixels - background) ** 2).sum(axis=2))
    luminance = pixels.mean(axis=2)
    foreground = (distance > 20) | (luminance < 232)
    joined = ndimage.binary_closing(
        ndimage.binary_dilation(foreground, iterations=3),
        iterations=3,
    )
    labels, count = ndimage.label(joined)
    if count == 0:
        return ImageOps.pad(image, (480, 480), color="white")

    sizes = ndimage.sum(joined, labels, range(1, count + 1))
    centers = ndimage.center_of_mass(
        joined,
        labels,
        range(1, count + 1),
    )
    image_center = (image.width / 2, image.height / 2)
    scores = []
    for size, (row, column) in zip(sizes, centers):
        distance_from_center = (
            (column - image_center[0]) ** 2
            + (row - image_center[1]) ** 2
        ) ** 0.5 / max(image.size)
        scores.append(size * (1 - 0.18 * distance_from_center))

    ranked = np.argsort(scores)[::-1]
    minimum = max(foreground.sum() * 0.035, 300)
    subject_label = next(
        (
            index + 1
            for index in ranked
            if sizes[index] > minimum
        ),
        ranked[0] + 1,
    )
    rows, columns = np.where(labels == subject_label)
    padding = max(
        10,
        int(max(rows.ptp(), columns.ptp()) * 0.09),
    )
    box = (
        max(0, columns.min() - padding),
        max(0, rows.min() - padding),
        min(image.width, columns.max() + 1 + padding),
        min(image.height, rows.max() + 1 + padding),
    )
    return ImageOps.pad(
        image.crop(box),
        (480, 480),
        color="white",
        centering=(0.5, 0.5),
    )


def thin_edges(mask):
    result = mask.copy()
    while True:
        changed = False
        for step in (0, 1):
            p2 = np.roll(result, -1, 0)
            p3 = np.roll(np.roll(result, -1, 0), 1, 1)
            p4 = np.roll(result, 1, 1)
            p5 = np.roll(np.roll(result, 1, 0), 1, 1)
            p6 = np.roll(result, 1, 0)
            p7 = np.roll(np.roll(result, 1, 0), -1, 1)
            p8 = np.roll(result, -1, 1)
            p9 = np.roll(np.roll(result, -1, 0), -1, 1)
            neighbours = [p2, p3, p4, p5, p6, p7, p8, p9]
            count = sum(neighbour.astype(np.uint8) for neighbour in neighbours)
            transitions = sum(
                ((~neighbours[index]) & neighbours[(index + 1) % 8])
                .astype(np.uint8)
                for index in range(8)
            )
            first = (
                ~(p2 & p4 & p6)
                if step == 0
                else ~(p2 & p4 & p8)
            )
            second = (
                ~(p4 & p6 & p8)
                if step == 0
                else ~(p2 & p6 & p8)
            )
            remove = (
                result
                & (count >= 2)
                & (count <= 6)
                & (transitions == 1)
                & first
                & second
            )
            if remove.any():
                result[remove] = False
                changed = True
        if not changed:
            return result


def frame_from_image(image, columns, rows):
    image = crop_subject(image)
    blurred = image.filter(ImageFilter.GaussianBlur(0.7))
    pixels = np.asarray(blurred).astype(np.float32)
    gradient_y, gradient_x = np.gradient(pixels, axis=(0, 1))
    magnitude = np.sqrt((
        gradient_x * gradient_x + gradient_y * gradient_y
    ).sum(axis=2))
    edges = magnitude > np.percentile(magnitude, 94)
    edges = ndimage.binary_opening(edges, iterations=1)
    edges = thin_edges(edges)

    coverage = np.asarray(Image.fromarray(
        edges.astype(np.uint8) * 255,
    ).resize((columns, rows), Image.Resampling.BOX)).astype(np.float32) / 255
    edge_mask = coverage > 0.004
    values = coverage[edge_mask]
    levels = np.ones(coverage.shape, dtype=int)
    if len(values):
        low, high = np.percentile(values, [5, 95])
        levels[edge_mask] = np.clip(
            np.rint(
                (values - low)
                / max(high - low, 1e-6)
                * (len(EDGE_RAMP) - 1),
            ),
            1,
            len(EDGE_RAMP) - 1,
        ).astype(int)

    glyphs = np.where(
        edge_mask,
        np.vectorize(lambda level: EDGE_RAMP[level])(levels),
        " ",
    )
    grayscale = np.asarray(ImageOps.grayscale(image)).astype(np.float32) / 255
    tone = np.asarray(Image.fromarray(
        np.uint8(np.clip((0.86 - grayscale) / 0.58, 0, 1) * 255),
    ).resize((columns, rows), Image.Resampling.BOX)).astype(np.float32) / 255

    tone_order = np.argsort(
        np.where(edge_mask, -1, tone).ravel(),
    )[::-1][:120]
    for cell in tone_order:
        row, column = divmod(int(cell), columns)
        if tone[row, column] < 0.18:
            continue
        if tone[row, column] < 0.25:
            glyphs[row, column] = "."
        elif tone[row, column] < 0.33:
            glyphs[row, column] = ":"
        else:
            glyphs[row, column] = "-"

    return "\n".join(
        "".join(row).rstrip()
        for row in glyphs
    ) + "\n"


def output_name(path):
    match = re.fullmatch(r"rabbit-(\d+)-(.+)\.jpg", path.name, re.IGNORECASE)
    if not match:
        return f"{path.stem}.txt"
    slug = OUTPUT_SLUGS.get(match.group(2), match.group(2))
    return f"{int(match.group(1)):02d}-{slug}.txt"


def main():
    parser = ArgumentParser()
    parser.add_argument(
        "--source",
        type=Path,
        default=Path("content/en/post/drawn-little-rabbits"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("assets/usagi-ascii-generated"),
    )
    parser.add_argument("--columns", type=int, default=80)
    parser.add_argument("--rows", type=int, default=43)
    args = parser.parse_args()

    images = [
        image
        for image in sorted(args.source.glob("*.jpg"))
        if image.stem.removeprefix("rabbit-").split("-", 1)[-1]
        not in EXCLUDED_SOURCE_SLUGS
    ]
    if not images:
        raise SystemExit(f"No JPG sources found in {args.source}")

    args.output.mkdir(parents=True, exist_ok=True)
    expected = {output_name(image) for image in images}
    for stale in args.output.glob("[0-9][0-9]-*.txt"):
        if stale.name not in expected:
            stale.unlink()

    for image_path in images:
        frame = frame_from_image(
            Image.open(image_path).convert("RGB"),
            args.columns,
            args.rows,
        )
        (args.output / output_name(image_path)).write_text(frame)
        print(args.output / output_name(image_path))


if __name__ == "__main__":
    main()
