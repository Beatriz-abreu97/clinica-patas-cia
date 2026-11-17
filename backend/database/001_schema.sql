-- Schema inicial da Clínica Patas & Cia.
-- Já aplicado no projeto Supabase da equipe.
-- Use este arquivo apenas para recriar o banco do zero (novo projeto/local).

-- Tutores: clientes da clínica.
CREATE TABLE tutor (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    email VARCHAR(120),
    cep VARCHAR(9),
    logradouro VARCHAR(150),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    uf CHAR(2),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Animais: cada animal pertence a um tutor (1:N).
CREATE TABLE animal (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    especie VARCHAR(50) NOT NULL,
    raca VARCHAR(80),
    sexo CHAR(1) NOT NULL CHECK (sexo IN ('M', 'F')),
    idade INT,
    peso DECIMAL(5,2),
    tutor_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Impede a exclusão de um tutor que ainda tenha animais vinculados.
    CONSTRAINT fk_animal_tutor
        FOREIGN KEY (tutor_id)
        REFERENCES tutor(id)
        ON DELETE RESTRICT
);
