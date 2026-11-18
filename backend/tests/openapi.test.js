import { describe, it, expect } from "vitest";
import fs from "node:fs";
import SwaggerParser from "@apidevtools/swagger-parser";
import YAML from "yaml";
import request from "supertest";

import { criarAppDeTeste } from "./helpers.js";

const spec = YAML.parse(fs.readFileSync(new URL("../openapi.yaml", import.meta.url), "utf8"));

function corpoValido(caminho) {
  if (caminho.startsWith("/api/tutores")) {
    return { nome: "Ana Beatriz", telefone: "85999999999" };
  }
  if (caminho.startsWith("/api/animais")) {
    return { nome: "Thor", especie: "Cão", sexo: "M", tutor_id: 1 };
  }
  return undefined;
}

describe("openapi.yaml", () => {
  it("é uma especificação OpenAPI 3.1 válida", async () => {
    const api = await SwaggerParser.validate(structuredClone(spec));

    expect(api.openapi).toBe("3.1.0");
  });

  it("só documenta operações que existem e respondem com status documentado", async () => {
    const { app } = criarAppDeTeste();

    for (const [caminho, operacoes] of Object.entries(spec.paths)) {
      for (const [metodo, operacao] of Object.entries(operacoes)) {
        const url = caminho.replace("{id}", "1");
        const corpo = corpoValido(caminho);
        const requisicao = request(app)[metodo](url);
        const resposta = await (corpo ? requisicao.send(corpo) : requisicao);
        const documentados = Object.keys(operacao.responses).map(Number);

        expect(
          documentados.includes(resposta.status),
          `${metodo.toUpperCase()} ${caminho} respondeu ${resposta.status}; documentados: ${documentados.join(", ")}`
        ).toBe(true);
      }
    }
  });

  it("serve a documentação interativa em /api-docs", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app).get("/api-docs/");

    expect(resposta.status).toBe(200);
    expect(resposta.headers["content-type"]).toContain("text/html");
    expect(resposta.text).toContain('id="swagger-ui"');
  });

  it("serve a especificação em JSON para importar em ferramentas", async () => {
    const { app } = criarAppDeTeste();

    const resposta = await request(app).get("/api-docs.json");

    expect(resposta.status).toBe(200);
    expect(resposta.body.openapi).toBe("3.1.0");
    expect(Object.keys(resposta.body.paths)).toHaveLength(7);
  });
});
