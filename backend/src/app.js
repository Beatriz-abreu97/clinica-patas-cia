const express = require("express");
const cors = require("cors");

const { criarRotas } = require("./routes");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

// Fábrica do app: recebe suas dependências de fora, como o construtor de um
// bean no Spring. Isso permite testar as rotas com um banco falso.
function criarApp({ db, corsOrigins = [], tutorService, animalService }) {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());

  app.use(criarRotas({ db, tutorService, animalService }));

  // A ordem importa: 404 e erro ficam depois de todas as rotas.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { criarApp };
