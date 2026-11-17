const { Pool } = require("pg");
const env = require("../config/env");

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
});

pool.on("error", (erro) => {
  console.error("Erro inesperado em conexão ociosa do pool:", erro.message);
});

module.exports = pool;
