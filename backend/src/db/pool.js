const { Pool } = require("pg");
const env = require("../config/env");

// O Supabase exige SSL. Em produção usamos o Session Pooler (IPv4), porque a
// conexão direta do plano gratuito é IPv6 e o Render não tem IPv6 de saída.
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30_000,
});

// Sem este listener, um erro em conexão ociosa derruba o processo.
pool.on("error", (erro) => {
  console.error("Erro inesperado em conexão ociosa do pool:", erro.message);
});

module.exports = pool;
