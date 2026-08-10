import { locales, defaultLocale } from "@/i18n/config"

export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://jobsready.in"
export const SITE_NAME = "Jobs Ready"

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

/**
 * Locale-prefixed path. `localePrefix` is "as-needed", so the default locale
 * has no prefix — the alternates map must mirror that exactly or Google sees
 * two URLs claiming to be the same page.
 */
export function localePath(locale: string, path = "/"): string {
  const clean = path === "/" ? "" : path
  return locale === defaultLocale ? clean || "/" : `/${locale}${clean}`
}

/** hreflang map covering every configured locale, plus x-default. */
export function languageAlternates(path = "/"): Record<string, string> {
  const map: Record<string, string> = {}
  for (const locale of locales) {
    map[locale] = absoluteUrl(localePath(locale, path))
  }
  map["x-default"] = absoluteUrl(localePath(defaultLocale, path))
  return map
}

/**
 * Canonical + hreflang block for a page's `alternates` metadata.
 * `path` is the locale-independent route, e.g. "/blog/delivery/…".
 */
export function alternatesFor(locale: string, path = "/") {
  return {
    canonical: absoluteUrl(localePath(locale, path)),
    languages: languageAlternates(path),
  }
}
