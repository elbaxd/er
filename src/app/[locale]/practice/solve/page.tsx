"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Body from "../../../components/Body";
import Header from "../../../components/Header/Header";
import { Context } from "../../../context";
import { erDocWithoutLocation } from "../../../util/common";
import {
  DiagramChange,
  ErDocChangeEvent,
  ErrorMessage,
} from "../../../types/CodeEditor";
import { ER } from "../../../../ERDoc/types/parser/ER";
import {
  LevelId,
  SubLevelId,
  ValidationResult,
  getExercise,
  validateAnswer,
} from "../exercises";
import { markLevelAsCompleted } from "../practiceProgress";

const parseLevelParam = (value: string | null): LevelId => {
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 10 ? (parsed as LevelId) : 1;
};

const parseSubLevelParam = (value: string | null): SubLevelId => {
  const parsed = Number(value);
  return parsed === 1 ? 1 : 2;
};

const SolvePage = () => {
  const searchParams = useSearchParams();
  const level = parseLevelParam(searchParams.get("level"));
  const subLevel = parseSubLevelParam(searchParams.get("sub"));

  return (
    <ExerciseSolver
      key={`${level}-${subLevel}`}
      level={level}
      subLevel={subLevel}
    />
  );
};

const ExerciseSolver = ({
  level,
  subLevel,
}: {
  level: LevelId;
  subLevel: SubLevelId;
}) => {
  const t = useTranslations("home.practice");
  const router = useRouter();
  const locale = useLocale();

  const exercise = getExercise(level, subLevel);

  const [autoLayoutEnabled, setAutoLayoutEnabled] = useState<boolean | null>(
    null,
  );
  const [erDoc, setErDoc] = useState<ER | null>(null);
  const [lastChange, setLastChange] = useState<DiagramChange | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [editorErrors, setEditorErrors] = useState<ErrorMessage[]>([]);

  const onErDocChange = (evt: ErDocChangeEvent) => {
    switch (evt.type) {
      case "json": {
        setLastChange({ type: "json", positions: evt.positions });
        return;
      }
      case "localStorage": {
        setLastChange({ type: "localStorage", positions: evt.positions });
        return;
      }
      case "userInput": {
        const { er } = evt;
        setErDoc((currentEr) => {
          if (currentEr === null) return er;
          const currentErNoLoc = erDocWithoutLocation(currentEr);
          const newErNoLoc = erDocWithoutLocation(er);
          const sameSemanticValue =
            JSON.stringify(currentErNoLoc) === JSON.stringify(newErNoLoc);
          return sameSemanticValue ? currentEr : er;
        });
        setResult(null);
        return;
      }
      default: {
        const exhaustiveCheck: never = evt;
        throw new Error(`Unhandled event type: ${exhaustiveCheck}`);
      }
    }
  };

  const handleValidate = () => {
    if (!exercise) return;

    if (editorErrors.length > 0) {
      setResult({
        correct: false,
        missing: editorErrors.map((err) => err.errorMessage),
      });
      return;
    }

    const validation = validateAnswer(erDoc, exercise.expected);
    setResult(validation);

    if (validation.correct) {
      markLevelAsCompleted(level, subLevel);
    }
  };

  const handleBack = () => {
    router.push(`/${locale}/practice`);
  };

  return (
    <Context.Provider value={{ autoLayoutEnabled, setAutoLayoutEnabled }}>
      <div className="flex h-screen w-screen flex-col">
        {/* Barra superior */}
        <div className="flex h-[10%] w-full justify-between border-b border-b-border bg-[#232730] min-[1340px]:h-[5%]">
          <Header onErDocChange={onErDocChange} />
        </div>

        {/* Editor + Diagrama */}
        <div className="h-[90%] w-full min-[1340px]:h-[95%]">
          <Body
            erDoc={erDoc}
            lastChange={lastChange}
            onErDocChange={onErDocChange}
            onErrorMessagesChange={setEditorErrors}
            hideErrorsPanel
            hideExamplesPanel
            initialContent={exercise?.starterCode}
            persistToLocalStorage={false}
            persistDiagram={false}
            leftPanelHeader={
              <div className="border-b border-border bg-[#232730] px-4 py-3.5 space-y-3">
                {/* Botón superior discreto */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-100"
                  >
                    <span>←</span>
                    <span>{t("backToLevels")}</span>
                  </button>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-purple-300 border border-purple-500/20">
                    NIVEL {level}.{subLevel}
                  </span>
                </div>

                {/* Enunciado con mayor tamaño y contraste */}
                <div className="rounded-lg border border-slate-700/70 bg-[#171a21]/90 p-3.5 shadow-inner">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    {t("levelLabel", { level })}
                  </p>
                  <p className="text-[15px] leading-relaxed text-slate-100 selection:bg-purple-500/30">
                    {exercise?.statement ?? t("placeholder")}
                  </p>
                </div>

                {/* Botón de validación */}
                <button
                  type="button"
                  onClick={handleValidate}
                  className="w-full rounded-md bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-purple-500 active:scale-[0.99]"
                >
                  {t("validate")}
                </button>

                {/* Panel de resultado de validación */}
                {result && (
                  <div
                    className={`rounded-lg p-3.5 transition-all ${
                      result.correct
                        ? "border border-emerald-500/40 bg-emerald-950/40 text-emerald-200"
                        : "border border-red-500/40 bg-red-950/40 text-red-200"
                    }`}
                  >
                    {result.correct ? (
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">🎉</span>
                          <div>
                            <p className="font-semibold text-emerald-300 text-sm">
                              {t("correctAnswer")}
                            </p>
                            <p className="text-xs text-emerald-400/90 mt-0.5">
                              ¡Progreso guardado y nivel completado con éxito!
                            </p>
                          </div>
                        </div>

                        {/* Botón directo y notorio para volver al selector de niveles */}
                        <button
                          type="button"
                          onClick={handleBack}
                          className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-3.5 py-2.5 text-sm font-bold text-white shadow transition-all hover:bg-emerald-500 active:scale-[0.98]"
                        >
                          <span>Volver al selector de niveles</span>
                          <span>→</span>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-400">
                          Revisa los siguientes detalles:
                        </p>
                        <ul className="list-inside list-disc space-y-1 text-xs">
                          {result.missing.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
          />
        </div>
      </div>
    </Context.Provider>
  );
};

export default SolvePage;