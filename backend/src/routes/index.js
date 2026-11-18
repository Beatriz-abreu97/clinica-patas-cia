const fs = require("fs");
const path = require("path");
const { Router } = require("express");
const YAML = require("yaml");
const swaggerUi = require("swagger-ui-express");
const pacote = require("../../package.json");
const { criarTutorRoutes } = require("./tutorRoutes");
const { criarAnimalRoutes } = require("./animalRoutes");

const spec = YAML.parse(fs.readFileSync(path.resolve(__dirname, "../../openapi.yaml"), "utf8"));

function criarRotas({ db, tutorService, animalService }) {
  const rotas = Router();

  rotas.get("/", (req, res) => {
    res.json({
      servico: "Clínica Patas & Cia — API",
      versao: pacote.version,
      commit: process.env.RENDER_GIT_COMMIT || "local",
      contratos: "backend/API.md",
    });
  });

  rotas.get("/health", async (req, res) => {
    try {
      await db.query("SELECT 1");
      res.json({ status: "ok", banco: "ok" });
    } catch (erro) {
      console.error("Health check: banco indisponível:", erro.message);
      res.status(503).json({ status: "degradado", banco: "indisponivel" });
    }
  });

  rotas.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  rotas.get("/api-docs.json", (req, res) => res.json(spec));

  rotas.use("/api/tutores", criarTutorRoutes({ tutorService }));
  rotas.use("/api/animais", criarAnimalRoutes({ animalService }));

  return rotas;
}

module.exports = { criarRotas };
