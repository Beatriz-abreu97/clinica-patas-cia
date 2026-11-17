const pool = require("../pool");

// Transforma o objeto tutor na lista de valores. Fica em uma função só para não repetir a lista em criar e atualizar.
function valoresDoTutor(t) {
  return [t.nome, t.telefone, t.email, t.cep, t.logradouro,
          t.numero, t.complemento, t.bairro, t.cidade, t.uf];
}

async function listar() {
  const { rows } = await pool.query("SELECT * FROM tutor ORDER BY nome");
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await pool.query("SELECT * FROM tutor WHERE id = $1", [id]);
  return rows[0]; // undefined se não existir
}

async function criar(tutor) {
  const { rows } = await pool.query(
    `INSERT INTO tutor (nome, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, uf)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    valoresDoTutor(tutor)
  );
  return rows[0];
}

async function atualizar(id, tutor) {
  const { rows } = await pool.query(
    `UPDATE tutor
        SET nome = $1, telefone = $2, email = $3, cep = $4, logradouro = $5,
            numero = $6, complemento = $7, bairro = $8, cidade = $9, uf = $10
      WHERE id = $11
      RETURNING *`,
    [...valoresDoTutor(tutor), id]
  );
  return rows[0];
}

async function excluir(id) {
  await pool.query("DELETE FROM tutor WHERE id = $1", [id]);
}

// Informa se o tutor ainda tem animais vinculados
async function possuiAnimais(id) {
  const { rows } = await pool.query(
    "SELECT EXISTS (SELECT 1 FROM animal WHERE tutor_id = $1) AS existe",
    [id]
  );
  return rows[0].existe;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, possuiAnimais };