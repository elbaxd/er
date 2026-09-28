"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { LevelId, SubLevelId } from "./exercises";
import {
  getCompletedLevels,
  isNodeUnlocked,
  CompletedLevelsMap,
} from "./practiceProgress";

const LEVELS: LevelId[] = [1, 2, 3, 4, 5, 6];

const LEVEL_NAMES: Record<LevelId, string> = {
  1: "Entidades",
  2: "Relaciones",
  3: "Atributos Propios",
  4: "Entidades Débiles",
  5: "Jerarquías y Herencia",
  6: "Agregaciones",
};

// Colores sólidos y vibrantes por grupo de nivel
const LEVEL_GROUP_COLOR: Record<LevelId, { bg: string; border: string }> = {
  1: { bg: "bg-blue-600", border: "border-blue-400" },
  2: { bg: "bg-blue-600", border: "border-blue-400" },
  3: { bg: "bg-purple-600", border: "border-purple-400" },
  4: { bg: "bg-purple-600", border: "border-purple-400" },
  5: { bg: "bg-amber-600", border: "border-amber-400" },
  6: { bg: "bg-amber-600", border: "border-amber-400" },
};

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
  const [completedLevels, setCompletedLevels] = useState<CompletedLevelsMap>({});

  useEffect(() => {
    setCompletedLevels(getCompletedLevels());
  }, []);

  const handleSolve = () => {
    router.push(`/${locale}/practice/solve?level=${level}&sub=${subLevel}`);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#1a1d24]">
      <div className="h-full w-full overflow-y-auto">
        <div className="px-6 py-10 md:px-12 lg:px-20">
          <h1 className="mb-1 text-2xl font-bold text-slate-100">
            {t("title")}
          </h1>
          <p className="mb-8 text-slate-400">{t("subtitle")}</p>

          {/* Carril horizontal de niveles */}
          <div className="flex items-start gap-0 overflow-x-auto pb-44 pt-4">
            {PATH_NODES.map((node, idx) => {
              const isSelected =
                level === node.level && subLevel === node.subLevel;
              const isLast = idx === PATH_NODES.length - 1;
              const isFirst = idx === 0;

              const isCompleted = Boolean(
                completedLevels[`${node.level}.${node.subLevel}`],
              );
              const isUnlocked = isNodeUnlocked(
                node.level,
                node.subLevel,
                completedLevels,
              );

              // Determinación clara de colores sin solapamiento
              let nodeColorClass = "";
              if (!isUnlocked) {
                nodeColorClass = "bg-slate-800/80 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed";
              } else if (isCompleted) {
                nodeColorClass = "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950/40";
              } else {
                const group = LEVEL_GROUP_COLOR[node.level];
                nodeColorClass = `${group.bg} ${group.border} text-white shadow-md`;
              }

              // Color del popover y flecha
              const popoverColorClass = isCompleted
                ? "bg-emerald-600"
                : LEVEL_GROUP_COLOR[node.level].bg;

              const popoverPositionClass = isFirst
                ? "left-0"
                : isLast
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";
              const arrowPositionClass = isFirst
                ? "left-8 -translate-x-1/2"
                : isLast
                  ? "right-8 translate-x-1/2"
                  : "left-1/2 -translate-x-1/2";

              return (
                <div key={node.label} className="flex items-center">
                  <div className="relative">
                    {/* Botón de nivel con recuadro sólido y visible */}
                    <button
                      type="button"
                      disabled={!isUnlocked}
                      onClick={() => {
                        if (isUnlocked) {
                          setLevel(node.level);
                          setSubLevel(node.subLevel);
                        }
                      }}
                      aria-pressed={isSelected}
                      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 text-base font-extrabold transition-all duration-150 ${nodeColorClass} ${
                        isSelected && isUnlocked
                          ? "ring-4 ring-white/90 scale-110 z-10"
                          : isUnlocked
                            ? "hover:scale-105 hover:brightness-110"
                            : ""
                      }`}
                    >
                      {node.label}

                      {/* Icono de candado para niveles bloqueados */}
                      {!isUnlocked && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-[10px]">
                          🔒
                        </span>
                      )}

                      {/* Ticket de completado */}
                      {isCompleted && (
                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-black text-emerald-700 shadow-md ring-2 ring-emerald-600">
                          ✓
                        </span>
                      )}
                    </button>

                    {/* Popover con botón resolver */}
                    {isSelected && isUnlocked && (
                      <div
                        className={`absolute top-full z-20 mt-3 w-56 ${popoverPositionClass}`}
                      >
                        <div
                          className={`absolute -top-2.5 h-3 w-6 ${arrowPositionClass} ${popoverColorClass} [clip-path:polygon(50%_0%,0%_100%,100%_100%)]`}
                        />
                        <div className="overflow-hidden rounded-xl shadow-2xl border border-slate-700">
                          <div
                            className={`px-4 py-3 text-center text-sm font-semibold text-white ${popoverColorClass}`}
                          >
                            <div>{t("startLevel", { name: LEVEL_NAMES[level] })}</div>
                            {isCompleted && (
                              <div className="text-xs text-emerald-200 mt-0.5 font-medium">
                                ¡Nivel Completado! ✓
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={handleSolve}
                            className="w-full bg-purple-600 px-4 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-purple-500 active:bg-purple-700"
                          >
                            {isCompleted ? "Reintentar Desafío" : t("solve")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Conector horizontal entre nodos */}
                  {!isLast && (
                    <div
                      className={`h-1 w-8 shrink-0 transition-colors ${
                        isNodeUnlocked(
                          PATH_NODES[idx + 1].level,
                          PATH_NODES[idx + 1].subLevel,
                          completedLevels,
                        )
                          ? "bg-slate-500"
                          : "bg-slate-800"
                      }`}
                    />
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