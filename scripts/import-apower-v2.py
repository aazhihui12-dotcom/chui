"""Import only the approved display assets; retain source hashes for traceability.

Run with the bundled Python/Pillow runtime:
  python3 scripts/import-apower-v2.py MATERIAL_DIRECTORY GUIDANCE_XLSX
No source files are changed. RAW, PSD, reference screenshots and unrelated
archive material are deliberately not shipped.
"""
import hashlib
import io
import json
import pathlib
import re
import sys
import zipfile
from PIL import Image

materials = pathlib.Path(sys.argv[1])
workbook = pathlib.Path(sys.argv[2])
output = pathlib.Path("public/media/apower/v2")
output.mkdir(parents=True, exist_ok=True)
assets = {}
hash_paths = {}

def save(key, data, archive, source, max_width=1920):
    image = Image.open(io.BytesIO(data))
    image.thumbnail((max_width, 16000), Image.Resampling.LANCZOS)
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "transparency" in image.info else "RGB")
    encoded = io.BytesIO()
    image.save(encoded, "WEBP", quality=86, method=6)
    payload = encoded.getvalue()
    digest = hashlib.sha256(payload).hexdigest()
    src = hash_paths.get(digest)
    if src is None:
        src = "/media/apower/v2/" + key + ".webp"
        (output / (key + ".webp")).write_bytes(payload)
        hash_paths[digest] = src
    assets[key] = {
        "src": src, "width": image.width, "height": image.height,
        "sourceArchive": archive, "sourcePath": source,
        "sourceSha256": hashlib.sha256(data).hexdigest(),
    }

def decoded(info):
    return info.filename if info.flag_bits & 2048 else info.filename.encode("cp437").decode("utf-8")

for archive in ("1.图片更替.zip", "2.APOWER TECH网站物料.zip"):
    with zipfile.ZipFile(materials / archive) as z:
        entries = sorted(((decoded(i), i) for i in z.infolist()
                          if not i.is_dir() and not i.filename.startswith("__MACOSX/")),
                         key=lambda pair: pair[0])
        color_counts = {}
        for name, info in entries:
            parts = pathlib.PurePosixPath(name).parts
            if ".." in parts or name.startswith("/") or pathlib.PurePosixPath(name).name.startswith("."):
                continue
            key = None
            limit = 1920
            if archive.startswith("1."):
                if name.startswith("1.图片更替/首页/2.指引板块/") and name.endswith(".png"):
                    number = int(parts[3][0])
                    key = ["partner-distributor", "partner-brand", "partner-engineer", "partner-online", "partner-referral"][number-1]
                    limit = 1200
                elif name == "1.图片更替/关于/公司介绍/海报.png":
                    key = "company-billboard"
                elif name == "1.图片更替/我们在这里提供帮助-【订单管理板块】/2.jpg":
                    key = "order-phone"
                    limit = 1200
                elif name == "1.图片更替/我们在这里提供帮助-【订单管理板块】/1-01.png":
                    key = "order-status"
                    limit = 1400
            elif name.lower().endswith(".png"):
                if "/首页banner/纯净版/首页/" in name:
                    number = int(re.search(r"banner-(\d)", name).group(1))
                    key = ["hero-brand", "hero-g1", "hero-ar01"][number-1]
                    limit = 2400
                elif "/首页banner/纯净版/产品页/" in name:
                    key = "product-range-banner"
                    limit = 2400
                elif "/产品页/" in name:
                    model = parts[3].lower()
                    if model == "ar-01":
                        model = "ap-ar01"
                    if "/首图/" in name:
                        key = "product-" + model.removeprefix("ap-")
                        limit = 1000
                    elif "/配色图/" in name:
                        color_counts[model] = color_counts.get(model, 0) + 1
                        key = model + "-color-" + str(color_counts[model])
                        limit = 1000
                    elif "/详情图/" in name:
                        number = re.search(r"(?:^|banner-)(\d+)", parts[-1]).group(1)
                        key = model + "-detail-" + number
                        limit = 1920
            if key:
                save(key, z.read(info), archive, name, limit)

with zipfile.ZipFile(workbook) as z:
    save("factory-5s", z.read("xl/media/image103.jpg"), workbook.name,
         "关于!A89 / xl/media/image103.jpg", 1400)
for alias, key in {
    "range-dryers": "product-g1",
    "range-straighteners": "product-h1",
    "range-steamers": "product-ar01",
}.items():
    assets[alias] = assets[key]
pathlib.Path("content/apower-v2-assets.json").write_text(
    json.dumps(assets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("Imported", len(assets), "asset entries;", len(hash_paths), "unique WebP files;",
      round(sum(p.stat().st_size for p in output.glob("*.webp"))/1048576, 2), "MiB")
