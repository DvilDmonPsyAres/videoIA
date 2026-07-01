import asyncio
import edge_tts
import sqlite3
import os

DB_PATH = "videos.db"
VOICE = "es-MX-DaliaNeural"


async def generar_audio(texto, filename):
    communicate = edge_tts.Communicate(texto.strip(), VOICE)
    await communicate.save(filename)
    print(f"✔ Generado: {filename}")


async def generar_audios_video(video_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT numero, texto
        FROM escenas
        WHERE video_id = ?
        ORDER BY numero ASC
    """, (video_id,))

    escenas = cursor.fetchall()
    conn.close()

    if not escenas:
        print(f"No existen escenas para el video {video_id}")
        return

    # Carpeta: audios/1/, audios/2/, etc.
    output_dir = os.path.join("audios", str(video_id))
    os.makedirs(output_dir, exist_ok=True)

    tasks = []

    for numero_escena, texto in escenas:
        filename = os.path.join(output_dir, f"{numero_escena:03d}.mp3")
        tasks.append(generar_audio(texto, filename))

    await asyncio.gather(*tasks)

    print(f"\n✅ Audios del video {video_id} generados en:")
    print(output_dir)


# Ejemplo
if __name__ == "__main__":
    asyncio.run(generar_audios_video(1))