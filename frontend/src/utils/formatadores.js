export function apenasDigitos(valor = "") {
  return String(valor ?? "").replace(/\D/g, "");
}

export function normalizarTexto(valor = "") {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatarTelefone(valor = "") {
  const digitos = apenasDigitos(valor).slice(0, 11);

  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }

  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
}

export function telefoneParaHref(valor = "") {
  const digitos = apenasDigitos(valor);
  if (digitos.length < 10) return null;
  return `tel:+55${digitos}`;
}

export function formatarCep(valor = "") {
  const digitos = apenasDigitos(valor).slice(0, 8);

  if (digitos.length === 0) return "";
  if (digitos.length <= 5) return digitos;

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

export function sanitizarIdadeInput(valor = "") {
  return apenasDigitos(valor).slice(0, 3);
}

export function sanitizarPesoInput(valor = "") {
  const trocado = String(valor ?? "")
    .replace(/\./g, ",")
    .replace(/[^0-9,]/g, "");

  const indiceVirgula = trocado.indexOf(",");
  if (indiceVirgula === -1) {
    return trocado.slice(0, 3);
  }

  const inteiros = trocado.slice(0, indiceVirgula).slice(0, 3);
  const decimais = trocado
    .slice(indiceVirgula + 1)
    .replace(/,/g, "")
    .slice(0, 2);

  return `${inteiros},${decimais}`;
}

export function normalizarBuscaTutor(termo = "") {
  const limpo = String(termo ?? "").trim();
  if (!limpo) return "";

  const contemDigito = /\d/.test(limpo);
  const contemLetra = /[a-zA-ZÀ-ÿ]/.test(limpo);

  if (contemDigito && !contemLetra) {
    return apenasDigitos(limpo);
  }

  return limpo;
}

export function correspondeBuscaRecepcao(tutor, animaisDoTutor = [], termoBusca = "") {
  const bruto = String(termoBusca ?? "").trim();
  if (!bruto) {
    return { corresponde: true, petsDestacados: [] };
  }

  const termoTexto = normalizarTexto(bruto);
  const termoDigitos = apenasDigitos(bruto);
  const apenasBuscaNumerica = Boolean(termoDigitos) && !/[a-zA-ZÀ-ÿ]/.test(bruto);

  const bateTelefone = Boolean(termoDigitos) && apenasDigitos(tutor?.telefone).includes(termoDigitos);

  const bateDadosTutor =
    !apenasBuscaNumerica &&
    (normalizarTexto(tutor?.nome).includes(termoTexto) ||
      normalizarTexto(tutor?.bairro).includes(termoTexto) ||
      normalizarTexto(tutor?.cidade).includes(termoTexto) ||
      normalizarTexto(tutor?.email).includes(termoTexto));

  const petsDestacados = [];
  if (!apenasBuscaNumerica && termoTexto) {
    for (const pet of animaisDoTutor) {
      const batePet =
        normalizarTexto(pet?.nome).includes(termoTexto) ||
        normalizarTexto(pet?.especie).includes(termoTexto) ||
        normalizarTexto(pet?.raca).includes(termoTexto);

      if (batePet) {
        petsDestacados.push(pet.id);
      }
    }
  }

  return {
    corresponde: bateTelefone || bateDadosTutor || petsDestacados.length > 0,
    petsDestacados,
  };
}

export function formatarPesoExibicao(peso) {
  if (peso === null || peso === undefined || peso === "") return null;

  const numero = Number(String(peso).replace(",", "."));
  if (Number.isNaN(numero)) return null;

  const formatado = numero.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });

  return `${formatado} kg`;
}

export function pesoParaInput(peso) {
  if (peso === null || peso === undefined || peso === "") return "";

  const numero = Number(String(peso).replace(",", "."));
  if (Number.isNaN(numero)) return "";

  return String(numero).replace(".", ",");
}

export function formatarIdadeExibicao(idade) {
  if (idade === null || idade === undefined || idade === "") return null;

  const anos = Number(idade);
  if (Number.isNaN(anos)) return null;
  if (anos === 0) return "Menos de 1 ano";
  if (anos === 1) return "1 ano";

  return `${anos} anos`;
}

export function formatarLocalidadeCurta(tutor) {
  if (!tutor) return null;

  const cidadeUf = [tutor.cidade, tutor.uf].filter(Boolean).join("/");
  return [tutor.bairro, cidadeUf].filter(Boolean).join(" · ") || null;
}

export function formatarEnderecoCompleto(tutor) {
  if (!tutor) return null;

  const ruaNumero = [tutor.logradouro, tutor.numero].filter(Boolean).join(", ");
  const comComplemento = [ruaNumero, tutor.complemento ? `(${tutor.complemento})` : ""]
    .filter(Boolean)
    .join(" ");

  const cidadeUf = [tutor.cidade, tutor.uf].filter(Boolean).join("/");
  const bairroCidade = [tutor.bairro, cidadeUf].filter(Boolean).join(", ");
  const cepFormatado = tutor.cep ? `CEP ${formatarCep(tutor.cep)}` : "";

  const partes = [comComplemento, bairroCidade, cepFormatado].filter(Boolean);
  return partes.length > 0 ? partes.join(" — ") : null;
}

export function formatarDataCurta(dataIso) {
  if (!dataIso) return null;

  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return null;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(data);
}
