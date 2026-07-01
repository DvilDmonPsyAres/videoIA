import sqlite3

DB_PATH = "videos.db"


def convertir_tiempo(segundos):
    horas = int(segundos // 3600)
    minutos = int((segundos % 3600) // 60)
    segundos_enteros = int(segundos % 60)
    milisegundos = int(round((segundos - int(segundos)) * 1000))

    # Evitar casos como 1000 ms por redondeo
    if milisegundos == 1000:
        segundos_enteros += 1
        milisegundos = 0

    return f"{horas:02}:{minutos:02}:{segundos_enteros:02},{milisegundos:03}"


def generar_srt(video_id):

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT numero, texto, inicio, fin
        FROM subtitulos
        WHERE video_id = ?
        ORDER BY numero
    """, (video_id,))

    subtitulos = cursor.fetchall()

    conn.close()

    nombre_archivo = f"subtitulos/video_{video_id}.srt"

    with open(nombre_archivo, "w", encoding="utf-8") as f:

        for numero, texto, inicio, fin in subtitulos:

            f.write(f"{numero}\n")
            f.write(f"{convertir_tiempo(inicio)} --> {convertir_tiempo(fin)}\n")
            f.write(f"{texto}\n\n")

    print(f"✅ Archivo generado: {nombre_archivo}")


if __name__ == "__main__":
    generar_srt(1)