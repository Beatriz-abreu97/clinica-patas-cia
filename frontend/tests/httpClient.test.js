import { describe, expect, it, vi } from "vitest";
import {
  ApiError,
  montarUrl,
  obterBaseApiUrl,
  requisitar,
} from "../src/services/httpClient.js";

describe("httpClient", () => {
  it("remove barra final da VITE_API_URL", () => {
    expect(obterBaseApiUrl("https://clinica-patas-cia.onrender.com/api/")).toBe(
      "https://clinica-patas-cia.onrender.com/api"
    );
  });

  it("monta URL ignorando parâmetros vazios", () => {
    expect(
      montarUrl("/tutores", { busca: "859900", vazio: "" }, "http://localhost:3000/api")
    ).toBe("http://localhost:3000/api/tutores?busca=859900");
  });

  it("retorna null em respostas 204 No Content sem quebrar o parse de JSON", async () => {
    const fetchFalso = vi.fn(async () => ({
      ok: true,
      status: 204,
      text: async () => "",
    }));

    const resultado = await requisitar("/tutores/1", {
      metodo: "DELETE",
      baseUrl: "http://localhost:3000/api",
      fetchImpl: fetchFalso,
    });

    expect(resultado).toBeNull();
  });

  it("traduz erro 400 VALIDACAO em ApiError com mapaDeCampos()", async () => {
    const fetchFalso = vi.fn(async () => ({
      ok: false,
      status: 400,
      text: async () =>
        JSON.stringify({
          erro: {
            codigo: "VALIDACAO",
            mensagem: "Dados inválidos.",
            campos: [
              { campo: "nome", mensagem: "Nome deve ter ao menos 3 caracteres." },
              { campo: "telefone", mensagem: "Telefone inválido." },
            ],
          },
        }),
    }));

    await expect(
      requisitar("/tutores", {
        metodo: "POST",
        corpo: { nome: "An", telefone: "123" },
        baseUrl: "http://localhost:3000/api",
        fetchImpl: fetchFalso,
      })
    ).rejects.toMatchObject({
      status: 400,
      codigo: "VALIDACAO",
    });

    try {
      await requisitar("/tutores", {
        metodo: "POST",
        corpo: { nome: "An", telefone: "123" },
        baseUrl: "http://localhost:3000/api",
        fetchImpl: fetchFalso,
      });
    } catch (erro) {
      expect(ApiError.ehApiError(erro)).toBe(true);
      expect(erro.mapaDeCampos()).toEqual({
        nome: "Nome deve ter ao menos 3 caracteres.",
        telefone: "Telefone inválido.",
      });
    }
  });

  it("preserva mensagem de 409 CONFLITO ao excluir tutor com animais", async () => {
    const fetchFalso = vi.fn(async () => ({
      ok: false,
      status: 409,
      text: async () =>
        JSON.stringify({
          erro: {
            codigo: "CONFLITO",
            mensagem: "Este tutor possui 3 animais cadastrados e não pode ser excluído.",
          },
        }),
    }));

    await expect(
      requisitar("/tutores/1", {
        metodo: "DELETE",
        baseUrl: "http://localhost:3000/api",
        fetchImpl: fetchFalso,
      })
    ).rejects.toMatchObject({
      status: 409,
      codigo: "CONFLITO",
      mensagem: "Este tutor possui 3 animais cadastrados e não pode ser excluído.",
    });
  });
});
