-- criação da tabela tutor
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

-- criação da tabela animal
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
    
    -- Impede a exclusão de um tutor que ainda tenha animais vinculados
    CONSTRAINT fk_animal_tutor 
        FOREIGN KEY (tutor_id) 
        REFERENCES tutor(id) 
        ON DELETE RESTRICT
);

-- Dados iniciais para teste
INSERT INTO tutor (nome, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, uf) VALUES 
('Beatriz Abreu', '(85) 9900-0000', 'anabeatriz.abreu@gmail.com', '60000-000', 'Rua Teste', '100', 'BL A', 'Aldeota', 'Fortaleza', 'CE');

INSERT INTO animal (nome, especie, raca, sexo, idade, peso, tutor_id) values
('Clarke', 'Felino', 'SRD', 'F', 6, 5.2, 1);

INSERT INTO animal (nome, especie, raca, sexo, idade, peso, tutor_id) values
('Romeu', 'Felino', 'SRD', 'M', 9, 5.5, 1);

INSERT INTO animal (nome, especie, raca, sexo, idade, peso, tutor_id) values
('Matilda', 'Felino', 'SRD', 'F', 8, 5.0, 1);