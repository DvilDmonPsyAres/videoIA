require("dotenv").config();

const { procesarDialogo } = require("./escenes_generator");
const express = require("express");
const { InferenceClient } = require("@huggingface/inference");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
const client = new InferenceClient(process.env.HF_TOKEN);
const {
  crearProyectoVideo,
  obtenerEscenas,
  actualizarImagenEscena,
} = require("./db-model.js");
const { generarImagen, generarPromptImagen } = require("./helper_functions.js");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  console.log("posteaando IA");
  try {
    const { prompt } = req.body;

    const agent_profile = `
    Eres un guionista experto en videos virales (TikTok, Reels, YouTube) y psicología de la audiencia. Tu única tarea es transformar la idea del usuario en un diálogo puro, diseñado para ser narrado, altamente atractivo y optimizado para ganar seguidores.

    REGLAS DE FORMATO CRÍTICAS:
    1. Devuelve SOLAMENTE las palabras exactas que el narrador va a decir.
    2. NUNCA incluyas acotaciones, descripciones de escenas, nombres de personajes ni subtítulos (ej. No pongas "Narrador:", ni "[Música]").
    3. Si el usuario te da contexto visual, conviértelo en palabras habladas de forma orgánica.

    ESTRUCTURA DE RETENCIÓN OBLIGATORIA (Aplica esto al diálogo):
    - EL GANCHO (Primeros 3 segundos): Empieza directo con una frase impactante, una pregunta contraintuitiva o un secreto revelado. NUNCA saludes ni digas "Hola a todos" o "En este video...".
    - EL RITMO (Cuerpo): Usa frases cortas, dinámicas y de alto impacto emocional. Elimina el relleno. Usa palabras que generen curiosidad (ej. "Lo que nadie te dice", "El error que cometes").
    - LA LLAMADA A LA ACCIÓN (Cierre): Termina con un cierre que invite a seguir la cuenta de forma orgánica y fluida, justificando el valor (ej. "Si quieres dominar esto antes que el resto, ya sabes qué hacer", "Sígueme para la parte dos").
    
    TAMBIEN GENERARAS UN PROMPT PARA UNA IA GENERADORA DE IMAGENES PARA LA IMAGEN DE FONDO DE LA ESCENAS POR CADA 18 PALABRAS DE DIALOGO.
    TU RESPUESTA, DEBEN SER IMAGENES CON ESTANDARES PROFESIONALES Y DEBES ENTREGAR TU RESPUESTA EN ESTE FORMATO JSON VALIDO: 
{
  "dialogo": "...",
  "escenas": [
    {
      "texto": "¿Qué pasaría si tus miedos fueran solo interpretaciones?",
      "prompt": "..."
    },
    {
      "texto": "El miedo nace cuando crees que el futuro te controla.",
      "prompt": "..."
    }
  ]
}
    idea del usuario: 
    `;
    const dialogue = agent_profile + prompt;
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
          messages: [
            {
              role: "user",
              content: dialogue,
            },
          ],
        }),
      },
    );

    const data = await response.json();
    console.log(response.status);
    console.log(data);
    console.log(
      "data.choices[0].message.content: ",
      data.choices[0].message.content,
    );

    console.log(
      "tipo de dato de respuesta IA",
      typeof data.choices[0].message.content,
    );
    const promptEscenas = JSON.parse(data.choices[0].message.content);
    console.log("prompt escenas ", promptEscenas);
    let escenas = procesarDialogo(promptEscenas.escenas);

    console.log("escenas", escenas);
    /*
    for (let i = 0; i < promptEscenas.escenas.length; i++) {
      escenas[i].promptVideo = promptEscenas.escenas[i].prompt;
    }
*/
    console.log("iniciando crear proyecto");
    console.log("escenas despues de crear prompt: ", escenas);

    const proyecto = await crearProyectoVideo({
      titulo: prompt,
      texto: promptEscenas.dialogo,
      escenas,
    });
    console.log("crear proyecto terminado");
    res.json({
      videoId: proyecto.videoId,
      respuesta: promptEscenas.dialogo,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Error al consultar la IA",
    });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/image_gen", async (req, res) => {
  try {
    const { videoId } = req.body;

    const escenas = await obtenerEscenas(videoId);

    const imagenes = [];

    for (const escena of escenas) {
      console.log("escena testing: ", escena);
      const response = await fetch("https://openrouter.ai/api/v1/images", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sourceful/riverflow-v2.5-fast",
          prompt: escena.texto,
        }),
      });

      const result = await response.json();
      console.log("result:  ", result);
      if (!result.data || result.data.length === 0) {
        continue;
      }

      const base64 = result.data[0].b64_json;

      const filename = `video_${videoId}_escena_${escena.numero}.png`;

      const filepath = path.join(__dirname, "cinegen-images", filename);

      fs.writeFileSync(filepath, Buffer.from(base64, "base64"));

      await actualizarImagenEscena(escena.id, filename);

      imagenes.push({
        escena: escena.numero,
        archivo: filename,
      });

      console.log(`Escena ${escena.numero} generada`);
    }

    res.json({
      ok: true,
      total: imagenes.length,
      imagenes,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
