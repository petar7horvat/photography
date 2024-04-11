import os

def rename_images(directory):
    # Prolazak kroz sve fajlove u direktorijumu
    for index, filename in enumerate(os.listdir(directory)):
        # Provera da li je fajl slika
        if filename.endswith(".jpg") or filename.endswith(".jpeg") or filename.endswith(".png"):
            # Formiranje novog imena
            new_filename = str(index + 1) + ".jpg"
            # Kreiranje putanje do stare i nove slike
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_filename)
            # Preimenovanje slike
            os.rename(old_path, new_path)
            print(f"Preimenovan fajl: {filename} u {new_filename}")

if __name__ == "__main__":
    # Direktorijum u kojem se nalazi skripta
    current_directory = os.path.dirname(os.path.abspath(__file__))
    # Pozivanje funkcije za preimenovanje slika
    rename_images(current_directory)
