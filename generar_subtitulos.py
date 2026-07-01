import re

CONECTORES = {
    "y", "e", "o", "u",
    "pero", "porque", "aunque",
    "para", "cuando", "mientras",
    "si", "como", "que", "con",
    "sin", "por"
}


def dividir_texto(texto, max_palabras=4):

    # Primero separar por puntuación
    partes = re.split(r'([.,;:!?])', texto)

    segmentos = []

    actual = ""

    for parte in partes:

        parte = parte.strip()

        if not parte:
            continue

        actual += " " + parte

        if parte in ".,;:!?":
            segmentos.append(actual.strip())
            actual = ""

    if actual.strip():
        segmentos.append(actual.strip())

    resultado = []

    for segmento in segmentos:

        palabras = segmento.split()

        bloque = []

        for palabra in palabras:

            bloque.append(palabra)

            # cortar por conectores si ya llevamos varias palabras
            if (
                palabra.lower() in CONECTORES
                and len(bloque) >= 2
            ):
                resultado.append(" ".join(bloque))
                bloque = []

            elif len(bloque) >= max_palabras:
                resultado.append(" ".join(bloque))
                bloque = []

        if bloque:
            resultado.append(" ".join(bloque))

    return resultado

def generar_subtitulos(texto, inicio, fin):

    bloques = dividir_texto(texto)

    duracion = fin - inicio

    tiempo = duracion / len(bloques)

    resultado = []

    for i, bloque in enumerate(bloques):

        resultado.append({
            "texto": bloque,
            "inicio": round(inicio + i * tiempo, 2),
            "fin": round(inicio + (i + 1) * tiempo, 2)
        })

    return resultado

import sqlite3

DB_PATH = "videos.db"

def generar_subtitulos_video(video_id):

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Opcional: borrar subtítulos anteriores
    cursor.execute(
        "DELETE FROM subtitulos WHERE video_id = ?",
        (video_id,)
    )

    cursor.execute("""
        SELECT id, texto, inicio, fin
        FROM escenas
        WHERE video_id = ?
        ORDER BY numero
    """, (video_id,))

    escenas = cursor.fetchall()

    numero_global = 1

    for escena_id, texto, inicio, fin in escenas:

        subtitulos = generar_subtitulos(texto, inicio, fin)

        for sub in subtitulos:

            cursor.execute("""
                INSERT INTO subtitulos
                (
                    video_id,
                    escena_id,
                    numero,
                    texto,
                    inicio,
                    fin
                )
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                video_id,
                escena_id,
                numero_global,
                sub["texto"],
                sub["inicio"],
                sub["fin"]
            ))

            numero_global += 1

    conn.commit()
    conn.close()

    print(f"✅ Subtítulos generados para el video {video_id}")

if __name__ == "__main__":
    generar_subtitulos_video(1)