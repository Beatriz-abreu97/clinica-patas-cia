const env = require("./config/env");
const pool = require("./db/pool");
const { criarApp } = require("./app");
const tutorRepository = require("./repositories/tutorRepository");
const animalRepository = require("./repositories/animalRepository");
const { criarTutorService } = require("./services/tutorService");
const { criarAnimalService } = require("./services/animalService");

// Injeção de dependência manual (o equivalente ao construtor do Spring).
const tutorService = criarTutorService({ tutorRepository, animalRepository });
const animalService = criarAnimalService({ animalRepository, tutorRepository });

const app = criarApp({ db: pool, corsOrigins: env.CORS_ORIGINS, tutorService, animalService });

const servidor = app.listen(env.PORT, () => {
  console.log(`API da Clínica Patas & Cia no ar em http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  console.log(`Health check: http://localhost:${env.PORT}/health`);
});

// Render envia SIGTERM ao trocar de versão; fechar o pool evita conexões órfãs.
async function encerrar(sinal) {
  console.log(`\n${sinal} recebido. Encerrando a API...`);
  servidor.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGTERM", () => encerrar("SIGTERM"));
process.on("SIGINT", () => encerrar("SIGINT"));
