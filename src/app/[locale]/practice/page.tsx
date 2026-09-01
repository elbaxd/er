"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Header from "../../components/Header/Header";
import { Context } from "../../context";
import { ErDocChangeEvent } from "../../types/CodeEditor";
import { LevelId, SubLevelId, getExercise } from "./exercises";

const LEVELS: LevelId[] = [1, 2, 3, 4, 5, 6];
const SUB_LEVELS: SubLevelId[] = [1, 2];

// Subnivel 1 = enunciado abstracto, subnivel 2 = enunciado directo
const SUB_LEVEL_LABEL_KEYS: Record<SubLevelId, string> = {
  1: "abstractStatement",
  2: "directStatement",
};

const PracticePage = () => {
  const t = useTranslations("home.practice");
  const router = useRouter();
  const locale = useLocale();

  // El módulo de práctica no edita el diagrama principal, pero el
  // Header requiere este callback (lo usan NewDiagram/SaveLoadFile).
  const onErDocChange = (_evt: ErDocChangeEvent) => {};

  const [autoLayoutEnabled, setAutoLayoutEnabled] = useState<boolean | null>(
    null,
  );

  const [level, setLevel] = useState<LevelId>(1);
  const [subLevel, setSubLevel] = useState<SubLevelId>(1);

  const handleLevelChange = (newLevel: LevelId) => {
    setLevel(newLevel);
    setSubLevel(1);
  };

  const handleSolve = () => {
    router.push(`/${locale}/practice/solve?level=${level}&sub=${subLevel}`);
  };

  return (
    <Context.Provider value={{ autoLayoutEnabled, setAutoLayoutEnabled }}>
      <div className="flex h-screen w-screen flex-col">
        {/* Barra superior, idéntica a la del editor principal */}
        <div className="flex h-[10%] w-full justify-between border-b border-b-border bg-[#232730] min-[1340px]:h-[5%]">
          <Header onErDocChange={onErDocChange} />
        </div>

        {/* Contenido del módulo de práctica */}
        <div className="h-[90%] w-full overflow-y-auto bg-[#1a1d24] min-[1340px]:h-[95%]">
          <div className="mx-auto max-w-5xl px-6 py-10">
            <h1 className="mb-1 text-2xl font-bold text-slate-100">
              {t("title")}
            </h1>
            <p className="mb-8 text-slate-400">{t("subtitle")}</p>

            {/* Selector de nivel */}
            <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleLevelChange(lvl)}
                  aria-pressed={level === lvl}
                  className={`flex h-16 flex-col items-center justify-center rounded-lg border text-lg font-semibold transition-colors ${
                    level === lvl
                      ? "border-purple-500 bg-purple-600/20 text-purple-300"
                      : "border-border bg-[#232730] text-slate-300 hover:border-slate-500 hover:bg-[#2b3040]"
                  }`}
                >
                  <span className="text-xs font-normal uppercase tracking-wide text-slate-500">
                    {t("level")}
                  </span>
                  {lvl}
                </button>
              ))}
            </div>

            {/* Selector de subnivel */}
            <div className="mb-8 flex gap-2">
              {SUB_LEVELS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSubLevel(sub)}
                  aria-pressed={subLevel === sub}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    subLevel === sub
                      ? "bg-purple-600 text-white"
                      : "bg-[#232730] text-slate-400 hover:bg-[#2b3040]"
                  }`}
                >
                  {t(SUB_LEVEL_LABEL_KEYS[sub])}
                </button>
              ))}
            </div>

            {/* Área del ejercicio */}
            <div className="rounded-lg border border-border bg-[#232730] p-8">
              <ExerciseForLevel
                level={level}
                subLevel={subLevel}
                onSolve={handleSolve}
              />
            </div>
          </div>
        </div>
      </div>
    </Context.Provider>
  );
};

const ExerciseForLevel = ({
  level,
  subLevel,
  onSolve,
}: {
  level: LevelId;
  subLevel: SubLevelId;
  onSolve: () => void;
}) => {
  const t = useTranslations("home.practice");

  const exercise = getExercise(level, subLevel);

  return (
    <div className="text-left text-slate-400">
      <h2 className="mb-3 text-center text-lg font-semibold text-slate-200">
        {t("levelLabel", { level })} — {t(SUB_LEVEL_LABEL_KEYS[subLevel])}
      </h2>
      <p className="leading-relaxed">
        {exercise?.statement ?? t("placeholder")}
      </p>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={onSolve}
          className="rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-500"
        >
          {t("solve")}
        </button>
      </div>
    </div>
  );
};

export default PracticePage;
