import os
from PIL import Image

# Definisanje foldera
input_folder = os.path.dirname(os.path.abspath(__file__))  # Folder gde je skripta
output_folder = os.path.join(input_folder, 'komprimovano')

# Pravljenje izlaznog foldera ako ne postoji
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Funkcija za kompresiju slike
def compress_image(image_path, output_path, max_width=1500, quality=70):
    with Image.open(image_path) as img:
        if img.width > max_width:
            aspect_ratio = img.height / img.width
            new_height = int(max_width * aspect_ratio)
            img = img.resize((max_width, new_height), Image.ANTIALIAS)
        img.save(output_path, "JPEG", quality=quality)

# Filtriranje slika po ekstenzijama
valid_extensions = ('.jpg', '.JPG', '.png', '.PNG')
image_files = [f for f in os.listdir(input_folder) if f.endswith(valid_extensions)]

# Sortiranje slika da bi imale redosled pri imenovanju
image_files.sort()

# Iteracija kroz slike i obrada
for idx, filename in enumerate(image_files, start=1):
    file_path = os.path.join(input_folder, filename)
    output_filename = f"{idx:02d}.jpg"
    output_path = os.path.join(output_folder, output_filename)
    compress_image(file_path, output_path)

print(f"Sve slike su kompresovane i sačuvane u folderu {output_folder}.")
