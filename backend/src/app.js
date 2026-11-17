const express = require("express");
const cors = require("cors");

const { criarRotas } = require("./routes");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");

function criarApp({ db, corsOrigins = [], tutorService, animalService }) {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json());

  app.use(criarRotas({ db, tutorService, animalService }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { criarApp };
