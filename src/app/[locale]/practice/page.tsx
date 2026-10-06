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

// Extensión para los 10 niveles implementados
const LEVELS: LevelId[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const LEVEL_NAMES: Record<LevelId, string> = {
  1: "Entidades y Atributos Básicos",
  2: "Relaciones Simples (1:N)",
  3: "Participación Total (!)",
  4: "Relaciones Muchos a Muchos (N:M)",
  5: "Atributos en Relaciones",
  6: "Entidades Débiles",
  7: "Jerarquías Simples (EXTENDS)",
  8: "Jerarquías Multinivel",
  9: "Agregaciones",
  10: "Integración Conceptual",
};

// Colores por bloques temáticos de 2 niveles
const LEVEL_GROUP_COLOR: Record<LevelId, { bg: string; border: string }> = {
  1: { bg: "bg-blue-600", border: "border-blue-400" },
  2: { bg: "bg-blue-600", border: "border-blue-400" },
  3: { bg: "bg-indigo-600", border: "border-indigo-400" },
  4: { bg: "bg-indigo-600", border: "border-indigo-400" },
  5: { bg: "bg-purple-600", border: "border-purple-400" },
  6: { bg: "bg-purple-600", border: "border-purple-400" },
  7: { bg: "bg-amber-600", border: "border-amber-400" },
  8: { bg: "bg-amber-600", border: "border-amber-400" },
  9: { bg: "bg-rose-600", border: "border-rose-400" },
  10: { bg: "bg-rose-600", border: "border-rose-400" },
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
  
  // Estado para alternar entre acceso libre o bloqueo secuencial
  const [isFreeAccess, setIsFreeAccess] = useState<boolean>(false);

  useEffect(() => {
    setCompletedLevels(getCompletedLevels());
  }, []);

  const handleSolve = () => {
    router.push(`/${locale}/practice/solve?level=${level}&sub=${subLevel}`);
  };

  // Desbloquea todos los niveles
  const handleUnlockAll = () => {
    setIsFreeAccess(true);
  };

  // Restaura el bloqueo normal y borra el progreso de localStorage para probar desde cero
  const handleLockAll = () => {
    setIsFreeAccess(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("erdoc_practice_completed_levels");
    }
    setCompletedLevels({});
    setLevel(1);
    setSubLevel(1);
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-[#1a1d24]">
      <div className="h-full w-full overflow-y-auto">
        <div className="px-6 py-10 md:px-12 lg:px-20">
          {/* Encabezado con título y botones de control */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-slate-100">
                {t("title")}
              </h1>
              <p className="text-slate-400">{t("subtitle")}</p>
            </div>

            {/* Botones para Bloquear y Desbloquear Niveles */}
            <div className="flex items-center gap-2.5 rounded-lg border border-slate-700/60 bg-[#14161d] p-1.5 shadow-sm">
              <button
                type="button"
                onClick={handleUnlockAll}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  isFreeAccess
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title="Permite acceder y resolver cualquier nivel sin restricciones"
              >
                <span>🔓</span>
                <span>Desbloquear todos</span>
              </button>

              <button
                type="button"
                onClick={handleLockAll}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  !isFreeAccess
                    ? "bg-slate-700 text-white shadow"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title="Restaura la progresión normal por niveles y reinicia el avance"
              >
                <span>🔒</span>
                <span>Bloquear niveles</span>
              </button>
            </div>
          </div>

          {/* Carril horizontal con padding y espacio a los bordes */}
          <div className="flex items-start gap-0 overflow-x-auto pb-44 pt-4 px-8 rounded-xl bg-[#13151b]/40 border border-slate-800/60 shadow-inner">
            {/* Espaciador izquierdo */}
            <div className="w-6 shrink-0" />

            {PATH_NODES.map((node, idx) => {
              const isSelected =
                level === node.level && subLevel === node.subLevel;
              const isLast = idx === PATH_NODES.length - 1;
              const isFirst = idx === 0;

              const isCompleted = Boolean(
                completedLevels[`${node.level}.${node.subLevel}`],
              );
              
              // Un nodo está desbloqueado si se activó el modo libre o si cumple la regla de avance
              const isUnlocked =
                isFreeAccess ||
                isNodeUnlocked(node.level, node.subLevel, completedLevels);

              let nodeColorClass = "";
              if (!isUnlocked) {
                nodeColorClass =
                  "bg-slate-800/80 border-slate-700 text-slate-500 opacity-50 cursor-not-allowed";
              } else if (isCompleted) {
                nodeColorClass =
                  "bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950/40";
              } else {
                const group = LEVEL_GROUP_COLOR[node.level];
                nodeColorClass = `${group.bg} ${group.border} text-white shadow-md`;
              }

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
                      title={
                        !isUnlocked
                          ? `Completa el nivel ${node.level - 1}.2 para desbloquear`
                          : isCompleted
                            ? `Nivel ${node.label} completado`
                            : `Nivel ${node.label}`
                      }
                      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 text-base font-extrabold transition-all duration-150 ${nodeColorClass} ${
                        isSelected && isUnlocked
                          ? "ring-4 ring-white/90 scale-110 z-10"
                          : isUnlocked
                            ? "hover:scale-105 hover:brightness-110"
                            : ""
                      }`}
                    >
                      {node.label}

                      {/* Icono de candado si está bloqueado */}
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

                    {/* Popover descriptivo */}
                    {isSelected && isUnlocked && (
                      <div
                        className={`absolute top-full z-20 mt-3 w-64 ${popoverPositionClass}`}
                      >
                        <div
                          className={`absolute -top-2.5 h-3 w-6 ${arrowPositionClass} ${popoverColorClass} [clip-path:polygon(50%_0%,0%_100%,100%_100%)]`}
                        />
                        <div className="overflow-hidden rounded-xl shadow-2xl border border-slate-700">
                          <div
                            className={`px-4 py-3 text-center text-sm font-semibold text-white ${popoverColorClass}`}
                          >
                            <div>{LEVEL_NAMES[level]}</div>
                            <div className="text-[11px] font-normal text-white/80 mt-0.5">
                              {subLevel === 1
                                ? "Subnivel 1: Tutorial Guiado"
                                : "Subnivel 2: Reto de Biblioteca"}
                            </div>
                            {isCompleted && (
                              <div className="text-xs text-emerald-200 mt-1 font-medium">
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

                  {/* Conector entre nodos */}
                  {!isLast && (
                    <div
                      className={`h-1 w-8 shrink-0 transition-colors ${
                        isFreeAccess ||
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

            {/* Espaciador derecho */}
            <div className="w-12 shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;