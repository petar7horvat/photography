from pathlib import Path
from PIL import Image

ROOT = Path("slike")
MAX_SIZE = 1200

EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

for src in ROOT.rglob("*"):
    if not src.is_file():
        continue
    if src.suffix.lower() not in EXTENSIONS:
        continue
    if "thumbs" in src.parts:
        continue

    thumbs_dir = src.parent / "thumbs"
    dst = thumbs_dir / src.name

    try:
        with Image.open(src) as img:
            img.thumbnail((MAX_SIZE, MAX_SIZE), Image.Resampling.LANCZOS)

            thumbs_dir.mkdir(exist_ok=True)

            # PNG ostaje PNG, JPG ostaje JPG itd.
            if src.suffix.lower() in {".jpg", ".jpeg"}:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                img.save(dst, quality=85, optimize=True)
            elif src.suffix.lower() == ".png":
                img.save(dst, optimize=True)
            else:
                img.save(dst, optimize=True)

            print(f"{src} -> {dst}")

    except Exception as e:
        print(f"GREŠKA: {src}: {e}")
