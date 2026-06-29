const { procesarDialogo } = require("./escenes_generator");
const { crearProyectoVideo, obtenerEscenas } = require("./db-model.js");

let escenas = {
  dialogo:
    "¿Sabes por qué el éxito te asusta más que el fracaso? Porque la verdadera prueba no es llegar, es mantenerte. La mayoría celebra el logro y se duerme. El estoicismo dice: el obstáculo es el camino. Cada caída es entrenamiento disfrazado. El desafío no es el éxito, es la constancia. Si buscas la gloria sin esfuerzo, te perderás en la ilusión. La virtud se forja en la adversidad, no en la comodidad. Acepta el reto, porque allí reside tu grandeza y tu alma crecerá cada día con valentía y fortaleza.",
  escena1:
    "A lone figure standing on a cliff edge at sunrise, looking at a distant horizon, representing doubt about success",
  escena2:
    "A crowd celebrating a trophy while a calm philosopher watches, symbolizing fleeting joy and stoic wisdom",
  escena3:
    "A rugged path turning into a solid road with broken stones, illustrating training through setbacks and perseverance",
  escena4:
    "A silhouette of a person climbing a steep mountain under a bright sky, showing effort and emerging virtue",
  escena5:
    "A hand reaching toward a glowing horizon, symbolizing acceptance of challenge and personal greatness",
};

console.log(procesarDialogo(escenas.dialogo));
