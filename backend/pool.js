    // importa o pool do pacote pg
    const { Pool } = require("pg");
    //cria o pool de conexões
    const pool = new Pool ({
    // Endereço do banco (o link do Session Pooler do Supabase)
        connectionString: process.env.CONNECTION_STRING
    });
    //exporta o pool para que os repositores possam usá-lo
    module.exports = pool;