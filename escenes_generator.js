function procesarDialogo(escenasIA) {
  let tiempo = 0;

  return escenasIA.map((escena, index) => {
    const palabras = escena.texto.trim().split(/\s+/).length;

    // Aproximadamente 2.5 palabras por segundo
    const duracion = Math.max(2, palabras / 2.5);

    const resultado = {
      escena: index + 1,
      texto: escena.texto,
      prompt: escena.prompt,
      inicio: Number(tiempo.toFixed(2)),
      fin: Number((tiempo + duracion).toFixed(2)),
      duracion: Number(duracion.toFixed(2)),
    };

    tiempo += duracion;

    return resultado;
  });
}

module.exports = {
  procesarDialogo,
};
