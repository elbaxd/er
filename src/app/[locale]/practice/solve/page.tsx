"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Body from "../../../components/Body";
import Header from "../../../components/Header/Header";
import { Context } from "../../../context";
import { erDocWithoutLocation } from "../../../util/common";
import { DiagramChange, ErDocChangeEvent, ErrorMessage } from "../../../types/CodeEditor";
import { ER } from "../../../../ERDoc/types/parser/ER";
import {
  LevelId,
  SubLevelId,
  ValidationResult,
  getExercise,
  validateAnswer,
} from "../exercises";

const parseLevelParam = (value: string | null): LevelId => {
  const parsed = Number(value);
  return parsed >= 1 && parsed <= 6 ? (parsed as LevelId) : 1;
};

const parseSubLevelParam = (value: string | null): SubLevelId => {
  const parsed = Number(value);
  return parsed === 1 ? 1 : 2;
};

const SolvePage = () => {
  const t = useTranslations("home.practice");
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();

  const level = parseLevelParam(searchParams.get("level"));
  const subLevel = parseSubLevelParam(searchParams.get("sub"));
  const exercise = getExercise(level, subLevel);

  const [autoLayoutEnabled, setAutoLayoutEnabled] = useState<boolean | null>(
    null,
  );
  const [erDoc, setErDoc] = useState<ER | null>(null);
  const [lastChange, setLastChange] = useState<DiagramChange | null>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [editorErrors, setEditorErrors] = useState<ErrorMessage[]>([]);

  // Misma lógica que el editor principal: sincroniza erDoc con lo que
  // el usuario escribe, evitando re-renders si solo cambió la posición.
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
        // El diagrama cambió: invalida el resultado de la validación
        // anterior, para no dejar un "¡Correcto!" desactualizado.
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

    // Si el código tiene errores de sintaxis/semánticos, se muestran esos
    // en vez de correr la validación estructural/exacta (el diagrama
    // podría estar incompleto o directamente no haberse parseado).
    if (editorErrors.length > 0) {
      setResult({
        correct: false,
        missing: editorErrors.map((err) => err.errorMessage),
      });
      return;
    }

    setResult(validateAnswer(erDoc, exercise.expected));
  };

  const handleBack = () => {
    router.push(`/${locale}/practice`);
  };

  return (
    <Context.Provider value={{ autoLayoutEnabled, setAutoLayoutEnabled }}>
      <div className="flex h-screen w-screen flex-col">
        {/* Barra superior, idéntica a la del editor principal */}
        <div className="flex h-[10%] w-full justify-between border-b border-b-border bg-[#232730] min-[1340px]:h-[5%]">
          <Header onErDocChange={onErDocChange} />
        </div>

        {/* Contenedor del resto de la pantalla: banner de enunciado + editor/diagrama */}
        <div className="flex h-[90%] w-full flex-col min-[1340px]:h-[95%]">
          {/* Banner con el enunciado, botón de volver y botón de validar */}
          <div className="border-b border-border bg-[#232730] px-6 py-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={handleBack}
                  className="mb-1 text-xs text-slate-500 hover:text-slate-300"
                >
                  ← {t("backToLevels")}
                </button>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {t("levelLabel", { level })}
                </p>
                <p className="text-sm text-slate-300">
                  {exercise?.statement ?? t("placeholder")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleValidate}
                className="shrink-0 rounded-md bg-purple-600 px-6 py-2 font-medium text-white transition-colors hover:bg-purple-500"
              >
                {t("validate")}
              </button>
            </div>

            {/* Resultado de la validación */}
            {result && (
              <div
                className={`mt-3 rounded-md px-3 py-2 text-sm ${
                  result.correct
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {result.correct ? (
                  t("correctAnswer")
                ) : (
                  <ul className="list-inside list-disc space-y-1">
                    {result.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Editor de código + diagrama, igual que en el editor principal,
              pero sin los paneles fijos de Errors/Examples: los errores se
              muestran arriba, junto al resultado de "Validar". */}
          <div className="min-h-0 flex-1">
            <Body
              erDoc={erDoc}
              lastChange={lastChange}
              onErDocChange={onErDocChange}
              onErrorMessagesChange={setEditorErrors}
              hideErrorsPanel
              hideExamplesPanel
            />
          </div>
        </div>
      </div>
    </Context.Provider>
  );
};

export default SolvePage;
