const pool = require("../db/pool");

// Transforma o objeto tutor na lista de valores. Fica em uma função só para
// não repetir a lista em criar e atualizar.
function valoresDoTutor(t) {
  return [t.nome, t.telefone, t.email, t.cep, t.logradouro,
          t.numero, t.complemento, t.bairro, t.cidade, t.uf];
}

// A busca é opcional: quando não vem, `$1` é NULL e o WHERE é ignorado.
// O LEFT JOIN conta os animais de cada tutor em uma única consulta (evita N+1).
async function listar(busca) {
  const { rows } = await pool.query(
    `SELECT t.*, COUNT(a.id)::int AS total_animais
       FROM tutor t
       LEFT JOIN animal a ON a.tutor_id = t.id
      WHERE $1::text IS NULL
         OR t.nome ILIKE '%' || $1 || '%'
         OR t.telefone ILIKE '%' || $1 || '%'
      GROUP BY t.id
      ORDER BY t.nome`,
    [busca || null]
  );
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
            numero = $6, complemento = $7, bairro = $8, cidade = $9, uf = $10,
            atualizado_em = NOW()
      WHERE id = $11
      RETURNING *`,
    [...valoresDoTutor(tutor), id]
  );
  return rows[0];
}

async function excluir(id) {
  const { rowCount } = await pool.query("DELETE FROM tutor WHERE id = $1", [id]);
  return rowCount > 0;
}

// Usado pelo service para bloquear a exclusão e montar a mensagem com a contagem.
async function contarAnimais(id) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS total FROM animal WHERE tutor_id = $1",
    [id]
  );
  return rows[0].total;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir, contarAnimais };
