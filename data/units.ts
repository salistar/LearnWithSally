import { LanguageCode, Unit } from "@/types/learning";

export const UNITS: Unit[] = [
  { id: "es-1", languageCode: "es", order: 1, level: "A1", title: "First Steps", description: "Greetings, introductions and everyday phrases" },
  { id: "fr-1", languageCode: "fr", order: 1, level: "A1", title: "Premiers pas", description: "Say hello, introduce yourself and order a coffee" },
  { id: "ja-1", languageCode: "ja", order: 1, level: "A1", title: "はじめまして", description: "Polite greetings and first conversations" },
  { id: "ko-1", languageCode: "ko", order: 1, level: "A1", title: "첫걸음", description: "Basic greetings and polite expressions" },
  { id: "de-1", languageCode: "de", order: 1, level: "A1", title: "Erste Schritte", description: "Everyday German for meeting people" },
  { id: "zh-1", languageCode: "zh", order: 1, level: "A1", title: "第一步", description: "Mandarin greetings, numbers and food" },
];

export function getUnitsForLanguage(code: LanguageCode): Unit[] {
  return UNITS.filter((u) => u.languageCode === code).sort((a, b) => a.order - b.order);
}
