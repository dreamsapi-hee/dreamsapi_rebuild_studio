from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "assets" / "characters" / "nav-icons"

SOURCES = {
    "sodi": ROOT / "public" / "assets" / "characters" / "sodi" / "sodi-icon.png",
    "kidi": ROOT / "public" / "assets" / "characters" / "kidi" / "kidi-icon.png",
    "rodi": ROOT / "public" / "assets" / "characters" / "rodi" / "rodi-icon.png",
    "writi": ROOT / "public" / "assets" / "characters" / "writi" / "writi-icon.png",
    "bizi": ROOT / "public" / "assets" / "characters" / "bizi" / "bizi-icon.png",
    "multi": ROOT / "public" / "assets" / "characters" / "multi" / "multi-icon.png",
    "cheki": ROOT / "public" / "assets" / "characters" / "cheki" / "cheki-icon.png",
}

CANVAS_SIZE = 256
TARGET_MAX_SIDE = 218
ALPHA_VISIBLE_THRESHOLD = 8


def normalize_icon(name: str, source: Path) -> tuple[str, tuple[int, int], tuple[int, int]]:
    image = Image.open(source).convert("RGBA")
    alpha_mask = image.getchannel("A").point(lambda pixel: 255 if pixel >= ALPHA_VISIBLE_THRESHOLD else 0)
    bbox = alpha_mask.getbbox()
    if not bbox:
        raise ValueError(f"No visible pixels found: {source}")

    cropped = image.crop(bbox)
    visible_width, visible_height = cropped.size
    scale = TARGET_MAX_SIDE / max(visible_width, visible_height)
    resized_width = max(1, round(visible_width * scale))
    resized_height = max(1, round(visible_height * scale))
    resized = cropped.resize((resized_width, resized_height), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (CANVAS_SIZE, CANVAS_SIZE), (0, 0, 0, 0))
    x = (CANVAS_SIZE - resized_width) // 2
    y = (CANVAS_SIZE - resized_height) // 2
    canvas.alpha_composite(resized, (x, y))

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    output = OUT_DIR / f"{name}-nav.png"
    canvas.save(output, optimize=True)
    return output.name, image.size, canvas.size


def main() -> None:
    for name, source in SOURCES.items():
        output_name, original_size, canvas_size = normalize_icon(name, source)
        print(f"{name}: {original_size[0]}x{original_size[1]} -> {output_name} {canvas_size[0]}x{canvas_size[1]}")


if __name__ == "__main__":
    main()
