-- Dados de demonstração para desenvolvimento e para as capturas de tela.
-- NÃO executar em produção. Pode rodar mais de uma vez? Não: os INSERTs
-- geram novos registros. Rode apenas em um banco vazio.

INSERT INTO tutor (nome, telefone, email, cep, logradouro, numero, complemento, bairro, cidade, uf) VALUES
('Beatriz Abreu', '85990000000', 'anabeatriz.abreu@gmail.com', '60000000', 'Rua Teste', '100', 'BL A', 'Aldeota', 'Fortaleza', 'CE'),
('Carlos Menezes', '8532221100', 'carlos.menezes@email.com', '60120000', 'Av. Beira Mar', '2500', NULL, 'Meireles', 'Fortaleza', 'CE');

INSERT INTO animal (nome, especie, raca, sexo, idade, peso, tutor_id) VALUES
('Clarke', 'Gato', 'SRD', 'F', 6, 5.2, 1),
('Romeu', 'Gato', 'SRD', 'M', 9, 5.5, 1),
('Matilda', 'Gato', 'SRD', 'F', 8, 5.0, 1),
('Thor', 'Cão', 'Labrador', 'M', 3, 28.4, 2);
