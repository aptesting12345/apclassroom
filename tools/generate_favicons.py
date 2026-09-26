"""Generate the raster and ICO versions of the Calculator Readiness mark."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
BLUE = "#2764e7"
WHITE = "#ffffff"


def make_mark(size: int) -> Image.Image:
    scale = size / 512
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        (0, 0, size - 1, size - 1),
        radius=round(112 * scale),
        fill=BLUE,
    )
    points = [
        (355, 118), (355, 180), (230, 180), (309, 256), (230, 332),
        (358, 332), (358, 394), (143, 394), (143, 345), (237, 256),
        (143, 167), (143, 118),
    ]
    draw.polygon([(round(x * scale), round(y * scale)) for x, y in points], fill=WHITE)
    return image


base = make_mark(512)
base.resize((48, 48), Image.Resampling.LANCZOS).save(ROOT / "favicon-48.png")
base.resize((180, 180), Image.Resampling.LANCZOS).save(ROOT / "apple-touch-icon.png")
base.save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
