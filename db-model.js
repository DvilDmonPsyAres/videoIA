const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(path.join(__dirname, "videos.db"), (err) => {
  if (err) {
    console.error("Error conectando a la base de datos:", err.message);
  } else {
    console.log("Base de datos conectada.");
  }
});

// Crear tablas
db.serialize(() => {
  db.run(`
        CREATE TABLE IF NOT EXISTS videos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT,
            texto_original TEXT,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

  db.run(`
        CREATE TABLE IF NOT EXISTS escenas(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id INTEGER NOT NULL,
            numero INTEGER NOT NULL,
            texto TEXT NOT NULL,
            inicio REAL DEFAULT 0,
            fin REAL DEFAULT 0,
            duracion REAL DEFAULT 0,
            promptVideo TEXT,
            imagen TEXT,

            FOREIGN KEY(video_id) REFERENCES videos(id)
        )
    `);

  db.run(`
      CREATE TABLE IF NOT EXISTS subtitulos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        video_id INTEGER NOT NULL,
        escena_id INTEGER NOT NULL,

        numero INTEGER NOT NULL,

        texto TEXT NOT NULL,

        inicio REAL NOT NULL,
        fin REAL NOT NULL,

        FOREIGN KEY(video_id)
          REFERENCES videos(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE,

        FOREIGN KEY(escena_id)
          REFERENCES escenas(id)
          ON DELETE CASCADE
          ON UPDATE CASCADE
    )
    `);
});

function crearVideo(titulo, textoOriginal) {
  return new Promise((resolve, reject) => {
    db.run(
      `
            INSERT INTO videos(
                titulo,
                texto_original
            )
            VALUES(?,?)
            `,
      [titulo, textoOriginal],

      function (err) {
        if (err) return reject(err);

        resolve(this.lastID);
      },
    );
  });
}

function guardarEscenas(videoId, escenas) {
  return new Promise((resolve, reject) => {
    const query = `
            INSERT INTO escenas(
                video_id,
                numero,
                texto,
                inicio,
                fin,
                duracion,
                promptVideo
            )
            VALUES(?,?,?,?,?,?,?)
        `;

    db.serialize(() => {
      const stmt = db.prepare(query);

      for (const escena of escenas) {
        stmt.run([
          videoId,
          escena.escena,
          escena.texto,
          escena.inicio,
          escena.fin,
          escena.fin - escena.inicio,
          escena.prompt,
        ]);
      }

      stmt.finalize((err) => {
        if (err) return reject(err);

        resolve();
      });
    });
  });
}

// Función principal
async function crearProyectoVideo({ titulo, texto, escenas }) {
  try {
    console.log("creando videos en db");
    const videoId = await crearVideo(titulo, texto);
    console.log("guardando escenas en db");
    await guardarEscenas(videoId, escenas);
    console.log("retornando desde db model");
    return {
      videoId,
      escenasGuardadas: escenas.length,
    };
  } catch (err) {
    console.log(err);
  }
}

function obtenerEscenas(videoId) {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT *
      FROM escenas
      WHERE video_id = ?
      ORDER BY numero ASC
      `,
      [videoId],
      (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      },
    );
  });
}

function actualizarImagenEscena(id, imagen) {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE escenas
      SET imagen = ?
      WHERE id = ?
      `,
      [imagen, id],
      function (err) {
        if (err) return reject(err);
        resolve();
      },
    );
  });
}

module.exports = {
  crearProyectoVideo,
  obtenerEscenas,
  actualizarImagenEscena,
};
