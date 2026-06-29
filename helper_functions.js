const { InferenceClient } = require("@huggingface/inference");
const client = new InferenceClient(process.env.HF_TOKEN);
const path = require("path");
const fs = require("fs");

async function generarImagen(prompt) {
  const image = await client.textToImage({
    provider: "fal-ai",
    model: "krea/Krea-2-Turbo",
    inputs: prompt,
    parameters: {
      num_inference_steps: 8,
    },
  });

  const buffer = Buffer.from(await image.arrayBuffer());

  const filename = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}.png`;

  const filepath = path.join(__dirname, "cinegen-images", filename);

  fs.writeFileSync(filepath, buffer);

  return filename;
}

async function generarPromptImagen(textoEscena) {
  console.log("generando prompt de imagen");
  const agent_profile = `# PERFIL DE AGENTE: DIRECTOR DE ARTE DE FONDOS

## ROL
Eres un Director de Arte y Prompt Engineer experto. Tu objetivo es convertir diálogos de video en prompts de fondos altamente estéticos y cinemáticos para Midjourney o DALL-E 3.

## FORMATO DE RESPUESTA
Prompt Listo para Copiar (en Inglés)
responde en 50 palabras y no tardes en responder
dialogo a convertir en prompt: 

`;

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY_2}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
        messages: [
          {
            role: "user",
            content: agent_profile + textoEscena,
          },
        ],
      }),
    },
  );

  const data = await response.json();
  console.log("prompt: ", data.choices[0].message.content);
  return data.choices[0].message.content;
}

/*
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const agent_profile = `# AGENT PROFILE: ART DIRECTOR FOR BACKGROUND PROMPTS

## ROLE & OBJECTIVE
You are a Cinematic Art Director and Expert Prompt Engineer. Your core mission is to analyze a short video script or dialogue and create a highly detailed, visually striking background prompt. This prompt will be used in image generation tools (like Midjourney, DALL-E 3, or Stable Diffusion) to create the backdrop of the scene.

## INSTRUCTIONS FOR ANALYSIS
When the user provides a dialogue or scene context, follow these strict steps:
1. Identify the Mood: Extract the emotional tone (e.g., corporate professional, dystopian sci-fi, cozy romance, intense suspense).
2. Deduce the Location: Determine where this conversation naturally takes place based on the text.
3. Translate to Visuals: Convert the characters' words or situation into specific environmental details, textures, and architecture.

## PROMPT GENERATION RULES
* Exclude Characters: Focus purely on the environment, scenery, and background objects. Do NOT include people.
* Language: Always write the final prompt in English for maximum AI compatibility.
* Depth & Quality: Incorporate cinematic keywords to add depth (e.g., cinematic lighting, high-end photography, 8k, photorealistic, depth of field).
* Aspect Ratio: Default to widescreen ratio ("--ar 16:9" or aspect ratio 16:9) unless requested otherwise.

## OUTPUT FORMAT
Provide your response using this exact structure:

### 1. Scene Analysis
* **Location & Concept:** [Brief description of the place]
* **Color Palette & Lighting:** [Dominant colors and lighting style]
* **Atmosphere:** [The psychological vibe of the room/environment]

### 2. Ready-to-Use Prompt
[Copy-pasteable English prompt containing: Subject background description, art/photographic style, specific camera lens/angle, lighting setup, and aspect ratio parameters]

this is the dialogue: 
`;
    const imagen_de_escena = agent_profile + prompt;

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
      "PROMPT PARA IMAGEN: ",
      data.choices[0].message.content,
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Error al consultar ia de prompts para imagenes de escenas",
    });
  }
});
*/
module.exports = {
  generarImagen,
  generarPromptImagen,
};
