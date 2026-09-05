#!/usr/bin/env python3
"""Build the 53-field P1 microbiology sprite from the teacher PDF.

The source PDF stays outside the public repository. Pages 1-53 each contain
one JPEG field; pages 54-57 are the answer key and are intentionally excluded.
"""

from __future__ import annotations

import argparse
import io
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageOps


EXPECTED_FIELDS = 53
TILE_SIZE = 220
SPRITE_COLUMNS = 7
SPRITE_ROWS = 8
PART_COUNT = 8
BACKGROUND = (244, 246, 248)


def extract_fields(source_pdf: Path, destination: Path) -> list[Path]:
    if shutil.which("pdfimages") is None:
        raise SystemExit("pdfimages (Poppler) is required to extract the teacher fields.")
    subprocess.run(
        ["pdfimages", "-j", str(source_pdf), str(destination / "page")],
        check=True,
    )
    fields = sorted(destination.glob("page-*"))
    if len(fields) != EXPECTED_FIELDS:
        raise SystemExit(
            f"Expected {EXPECTED_FIELDS} embedded question images, found {len(fields)}. "
            "Check that the selected PDF is the authoritative 57-page teacher file."
        )
    return fields


def build_sprite(fields: list[Path]) -> bytes:
    sprite = Image.new(
        "RGB",
        (SPRITE_COLUMNS * TILE_SIZE, SPRITE_ROWS * TILE_SIZE),
        BACKGROUND,
    )
    for index, field_path in enumerate(fields):
        with Image.open(field_path) as source:
            image = ImageOps.exif_transpose(source).convert("RGB")
            tile = ImageOps.pad(
                image,
                (TILE_SIZE, TILE_SIZE),
                method=Image.Resampling.LANCZOS,
                color=BACKGROUND,
                centering=(0.5, 0.5),
            )
        sprite.paste(
            tile,
            ((index % SPRITE_COLUMNS) * TILE_SIZE, (index // SPRITE_COLUMNS) * TILE_SIZE),
        )

    output = io.BytesIO()
    sprite.save(output, "WEBP", quality=55, method=6, lossless=False, exact=True)
    return output.getvalue()


def write_parts(sprite: bytes, output_prefix: Path) -> list[Path]:
    base_size, remainder = divmod(len(sprite), PART_COUNT)
    cursor = 0
    paths = []
    for index in range(PART_COUNT):
        size = base_size + (1 if index < remainder else 0)
        part_path = output_prefix.parent / f"{output_prefix.name}.part{index + 1:02d}"
        part_path.write_bytes(sprite[cursor : cursor + size])
        paths.append(part_path)
        cursor += size
    if cursor != len(sprite):
        raise SystemExit("Internal split error: not every sprite byte was written.")
    return paths


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source_pdf", type=Path)
    parser.add_argument(
        "--output-prefix",
        type=Path,
        default=Path("assets/p1-micro-practica-pdf-sprite-v508"),
    )
    args = parser.parse_args()

    source_pdf = args.source_pdf.resolve()
    if not source_pdf.is_file():
        raise SystemExit(f"Teacher PDF not found: {source_pdf}")
    args.output_prefix.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="med-nykuto-p1-") as temp:
        fields = extract_fields(source_pdf, Path(temp))
        sprite = build_sprite(fields)
    parts = write_parts(sprite, args.output_prefix)

    print(
        f"Built {len(fields)} fields as {SPRITE_COLUMNS * TILE_SIZE}x"
        f"{SPRITE_ROWS * TILE_SIZE} WebP ({len(sprite)} bytes) in {len(parts)} parts."
    )


if __name__ == "__main__":
    main()
