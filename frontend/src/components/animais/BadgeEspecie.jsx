import { Bird, Cat, Dog, PawPrint, Rabbit } from "lucide-react";

export function resolverVisualEspecie(especie = "") {
  const texto = String(especie ?? "").trim().toLowerCase();

  if (
    texto.includes("cão") ||
    texto.includes("cao") ||
    texto.includes("cachorro") ||
    texto.includes("canin")
  ) {
    return {
      Icone: Dog,
      classeBloco:
        "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800/80",
      classePilula:
        "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800/80",
    };
  }

  if (texto.includes("gato") || texto.includes("felin")) {
    return {
      Icone: Cat,
      classeBloco:
        "bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-800/80",
      classePilula:
        "bg-teal-50 text-teal-900 border-teal-200 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-800/80",
    };
  }

  if (
    texto.includes("ave") ||
    texto.includes("pássaro") ||
    texto.includes("passaro") ||
    texto.includes("calopsita")
  ) {
    return {
      Icone: Bird,
      classeBloco:
        "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800/80",
      classePilula:
        "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-950/60 dark:text-sky-200 dark:border-sky-800/80",
    };
  }

  if (texto.includes("coelho") || texto.includes("roedor") || texto.includes("hamster")) {
    return {
      Icone: Rabbit,
      classeBloco:
        "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-800/80",
      classePilula:
        "bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/60 dark:text-orange-200 dark:border-orange-800/80",
    };
  }

  return {
    Icone: PawPrint,
    classeBloco:
      "bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
    classePilula:
      "bg-stone-100 text-stone-800 border-stone-200 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700",
  };
}

export function BadgeEspecie({ especie, mostrarRotulo = true, mostrarIcone = true }) {
  const { Icone, classeBloco, classePilula } = resolverVisualEspecie(especie);

  if (!mostrarRotulo) {
    return (
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${classeBloco}`}
      >
        <Icone className="h-5 w-5" aria-hidden="true" />
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classePilula}`}
    >
      {mostrarIcone && <Icone className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{especie}</span>
    </span>
  );
}
