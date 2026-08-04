export const locales = ["en", "hl", "hi", "te", "ta", "kn", "bn", "pa"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "en"

export const localeNames: Record<Locale, string> = {
  en: "English",
  hl: "Hinglish",
  hi: "हिन्दी",
  te: "తెలుగు",
  ta: "தமிழ்",
  kn: "ಕನ್ನಡ",
  bn: "বাংলা",
  pa: "ਪੰਜਾਬੀ",
}
