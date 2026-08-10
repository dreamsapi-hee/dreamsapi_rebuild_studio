from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path.cwd()
SOURCE_ROOT = ROOT / "public" / "assets" / "characters"
OUTPUT_ROOT = SOURCE_ROOT / "transparent"
OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

ASSETS = [
    ("sodi", "icon", "sodi/sodi-icon.png", "sodi-icon.png"),
    ("sodi", "default", "sodi/sodi-basic.png", "sodi-default.png"),
    ("sodi", "analyzing", "sodi/sodi-loading.png", "sodi-analyzing.png"),
    ("sodi", "complete", "sodi/sodi-complete.png", "sodi-complete.png"),
    ("kidi", "icon", "kidi/kidi-icon.png", "kidi-icon.png"),
    ("kidi", "default", "kidi/kidi-basic.png", "kidi-default.png"),
    ("kidi", "analyzing", "kidi/kidi-loading.png", "kidi-analyzing.png"),
    ("kidi", "complete", "kidi/kidi-complete.png", "kidi-complete.png"),
    ("rodi", "icon", "rodi/rodi-icon.png", "rodi-icon.png"),
    ("rodi", "default", "rodi/rodi-basic.png", "rodi-default.png"),
    ("rodi", "analyzing", "rodi/rodi-loading.png", "rodi-analyzing.png"),
    ("rodi", "complete", "rodi/rodi-complete.png", "rodi-complete.png"),
    ("writi", "icon", "writi/writi-icon.png", "writi-icon.png"),
    ("writi", "default", "writi/writi-basic.png", "writi-default.png"),
    ("writi", "analyzing", "writi/writi-loading.png", "writi-analyzing.png"),
    ("writi", "complete", "writi/writi-complete.png", "writi-complete.png"),
    ("bizi", "icon", "bizi/bizi-icon.png", "bizi-icon.png"),
    ("bizi", "default", "bizi/bizi-default.png", "bizi-default.png"),
    ("bizi", "analyzing", "bizi/bizi-analyzing.png", "bizi-analyzing.png"),
    ("bizi", "complete", "bizi/bizi-complete.png", "bizi-complete.png"),
    ("multi", "icon", "multi/multi-icon.png", "multi-icon.png"),
    ("multi", "default", "multi/multi_default.png", "multi-default.png"),
    ("multi", "analyzing", "multi/multi_analyzing.png", "multi-analyzing.png"),
    ("multi", "complete", "multi/multi_complete.png", "multi-complete.png"),
    ("cheki", "icon", "cheki/cheki-icon.png", "cheki-icon.png"),
    ("cheki", "default", "cheki/checki-default.png", "cheki-default.png"),
    ("cheki", "analyzing", "cheki/checki-analyzing.png", "cheki-analyzing.png"),
    ("cheki", "complete", "cheki/checki-complete.png", "cheki-complete.png"),
]


def is_background(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, a = pixel
    if a <= 8:
        return True
    mx = max(r, g, b)
    mn = min(r, g, b)
    near_white = mx >= 244 and (mx - mn) <= 14
    very_light_warm = r >= 244 and g >= 238 and b >= 230
    return near_white or very_light_warm


def remove_connected_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    width, height = rgba.size
    pixels = rgba.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
      queue.append((x, 0))
      queue.append((x, height - 1))
    for y in range(height):
      queue.append((0, y))
      queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= width or y >= height:
            continue
        index = y * width + x
        if visited[index]:
            continue
        visited[index] = 1
        if not is_background(pixels[x, y]):
            continue
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        queue.append((x + 1, y))
        queue.append((x - 1, y))
        queue.append((x, y + 1))
        queue.append((x, y - 1))

    return rgba


TARGET_VISIBLE_HEIGHT = {
    "icon": 376,
    "default": 711,
    "analyzing": 711,
    "complete": 711,
}

TARGET_MAX_WIDTH = {
    "icon": 392,
    "default": 760,
    "analyzing": 760,
    "complete": 760,
}


def normalize_canvas(image: Image.Image, role: str) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return image

    left, top, right, bottom = bbox
    width = right - left
    height = bottom - top
    pad = round(max(width, height) * (0.03 if role == "icon" else 0.035))
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)

    cropped = image.crop((left, top, right, bottom))
    canvas_size = 512 if role == "icon" else 1024
    target_height = TARGET_VISIBLE_HEIGHT[role]
    max_width = TARGET_MAX_WIDTH[role]
    scale = min(target_height / height, max_width / width)
    draw_size = (max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale)))
    resized = cropped.resize(draw_size, Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 0))
    x = (canvas_size - draw_size[0]) // 2
    y = (canvas_size - draw_size[1]) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def main() -> None:
    for partner, role, source, output in ASSETS:
        input_path = SOURCE_ROOT / source
        output_path = OUTPUT_ROOT / output
        if not input_path.exists():
            raise FileNotFoundError(input_path)
        image = Image.open(input_path)
        transparent = remove_connected_background(image)
        normalized = normalize_canvas(transparent, role)
        normalized.save(output_path)
        print(f"{partner:6} {role:9} -> {output_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
