"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LevelId, SubLevelId } from "./exercises";

const LEVELS: LevelId[] = [1, 2, 3, 4, 5, 6];

const LEVEL_NAMES: Record<LevelId, string> = {
  1: "Entidades",
  2: "Relaciones",
  3: "Atributos Propios",
  4: "Entidades Débiles",
  5: "...",
  6: "...",
};

// Color por grupo de niveles, según el contenido que cubren.
const LEVEL_GROUP_COLOR: Record<LevelId, string> = {
  1: "bg-blue-500",
  2: "bg-blue-500",
  3: "bg-purple-500",
  4: "bg-purple-500",
  5: "bg-orange-500",
  6: "bg-orange-500",
};

// Orden dentro de cada nivel para el camino: primero abstracto (1),
// luego directo (2) -- así el nodo se lee "1.1", "1.2", "2.1", "2.2"...
const SUB_LEVELS_IN_PATH_ORDER: SubLevelId[] = [1, 2];

type PathNode = { level: LevelId; subLevel: SubLevelId; label: string };

const PATH_NODES: PathNode[] = LEVELS.flatMap((lvl) =>
  SUB_LEVELS_IN_PATH_ORDER.map((sub) => ({
    level: lvl,
    subLevel: sub,
    label: `${lvl}.${sub}`,
  })),
);

const PracticePage = () => {
  const t = useTranslations("home.practice");
  const router = useRouter();
  const locale = useLocale();

  const [level, setLevel] = useState<LevelId>(1);
  const [subLevel, setSubLevel] = useState<SubLevelId>(1);

  const handleSolve = () => {
    router.push(`/${locale}/practice/solve?level=${level}&sub=${subLevel}`);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#1a1d24]">
      <div className="h-full w-full overflow-y-auto">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <h1 className="mb-1 text-2xl font-bold text-slate-100">
            {t("title")}
          </h1>
          <p className="mb-8 text-slate-400">{t("subtitle")}</p>

          {/* Camino de niveles: nodos conectados, con un popover
              flotante bajo el nodo seleccionado. */}
          <div className="flex items-start gap-0 overflow-x-auto pb-40 pt-2">
            {PATH_NODES.map((node, idx) => {
              const isSelected =
                level === node.level && subLevel === node.subLevel;
              const isLast = idx === PATH_NODES.length - 1;
              const groupColor = LEVEL_GROUP_COLOR[node.level];

              return (
                <div key={node.label} className="flex items-center">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setLevel(node.level);
                        setSubLevel(node.subLevel);
                      }}
                      aria-pressed={isSelected}
                      className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white transition-all ${groupColor} ${
                        isSelected
                          ? "opacity-100 ring-2 ring-white"
                          : "opacity-60 hover:opacity-90"
                      }`}
                    >
                      {node.label}
                    </button>

                    {/* Popover tipo globo de diálogo, solo en el nodo
                        seleccionado */}
                    {isSelected && (
                      <div className="absolute left-1/2 top-full z-10 mt-3 w-56 -translate-x-1/2">
                        {/* Flecha apuntando al nodo */}
                        <div
                          className={`absolute -top-3 left-1/2 h-3 w-6 -translate-x-1/2 ${groupColor} [clip-path:polygon(50%_0%,0%_100%,100%_100%)]`}
                        />
                        <div className="overflow-hidden rounded-lg shadow-lg">
                          <div
                            className={`px-4 py-3 text-center text-sm font-semibold text-white ${groupColor}`}
                          >
                            {t("startLevel", { name: LEVEL_NAMES[level] })}
                          </div>
                          <button
                            type="button"
                            onClick={handleSolve}
                            className="w-full bg-purple-600 px-4 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-purple-500"
                          >
                            {t("solve")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {!isLast && (
                    <div className="h-0.5 w-8 shrink-0 bg-slate-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;
