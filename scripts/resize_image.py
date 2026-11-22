import base64
import json
import sys
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


def cool_editorial_tone(image: Image.Image) -> Image.Image:
    image = ImageEnhance.Color(image).enhance(0.88)
    image = ImageEnhance.Contrast(image).enhance(0.97)
    image = ImageEnhance.Brightness(image).enhance(1.02)
    red, green, blue = image.split()
    red = red.point(lambda value: max(0, min(255, round(value * 0.97))))
    blue = blue.point(lambda value: max(0, min(255, round(value * 1.025))))
    return Image.merge("RGB", (red, green, blue))


def main() -> None:
    payload = json.loads(base64.b64decode(sys.argv[1]).decode("utf-8"))
    source = Path(payload["source"])
    output = Path(payload["output"])
    size = (int(payload["width"]), int(payload["height"]))

    with Image.open(source) as original:
        oriented = ImageOps.exif_transpose(original).convert("RGB")
        cropped = ImageOps.fit(oriented, size, method=Image.Resampling.LANCZOS)
        graded = cool_editorial_tone(cropped)
        output.parent.mkdir(parents=True, exist_ok=True)
        graded.save(output, "WEBP", quality=84, method=6)


if __name__ == "__main__":
    main()
