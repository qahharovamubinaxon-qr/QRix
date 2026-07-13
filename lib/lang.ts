// Site-wide UI language list (Mission 69). The homepage/nav language switcher
// and every component that reads the persisted "language" value share this.
// Content pages under /use/[lang] keep their own list in usecase-content.ts.

export type Lang =
  | "en" | "ru" | "uz" | "zh" | "hi" | "es" | "ar" | "fr"
  | "pt" | "id" | "de" | "ja" | "tr" | "ur" | "bn";

export type SiteLang = { code: Lang; label: string; name: string; flag: string; rtl?: boolean };

export const SITE_LANGS: SiteLang[] = [
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "ru", label: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "uz", label: "UZ", name: "Oʻzbek", flag: "🇺🇿" },
  { code: "zh", label: "ZH", name: "中文", flag: "🇨🇳" },
  { code: "hi", label: "HI", name: "हिन्दी", flag: "🇮🇳" },
  { code: "es", label: "ES", name: "Español", flag: "🇪🇸" },
  { code: "ar", label: "AR", name: "العربية", flag: "🇸🇦", rtl: true },
  { code: "fr", label: "FR", name: "Français", flag: "🇫🇷" },
  { code: "pt", label: "PT", name: "Português", flag: "🇵🇹" },
  { code: "id", label: "ID", name: "Bahasa", flag: "🇮🇩" },
  { code: "de", label: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "JA", name: "日本語", flag: "🇯🇵" },
  { code: "tr", label: "TR", name: "Türkçe", flag: "🇹🇷" },
  { code: "ur", label: "UR", name: "اردو", flag: "🇵🇰", rtl: true },
  { code: "bn", label: "BN", name: "বাংলা", flag: "🇧🇩" },
];

const CODES = new Set(SITE_LANGS.map((l) => l.code));
export const isLang = (v: unknown): v is Lang => typeof v === "string" && CODES.has(v as Lang);
export const isRtlLang = (l: string): boolean => l === "ar" || l === "ur";

/** Read the persisted UI language (defaults to English). Browser only. */
export function readLang(): Lang {
  try {
    const v = localStorage.getItem("language");
    if (isLang(v)) return v;
  } catch { /* SSR / blocked storage */ }
  return "en";
}
