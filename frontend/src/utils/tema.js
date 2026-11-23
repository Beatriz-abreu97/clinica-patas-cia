export const CHAVE_TEMA = "patas-cia-tema";
export const COR_META_CLARO = "#fafaf9";
export const COR_META_ESCURO = "#171412";

export function resolverTemaInicial({ valorSalvo, prefereEscuroSistema = false } = {}) {
  if (valorSalvo === "dark" || valorSalvo === "light") {
    return valorSalvo;
  }
  return prefereEscuroSistema ? "dark" : "light";
}

export function lerPreferenciaTemaSalva(storage = globalThis?.localStorage) {
  try {
    const valor = storage?.getItem(CHAVE_TEMA);
    return valor === "dark" || valor === "light" ? valor : null;
  } catch {
    return null;
  }
}

export function obterTemaAtualDom() {
  const salvo = lerPreferenciaTemaSalva();
  if (salvo) return salvo;

  if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) {
    return "dark";
  }

  const prefereEscuro =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return resolverTemaInicial({ valorSalvo: null, prefereEscuroSistema: prefereEscuro });
}

export function sincronizarDomComTema(tema, { congelarTransicoes = false } = {}) {
  const escuro = tema === "dark";

  if (typeof document === "undefined") {
    return escuro ? "dark" : "light";
  }

  const raiz = document.documentElement;
  if (congelarTransicoes) {
    raiz.classList.add("trocando-tema");
  }

  raiz.classList.toggle("dark", escuro);

  const metaCor = document.getElementById("meta-theme-color");
  if (metaCor) {
    metaCor.setAttribute("content", escuro ? COR_META_ESCURO : COR_META_CLARO);
  }

  if (congelarTransicoes && typeof requestAnimationFrame === "function") {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        raiz.classList.remove("trocando-tema");
      });
    });
  }

  return escuro ? "dark" : "light";
}

export function salvarPreferenciaTema(tema, storage = globalThis?.localStorage) {
  const normalizado = tema === "dark" ? "dark" : "light";
  sincronizarDomComTema(normalizado, { congelarTransicoes: true });

  try {
    storage?.setItem(CHAVE_TEMA, normalizado);
  } catch {
    // ignora ambientes com localStorage indisponível
  }

  return normalizado;
}
