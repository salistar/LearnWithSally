export type LanguageCode = "es" | "fr" | "de" | "ja" | "ko" | "zh";

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string; // emoji flag, no network needed
  learners: string;
  /** How Sally greets in this language (used on Home). */
  hello: string;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
}

export interface Phrase {
  text: string;
  translation: string;
  pronunciation: string;
}

export interface Lesson {
  id: string; // e.g. "es-1-3"
  unitId: string;
  languageCode: LanguageCode;
  order: number; // 1-based position inside the unit
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  goals: string[];
  vocabulary: VocabularyItem[];
  phrases: Phrase[];
  topics: string[];
  /** First thing Sally says when the student joins. */
  introMessage: string;
}

export interface Unit {
  id: string; // e.g. "es-1"
  languageCode: LanguageCode;
  order: number;
  level: string; // CEFR level, e.g. "A1"
  title: string;
  description: string;
}

export type LessonStatus = "completed" | "in-progress" | "not-started";
