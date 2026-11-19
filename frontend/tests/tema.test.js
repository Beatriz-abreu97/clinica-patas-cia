import { describe, expect, it, vi } from "vitest";
import {
  CHAVE_TEMA,
  lerPreferenciaTemaSalva,
  resolverTemaInicial,
  salvarPreferenciaTema,
  sincronizarDomComTema,
} from "../src/utils/tema.js";

describe("tema (light / dark)", () => {
  it("prioriza o tema salvo pelo usuário sobre a preferência do sistema", () => {
    expect(resolverTemaInicial({ valorSalvo: "dark", prefereEscuroSistema: false })).toBe("dark");
    expect(resolverTemaInicial({ valorSalvo: "light", prefereEscuroSistema: true })).toBe("light");
  });

  it("usa a preferência do sistema quando não há valor salvo válido", () => {
    expect(resolverTemaInicial({ valorSalvo: null, prefereEscuroSistema: true })).toBe("dark");
    expect(resolverTemaInicial({ valorSalvo: null, prefereEscuroSistema: false })).toBe("light");
    expect(resolverTemaInicial({ valorSalvo: "invalido", prefereEscuroSistema: false })).toBe(
      "light"
    );
  });

  it("lê apenas escolhas explícitas válidas e só grava no storage em salvarPreferenciaTema", () => {
    const memoria = new Map();
    const storageFalso = {
      getItem: vi.fn((k) => (memoria.has(k) ? memoria.get(k) : null)),
      setItem: vi.fn((k, v) => memoria.set(k, v)),
    };

    expect(lerPreferenciaTemaSalva(storageFalso)).toBeNull();

    sincronizarDomComTema("light");
    expect(storageFalso.setItem).not.toHaveBeenCalled();

    salvarPreferenciaTema("dark", storageFalso);
    expect(storageFalso.setItem).toHaveBeenCalledWith(CHAVE_TEMA, "dark");
    expect(lerPreferenciaTemaSalva(storageFalso)).toBe("dark");
  });
});
