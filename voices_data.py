"""
import asyncio
import edge_tts
from pprint import pprint

async def main():
    voices = await edge_tts.list_voices()

    for voice in voices:
        if voice.get('Locale', '').startswith('es'):
            pprint(voice)
            print("-" * 80)

asyncio.run(main())
"""
import asyncio
import edge_tts

TEXTO_PRUEBA = "Hola, esta es una prueba de audio para evaluar la calidad de esta voz."

async def probar_voces_espanol():
    # 1. Obtener la lista completa de voces disponibles
    todas_las_voces = await edge_tts.list_voices()
    
    # 2. Filtrar únicamente las voces en español (es-MX, es-ES, es-AR, etc.)
    voces_espanol = [v for v in todas_las_voces if v["Locale"].startswith("es")]
    
    print(f"Se encontraron {len(voces_espanol)} voces en español. Iniciando descargas...")

    for voz in voces_espanol:
        short_name = voz["ShortName"]  # Ejemplo: 'es-MX-DaliaNeural'
        nombre_archivo = f"{short_name}.mp3"
        
        print(f"Generando audio con: {short_name}...")
        
        try:
            # 3. Configurar el texto y la voz correspondiente
            communicate = edge_tts.Communicate(TEXTO_PRUEBA, short_name)
            
            # 4. Guardar el archivo directamente usando el ShortName
            await communicate.save(nombre_archivo)
            
        except Exception as e:
            print(f"Error con la voz {short_name}: {e}")

    print("\n¡Proceso finalizado! Revisa tu carpeta para escuchar los archivos .mp3 creados.")

# Ejecutar el proceso asíncrono
asyncio.run(probar_voces_espanol())
