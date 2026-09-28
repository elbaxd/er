import { LevelId, SubLevelId } from "./exercises";

const STORAGE_KEY = "erdoc_practice_completed_levels";

export type CompletedLevelsMap = Record<string, boolean>;

/**
 * Obtiene los niveles completados desde localStorage
 */
export const getCompletedLevels = (): CompletedLevelsMap => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Guarda un nivel/subnivel como completado
 */
export const markLevelAsCompleted = (
  level: LevelId,
  subLevel: SubLevelId
): void => {
  if (typeof window === "undefined") return;
  try {
    const current = getCompletedLevels();
    current[`${level}.${subLevel}`] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error("Error al persistir progreso en localStorage", e);
  }
};

/**
 * Regla de desbloqueo:
 * - 1.1 y 1.2: Siempre disponibles desde el inicio.
 * - Para nivel N > 1: Requiere que el subnivel 2 del nivel anterior (N-1) esté completado.
 *   (Por ejemplo, 2.1 y 2.2 requieren haber completado 1.2).
 */
export const isNodeUnlocked = (
  level: LevelId,
  subLevel: SubLevelId,
  completed: CompletedLevelsMap
): boolean => {
  if (level === 1) return true;
  const previousLevel = (level - 1) as LevelId;
  return Boolean(completed[`${previousLevel}.2`]);
};