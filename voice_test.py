import asyncio
import edge_tts
import os

# Texto de entrada (puedes cargarlo desde archivo también)
texto = """
El talento impresiona por un momento.
La disciplina construye una vida.

Los ganadores no esperan motivación.
Actúan incluso cuando nadie los observa.

Mientras otros buscan inspiración...
ellos cumplen sin excusas.
"""

# Configuración de voz
VOICE = "es-MX-DaliaNeural"
OUTPUT_DIR = "audios"

# Crear carpeta de salida
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Separar por párrafos
parrafos = [p.strip() for p in texto.split("\n") if p.strip()]

async def generar_audio(parrafo, index):
    filename = f"{OUTPUT_DIR}/{index:03d}.mp3"
    
    communicate = edge_tts.Communicate(
        parrafo,
        VOICE
    )
    
    await communicate.save(filename)
    print(f"Generado: {filename}")

async def main():
    tasks = []
    
    for i, parrafo in enumerate(parrafos, start=1):
        tasks.append(generar_audio(parrafo, i))
    
    await asyncio.gather(*tasks)

asyncio.run(main())