/*const textarea = document.getElementById("prompt");

const boton = document.getElementById("btnEnviar");

const respuesta = document.getElementById("respuesta");

async function preguntar() {
  const prompt = textarea.value.trim();

  if (prompt === "") {
    alert("Escribe un prompt.");

    return;
  }

  respuesta.textContent = "Pensando...";

  try {
    const peticion = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        prompt,
      }),
    });

    const datos = await peticion.json();

    respuesta.textContent = datos.respuesta;
  } catch (error) {
    respuesta.textContent = "Ocurrió un error.";

    console.error(error);
  }
}

boton.addEventListener("click", preguntar);

textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    preguntar();
  }
});
*/

const textarea = document.getElementById("prompt");
const boton = document.getElementById("btnEnviar");
const botonImagenes = document.getElementById("btnImagenes");
const respuesta = document.getElementById("respuesta");

// Aquí se guarda la información del último video generado
let proyecto = null;

async function preguntar() {
  const prompt = textarea.value.trim();

  if (prompt === "") {
    alert("Escribe un prompt.");
    return;
  }

  respuesta.textContent = "Pensando...";

  boton.disabled = true;
  botonImagenes.disabled = true;

  try {
    const peticion = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        prompt,
      }),
    });

    const datos = await peticion.json();

    proyecto = datos;

    respuesta.textContent = datos.respuesta;

    botonImagenes.disabled = false;
  } catch (error) {
    respuesta.textContent = "Ocurrió un error.";

    console.error(error);
  }

  boton.disabled = false;
}

async function generarImagenes() {
  if (!proyecto) {
    alert("Primero genera un video.");
    return;
  }

  botonImagenes.disabled = true;
  botonImagenes.textContent = "Generando imágenes...";

  try {
    const peticion = await fetch("/api/image_gen", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        videoId: proyecto.videoId,
      }),
    });

    const datos = await peticion.json();

    console.log(datos);

    alert("Imágenes generadas correctamente.");
  } catch (error) {
    console.error(error);

    alert("Error al generar las imágenes.");
  }

  botonImagenes.disabled = false;
  botonImagenes.textContent = "Generar imágenes";
}

boton.addEventListener("click", preguntar);

botonImagenes.addEventListener("click", generarImagenes);

textarea.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();

    preguntar();
  }
});
