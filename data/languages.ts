import { Language, LanguageCode } from "@/types/learning";

export const LANGUAGES: Language[] = [
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", hello: "Hola" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", hello: "Bonjour" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", hello: "Konnichiwa" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", hello: "Annyeong" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", hello: "Hallo" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", hello: "Nǐ hǎo" },
];

export function getLanguage(code: LanguageCode | null | undefined): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}

