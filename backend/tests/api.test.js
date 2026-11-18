import { describe, it, expect, vi } from "vitest";
import request from "supertest";

import { AppError } from "../src/errors/AppError.js";
import { criarAppDeTeste } from "./helpers.js";

describe("API — infraestrutura", () => {
  it("GET /health responde ok e consulta o banco", async () => {
    const { app, db } = criarAppDeTeste();

    const resposta = await request(app).get("/health");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: "ok", banco: "ok" });
    expect(db.query).toHaveBeenCalled();
  });

  it("GET / informa serviço, versão e commit publicado", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app).get("/");

    expect(resposta.status).toBe(200);
    expect(resposta.body.servico).toContain("Patas");
    expect(resposta.body).toHaveProperty("commit");
  });

  it("rota inexistente responde 404 no formato padrão de erro", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app).get("/nao-existe");

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe("NAO_ENCONTRADO");
    expect(resposta.body.erro.mensagem).toContain("/nao-existe");
  });

  it("JSON malformado responde 400 JSON_INVALIDO", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app)
      .post("/api/tutores")
      .set("Content-Type", "application/json")
      .send("{quebrado");

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe("JSON_INVALIDO");
  });

  it("libera a origem do front no CORS", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app)
      .get("/health")
      .set("Origin", "http://localhost:5173");

    expect(resposta.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
  });
});

describe("API — tutores", () => {
  it("lista tutores e repassa a busca", async () => {
    const { app, tutorService } = criarAppDeTeste();

    const resposta = await request(app).get("/api/tutores?busca=beatriz");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].total_animais).toBe(3);
    expect(tutorService.listar).toHaveBeenCalledWith({ busca: "beatriz" });
  });

  it("trata busca vazia como ausente", async () => {
    const { app, tutorService } = criarAppDeTeste();

    await request(app).get("/api/tutores?busca=");

    expect(tutorService.listar).toHaveBeenCalledWith({ busca: undefined });
  });

  it("cria tutor com telefone, CEP e UF normalizados", async () => {
    const { app, tutorService } = criarAppDeTeste();

    const resposta = await request(app).post("/api/tutores").send({
      nome: "  Ana Beatriz  ",
      telefone: "(85) 99999-9999",
      email: "",
      cep: "60.000-000",
      uf: "ce",
    });

    expect(resposta.status).toBe(201);
    expect(resposta.headers.location).toBe("/api/tutores/7");

    const enviado = tutorService.criar.mock.calls[0][0];
    expect(enviado).toMatchObject({
      nome: "Ana Beatriz",
      telefone: "85999999999",
      cep: "60000000",
      uf: "CE",
    });
    expect(enviado.email).toBeUndefined();
  });

  it("recusa campos obrigatórios ausentes e telefone inválido, listando os campos", async () => {
    const { app, tutorService } = criarAppDeTeste();

    const resposta = await request(app).post("/api/tutores").send({
      nome: "An",
      telefone: "123",
      email: "sem-arroba",
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe("VALIDACAO");

    const campos = resposta.body.erro.campos.map((campo) => campo.campo);
    expect(campos).toEqual(expect.arrayContaining(["nome", "telefone", "email"]));
    expect(tutorService.criar).not.toHaveBeenCalled();
  });

  it("recusa id não numérico com 400 em vez de 500", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app).get("/api/tutores/abc");

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.campos[0].campo).toBe("id");
  });

  it("responde 404 quando o service não encontra o tutor", async () => {
    const { app } = criarAppDeTeste({
      buscarPorId: vi.fn(async () => {
        throw AppError.naoEncontrado("Tutor não encontrado.");
      }),
    });

    const resposta = await request(app).get("/api/tutores/99");

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toEqual({
      codigo: "NAO_ENCONTRADO",
      mensagem: "Tutor não encontrado.",
    });
  });

  it("lista os animais do tutor", async () => {
    const { app, tutorService } = criarAppDeTeste();

    const resposta = await request(app).get("/api/tutores/1/animais");

    expect(resposta.status).toBe(200);
    expect(resposta.body[0].nome).toBe("Clarke");
    expect(tutorService.listarAnimais).toHaveBeenCalledWith(1);
  });

  it("atualiza tutor válido", async () => {
    const { app, tutorService } = criarAppDeTeste();

    const resposta = await request(app).put("/api/tutores/1").send({
      nome: "Beatriz Abreu Lima",
      telefone: "8532221100",
    });

    expect(resposta.status).toBe(200);
    expect(resposta.body.nome).toBe("Beatriz Abreu Lima");
    expect(tutorService.atualizar).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ telefone: "8532221100" })
    );
  });

  it("não atualiza quando o corpo é inválido", async () => {
    const { app, tutorService } = criarAppDeTeste();

    const resposta = await request(app).put("/api/tutores/1").send({ nome: "A" });

    expect(resposta.status).toBe(400);
    expect(tutorService.atualizar).not.toHaveBeenCalled();
  });

  it("responde 409 ao excluir tutor com animais", async () => {
    const { app, tutorService } = criarAppDeTeste({
      excluir: vi.fn(async () => {
        throw AppError.conflito("Este tutor possui 3 animais cadastrados e não pode ser excluído.");
      }),
    });

    const resposta = await request(app).delete("/api/tutores/1");

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe("CONFLITO");
    expect(resposta.body.erro.mensagem).toContain("3 animais cadastrados");
    expect(tutorService.excluir).toHaveBeenCalledWith(1);
  });

  it("exclui tutor sem animais com 204 e sem corpo", async () => {
    const { app, tutorService } = criarAppDeTeste();

    const resposta = await request(app).delete("/api/tutores/1");

    expect(resposta.status).toBe(204);
    expect(resposta.text).toBe("");
    expect(tutorService.excluir).toHaveBeenCalledWith(1);
  });
});

describe("API — animais", () => {
  it("lista todos os animais quando não há filtro", async () => {
    const { app, animalService } = criarAppDeTeste();

    const resposta = await request(app).get("/api/animais");

    expect(resposta.status).toBe(200);
    expect(resposta.body).toHaveLength(1);
    expect(animalService.listar).toHaveBeenCalledWith({ tutorId: undefined });
  });

  it("filtra os animais por tutor", async () => {
    const { app, animalService } = criarAppDeTeste();

    await request(app).get("/api/animais?tutorId=1");

    expect(animalService.listar).toHaveBeenCalledWith({ tutorId: 1 });
  });

  it("recusa tutorId inválido na query com 400", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app).get("/api/animais?tutorId=abc");

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.campos[0].campo).toBe("tutorId");
  });

  it("cria animal normalizando sexo, idade, peso e tutor_id", async () => {
    const { app, animalService } = criarAppDeTeste();

    const resposta = await request(app).post("/api/animais").send({
      nome: "  Thor  ",
      especie: "Cão",
      raca: "",
      sexo: "m",
      idade: "3",
      peso: "28,4",
      tutor_id: "1",
    });

    expect(resposta.status).toBe(201);
    expect(resposta.headers.location).toBe("/api/animais/9");

    const enviado = animalService.criar.mock.calls[0][0];
    expect(enviado).toMatchObject({
      nome: "Thor",
      especie: "Cão",
      sexo: "M",
      idade: 3,
      peso: 28.4,
      tutor_id: 1,
    });
    expect(enviado.raca).toBeUndefined();
  });

  it("recusa animal inválido listando todos os campos", async () => {
    const { app, animalService } = criarAppDeTeste();

    const resposta = await request(app).post("/api/animais").send({
      nome: "T",
      especie: "",
      sexo: "X",
      idade: -1,
      peso: 0,
    });

    expect(resposta.status).toBe(400);
    const campos = resposta.body.erro.campos.map((campo) => campo.campo);
    expect(campos).toEqual(
      expect.arrayContaining(["nome", "especie", "sexo", "idade", "peso", "tutor_id"])
    );
    expect(animalService.criar).not.toHaveBeenCalled();
  });

  it("responde 404 quando o animal não existe", async () => {
    const { app } = criarAppDeTeste({}, {
      buscarPorId: vi.fn(async () => {
        throw AppError.naoEncontrado("Animal não encontrado.");
      }),
    });

    const resposta = await request(app).get("/api/animais/99");

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.mensagem).toBe("Animal não encontrado.");
  });

  it("atualiza animal válido", async () => {
    const { app, animalService } = criarAppDeTeste();

    const resposta = await request(app).put("/api/animais/10").send({
      nome: "Clarke",
      especie: "Gato",
      sexo: "F",
      tutor_id: 1,
    });

    expect(resposta.status).toBe(200);
    expect(animalService.atualizar).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ nome: "Clarke", tutor_id: 1 })
    );
  });

  it("exclui animal com 204", async () => {
    const { app, animalService } = criarAppDeTeste();

    const resposta = await request(app).delete("/api/animais/10");

    expect(resposta.status).toBe(204);
    expect(animalService.excluir).toHaveBeenCalledWith(10);
  });
});
