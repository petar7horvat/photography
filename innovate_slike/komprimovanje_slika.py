import os
from PIL import Image

def compress_images(input_folder=".", output_folder="nove", quality=70, max_width=1500):
    # Kreiraj izlazni folder ako ne postoji
    os.makedirs(output_folder, exist_ok=True)
    
    # Ucitaj sve slike u folderu sa podrzanim ekstenzijama
    image_extensions = (".JPG", ".jpg", ".PNG", ".png")
    images = [f for f in os.listdir(input_folder) if f.endswith(image_extensions)]
    
    for index, img_name in enumerate(images, start=1):
        img_path = os.path.join(input_folder, img_name)
        new_img_name = f"{index}.jpg"
        new_img_path = os.path.join(output_folder, new_img_name)
        
        with Image.open(img_path) as img:
            img = img.convert("RGB")  # Konvertujemo u RGB zbog JPG formata
            
            # Promeni veličinu ako je veća od max_width
            width, height = img.size
            if width > max_width:
                new_height = int((max_width / width) * height)
                img = img.resize((max_width, new_height), Image.LANCZOS)
            
            # Sacuvaj sliku sa kompresijom
            img.save(new_img_path, "JPEG", quality=quality)
            print(f"Obrađena slika: {new_img_path}")
    
    print("Završeno!")

if __name__ == "__main__":
    compress_images()
