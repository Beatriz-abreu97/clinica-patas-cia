const env = require("./config/env");
const pool = require("./db/pool");
const { criarApp } = require("./app");

const app = criarApp({ db: pool, corsOrigins: env.CORS_ORIGINS });

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
