const express = require("express");
const cors = require("cors");

const { criarRotas } = require("./routes");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");
const { criarLimiteRequisicoes } = require("./middlewares/limiteRequisicoes");

function criarApp({ db, corsOrigins = [], tutorService, animalService, limite } = {}) {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(limite || criarLimiteRequisicoes());
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());

  app.use(criarRotas({ db, tutorService, animalService }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { criarApp };
