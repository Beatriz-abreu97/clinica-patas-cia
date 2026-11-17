const { Router } = require("express");
const pacote = require("../../package.json");

function criarRotas({ db }) {
  const rotas = Router();

  rotas.get("/", (req, res) => {
    res.json({
      servico: "Clínica Patas & Cia — API",
      versao: pacote.version,
      contratos: "backend/API.md",
    });
  });

  // Usado pelo health check do Render e pelo ping que evita a hibernação.
  rotas.get("/health", async (req, res) => {
    try {
      await db.query("SELECT 1");
      res.json({ status: "ok", banco: "ok" });
    } catch (erro) {
      console.error("Health check: banco indisponível:", erro.message);
      res.status(503).json({ status: "degradado", banco: "indisponivel" });
    }
  });

  return rotas;
}

module.exports = { criarRotas };
