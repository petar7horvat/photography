import os
import subprocess

def compress_video(input_path, output_path, quality=0.7, max_width=1500):
    # Kreiraj komandu za ffmpeg
    command = [
        "ffmpeg",
        "-i", input_path,  # Ulazni video
        "-vf", f"scale={max_width}:-1",  # Postavi maksimalnu širinu, visina automatski
        "-b:v", f"{int(quality * 1000)}k",  # Kompresija (70% kvaliteta)
        "-preset", "fast",  # Brza kompresija
        "-c:v", "libx264",  # Video kodek
        "-c:a", "aac",  # Audio kodek
        "-strict", "experimental",  # Potrebno za neki audio kodek
        output_path  # Ispisni fajl
    ]
    
    # Pokreni ffmpeg komandu
    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

def process_videos():
    # Uzmi trenutni folder gde je skripta
    input_folder = os.path.dirname(os.path.realpath(__file__))
    output_folder = os.path.join(input_folder, 'nove')
    
    # Ako folder "nove" ne postoji, napravi ga
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Nabavi sve video fajlove iz trenutnog foldera
    video_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.avi', '.mp4'))]
    
    for idx, video_file in enumerate(video_files, start=1):
        input_path = os.path.join(input_folder, video_file)
        output_path = os.path.join(output_folder, f"{idx}.mp4")
        
        # Kompresuj video i sačuvaj u novi folder
        compress_video(input_path, output_path)
        print(f"Video {video_file} kompresovan i sačuvan kao {idx}.mp4")

# Pokreni proces
process_videos()
