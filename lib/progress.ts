import { getUnitsForLanguage } from "@/data/units";
import { getLessonsForUnit } from "@/data/lessons";
import { Lesson, LanguageCode, Unit } from "@/types/learning";

/** First lesson not completed yet (or the last one if everything is done). */
export function getCurrentLesson(code: LanguageCode, completedIds: string[]): { unit: Unit; lesson: Lesson } | null {
  for (const unit of getUnitsForLanguage(code)) {
    const lessons = getLessonsForUnit(unit.id);
    const next = lessons.find((l) => !completedIds.includes(l.id));
    if (next) return { unit, lesson: next };
  }
  const units = getUnitsForLanguage(code);
  const lastUnit = units[units.length - 1];
  if (!lastUnit) return null;
  const lessons = getLessonsForUnit(lastUnit.id);
  const last = lessons[lessons.length - 1];
  return last ? { unit: lastUnit, lesson: last } : null;
}
