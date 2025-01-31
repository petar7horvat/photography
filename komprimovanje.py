import os
from PIL import Image

# Definisanje foldera
input_folder = 'ads'
output_folder = 'ads_kompimovano'

# Pravljenje izlaznog foldera ako ne postoji
if not os.path.exists(output_folder):
    os.makedirs(output_folder)

# Funkcija za kompresiju slike
def compress_image(image_path, output_path, max_width=1500, quality=70):
    # Otvorite sliku
    with Image.open(image_path) as img:
        # Ako je širina veća od max_width, smanji je
        if img.width > max_width:
            # Izračunaj novi proporcionalni visinu
            aspect_ratio = img.height / img.width
            new_height = int(max_width * aspect_ratio)
            img = img.resize((max_width, new_height), Image.ANTIALIAS)
        
        # Spremi sliku sa željenim kvalitetom
        img.save(output_path, quality=quality)

# Iteriraj kroz sve slike u folderu
for filename in os.listdir(input_folder):
    file_path = os.path.join(input_folder, filename)
    if os.path.isfile(file_path):
        # Kreiraj putanju za izlaznu sliku
        output_path = os.path.join(output_folder, filename)
        # Kompresuj sliku
        compress_image(file_path, output_path)

print(f"Sve slike su kompresovane i sačuvane u folderu {output_folder}.")
