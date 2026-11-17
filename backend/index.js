require("dotenv").config();

const express = require("express");
const pool = require("./pool");
const tutorRepository = require("./repositories/tutorRepository");
const animalRepository = require("./repositories/animalRepository");

const app = express();
app.use(express.json()); // vai precisar quando criar as rotas POST/PUT

app.get("/", (req, res) => {
  res.json({ message: "Funcionando!" });
});

// Testa só a conexão com o banco
app.get("/teste-banco", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() AS agora");
    res.json({ ok: true, agora: rows[0].agora });
  } catch (err) {
    res.status(500).json({ ok: false, erro: err.message });
  }
});

// Testa os repositórios (temporário, apague depois)
app.get("/teste-repos", async (req, res) => {
  try {
    res.json({
      tutores: await tutorRepository.listar(),
      animais: await animalRepository.listar(),
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Back rodando na porta ${port}`));