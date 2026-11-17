const pool = require("../db/pool");

// Transforma o objeto animal na lista de valores. Fica em uma função só para não repetir a lista em criar e atualizar.
function valoresDoAnimal(a) {
  return [a.nome, a.especie, a.raca, a.sexo, a.idade, a.peso, a.tutor_id];
}

async function listar() {
  const { rows } = await pool.query("SELECT * FROM animal ORDER BY nome");
  return rows;
}

// Animais de um tutor específico (tela "animais do tutor")
async function listarPorTutor(tutorId) {
  const { rows } = await pool.query(
    "SELECT * FROM animal WHERE tutor_id = $1 ORDER BY nome",
    [tutorId]
  );
  return rows;
}

async function buscarPorId(id) {
  const { rows } = await pool.query("SELECT * FROM animal WHERE id = $1", [id]);
  return rows[0]; // undefined se não existir
}

async function criar(animal) {
  const { rows } = await pool.query(
    `INSERT INTO animal (nome, especie, raca, sexo, idade, peso, tutor_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    valoresDoAnimal(animal)
  );
  return rows[0];
}

async function atualizar(id, animal) {
  const { rows } = await pool.query(
    `UPDATE animal
        SET nome = $1, especie = $2, raca = $3, sexo = $4, idade = $5, peso = $6, tutor_id = $7
      WHERE id = $8
      RETURNING *`,
    [...valoresDoAnimal(animal), id]
  );
  return rows[0];
}

async function excluir(id) {
  await pool.query("DELETE FROM animal WHERE id = $1", [id]);
}


module.exports = { listar, listarPorTutor, buscarPorId, criar, atualizar, excluir };