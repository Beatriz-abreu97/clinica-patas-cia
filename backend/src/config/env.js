const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), quiet: true });

const { z } = require("zod");

const esquema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string({ message: "DATABASE_URL é obrigatória." }).min(1, { message: "DATABASE_URL é obrigatória." }),
  CORS_ORIGINS: z.string().default("http://localhost:5173"),
});

const resultado = esquema.safeParse(process.env);

if (!resultado.success) {
  console.error("Configuração de ambiente inválida. Verifique o arquivo backend/.env (use .env.example como base).");
  for (const problema of resultado.error.issues) {
    console.error(`  - ${problema.path.join(".") || "env"}: ${problema.message}`);
  }
  process.exit(1);
}

if (!/^postgres(ql)?:\/\//.test(resultado.data.DATABASE_URL)) {
  console.error("DATABASE_URL deve começar com postgresql:// (use a string do Session Pooler do Supabase).");
  process.exit(1);
}

const origens = resultado.data.CORS_ORIGINS.split(",")
  .map((origem) => origem.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const env = Object.freeze({
  NODE_ENV: resultado.data.NODE_ENV,
  PORT: resultado.data.PORT,
  DATABASE_URL: resultado.data.DATABASE_URL,
  CORS_ORIGINS: origens,
});

module.exports = env;
