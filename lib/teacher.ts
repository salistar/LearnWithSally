import { getLanguage } from "@/data/languages";
import { Lesson } from "@/types/learning";

export const CALL_TYPE = "default"; // same value on mobile, API route and Python agent
export const AGENT_USER_ID = "ai-teacher";

export function lessonCallId(lessonId: string, userId: string): string {
  return `lesson-${lessonId}-${userId}`;
}

/**
 * Builds the instructions Sally receives for one lesson. Everything the
 * teacher needs (vocabulary, phrases, goals) is inside the prompt itself, so
 * the Python service only has to read `system_prompt`.
 */
export function buildTeacherPrompt(lesson: Lesson): string {
  const language = getLanguage(lesson.languageCode)?.name ?? "the target language";
  const vocabulary = lesson.vocabulary
    .map((v) => `- ${v.word} (${v.pronunciation}) = ${v.translation}`)
    .join("\n");
  const phrases = lesson.phrases
    .map((p) => `- ${p.text} (${p.pronunciation}) = ${p.translation}`)
    .join("\n");

  return [
    `You are Sally, a warm and playful ${language} teacher (a friendly fox) in a live voice lesson.`,
    `Lesson: "${lesson.title}" — ${lesson.description}.`,
    `Goals: ${lesson.goals.join("; ")}.`,
    `Vocabulary for this lesson:\n${vocabulary}`,
    `Useful phrases:\n${phrases}`,
    "HOW TO TEACH:",
    "- Speak mostly English; use the target language only for the words you teach.",
    "- Teach ONE word or phrase at a time: say it, give a short English translation and one pronunciation tip, then ask the student to repeat it.",
    "- Your turn ENDS at your question. Stop talking and wait for the student.",
    "- Never imagine, simulate or describe the student's answer. Never praise if the student has not actually spoken.",
    "- When the student speaks, react to what you really heard: one short correction or encouragement, then continue.",
    "- Keep every reply to one or two short sentences.",
    "- Stay strictly within this lesson's vocabulary and phrases.",
  ].join("\n\n");
}
