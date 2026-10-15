import { Language, LanguageCode } from "@/types/learning";

export const LANGUAGES: Language[] = [
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", learners: "28.4M", hello: "Hola" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", learners: "19.4M", hello: "Bonjour" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", learners: "12.7M", hello: "Konnichiwa" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷", learners: "9.3M", hello: "Annyeong" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", learners: "8.1M", hello: "Hallo" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳", learners: "7.4M", hello: "Nǐ hǎo" },
];

export function getLanguage(code: LanguageCode | null | undefined): Language | undefined {
  return LANGUAGES.find((l) => l.code === code);
}
