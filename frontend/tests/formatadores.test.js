import { describe, expect, it } from "vitest";
import {
  correspondeBuscaRecepcao,
  formatarCep,
  formatarEnderecoCompleto,
  formatarIdadeExibicao,
  formatarLocalidadeCurta,
  formatarPesoExibicao,
  formatarTelefone,
  normalizarBuscaTutor,
  pesoParaInput,
  sanitizarIdadeInput,
  sanitizarPesoInput,
  telefoneParaHref,
} from "../src/utils/formatadores.js";

describe("formatadores", () => {
  it("formata telefone fixo (10 dígitos), celular (11 dígitos) e href tel:", () => {
    expect(formatarTelefone("8532221100")).toBe("(85) 3222-1100");
    expect(formatarTelefone("85990000000")).toBe("(85) 99000-0000");
    expect(formatarTelefone("")).toBe("");
    expect(telefoneParaHref("85990000000")).toBe("tel:+5585990000000");
    expect(telefoneParaHref("123")).toBeNull();
  });

  it("formata CEP com 8 dígitos", () => {
    expect(formatarCep("60000000")).toBe("60000-000");
    expect(formatarCep("60120")).toBe("60120");
  });

  it("sanitiza idade e peso impedindo múltiplos separadores ou sinais negativos", () => {
    expect(sanitizarIdadeInput("-12a")).toBe("12");
    expect(sanitizarIdadeInput("3-2")).toBe("32");
    expect(sanitizarPesoInput("5,,259")).toBe("5,25");
    expect(sanitizarPesoInput("-28.4")).toBe("28,4");
  });

  it("normaliza busca por telefone removendo máscara, mas preserva busca por nome", () => {
    expect(normalizarBuscaTutor("(85) 9900-00")).toBe("85990000");
    expect(normalizarBuscaTutor("  Beatriz Abreu  ")).toBe("Beatriz Abreu");
    expect(normalizarBuscaTutor("")).toBe("");
  });

  it("corresponde busca unificada da recepção por tutor, telefone mascarado e nome do pet", () => {
    const tutor = {
      id: 1,
      nome: "Beatriz Abreu",
      telefone: "8599000000",
      bairro: "Aldeota",
      cidade: "Fortaleza",
    };
    const pets = [
      { id: 10, nome: "Clarke", especie: "Felino", raca: "SRD" },
      { id: 11, nome: "Thor", especie: "Cão", raca: "Labrador" },
    ];

    expect(correspondeBuscaRecepcao(tutor, pets, "(85) 9900")).toEqual({
      corresponde: true,
      petsDestacados: [],
    });

    expect(correspondeBuscaRecepcao(tutor, pets, "clarke")).toEqual({
      corresponde: true,
      petsDestacados: [10],
    });

    expect(correspondeBuscaRecepcao(tutor, pets, "cao")).toEqual({
      corresponde: true,
      petsDestacados: [11],
    });

    expect(correspondeBuscaRecepcao(tutor, pets, "inexistente")).toEqual({
      corresponde: false,
      petsDestacados: [],
    });
  });

  it("converte peso string do Postgres para exibição e para input de edição", () => {
    expect(formatarPesoExibicao("5.20")).toBe("5,2 kg");
    expect(formatarPesoExibicao("28.45")).toBe("28,45 kg");
    expect(formatarPesoExibicao(null)).toBeNull();

    expect(pesoParaInput("5.20")).toBe("5,2");
    expect(pesoParaInput("28.45")).toBe("28,45");
    expect(pesoParaInput(null)).toBe("");
  });

  it("formata idade em anos com plural adequado", () => {
    expect(formatarIdadeExibicao(0)).toBe("Menos de 1 ano");
    expect(formatarIdadeExibicao(1)).toBe("1 ano");
    expect(formatarIdadeExibicao(6)).toBe("6 anos");
  });

  it("formata localidade curta e endereço completo sem sobras vazias", () => {
    const tutor = {
      logradouro: "Rua Teste",
      numero: "100",
      complemento: "BL A",
      bairro: "Aldeota",
      cidade: "Fortaleza",
      uf: "CE",
      cep: "60000000",
    };

    expect(formatarLocalidadeCurta(tutor)).toBe("Aldeota · Fortaleza/CE");
    expect(formatarEnderecoCompleto(tutor)).toBe(
      "Rua Teste, 100 (BL A) — Aldeota, Fortaleza/CE — CEP 60000-000"
    );
    expect(formatarEnderecoCompleto({})).toBeNull();
  });
});
