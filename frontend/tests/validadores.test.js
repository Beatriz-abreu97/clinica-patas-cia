import { describe, expect, it } from "vitest";
import { validarFormularioAnimal, validarFormularioTutor } from "../src/utils/validadores.js";

describe("validadores client-side", () => {
  it("valida tutor exigindo nome >= 3 e telefone brasileiro válido", () => {
    const invalido = validarFormularioTutor({ nome: "An", telefone: "(85) 1234", cep: "600" });
    expect(invalido.valido).toBe(false);
    expect(invalido.primeiroCampo).toBe("nome");
    expect(invalido.erros).toHaveProperty("nome");
    expect(invalido.erros).toHaveProperty("telefone");
    expect(invalido.erros).toHaveProperty("cep");

    const valido = validarFormularioTutor({
      nome: "Ana Beatriz",
      telefone: "(85) 99999-9999",
      cep: "60000-000",
    });
    expect(valido.valido).toBe(true);
    expect(valido.erros).toEqual({});
  });

  it("valida animal exigindo tutor_id, nome, sexo, especie e faixas de idade/peso", () => {
    const invalido = validarFormularioAnimal({
      tutor_id: "",
      nome: "A",
      sexo: "",
      especie: "",
      idade: "120",
      peso: "0",
    });
    expect(invalido.valido).toBe(false);
    expect(invalido.primeiroCampo).toBe("tutor_id");
    expect(Object.keys(invalido.erros)).toEqual(
      expect.arrayContaining(["tutor_id", "nome", "sexo", "especie", "idade", "peso"])
    );

    const valido = validarFormularioAnimal({
      tutor_id: "1",
      nome: "Clarke",
      sexo: "F",
      especie: "Felino",
      idade: "6",
      peso: "5,2",
    });
    expect(valido.valido).toBe(true);
  });
});
