import { locales, defaultLocale } from "@/i18n/config"

/**
 * The canonical origin, and the only place the site's own host is decided.
 *
 * It must carry the `www`. Vercel serves www as the primary domain and 308s
 * the apex to it, so a canonical, hreflang or sitemap URL without the www
 * points at a redirect — and a canonical that redirects is discarded, while
 * hreflang alternates that redirect are commonly ignored wholesale. For two
 * months `NEXT_PUBLIC_APP_URL` was set to the apex, every page declared a
 * canonical that redirected away from itself, and Search Console reported 332
 * pages not indexed against 14 indexed.
 *
 * Anything that needs the public origin imports this rather than reading the
 * environment variable again with its own default; several copies of that
 * default is how the wrong host survived in the first place.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.jobs24india.com"
export const SITE_NAME = "Jobs24India"

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

/**
 * Canonical + hreflang for content that only exists in some languages (the blog).
 *
 * `translated` lists the non-default locales that have a *real* translation of
 * this page. Rules:
 *  - hreflang advertises only the default locale plus those translations — never
 *    a locale that would just serve the English text under another URL.
 *  - A locale without a translation (ta, te, hl, or hi on an untranslated post)
 *    canonicalises to the English URL, so the English-text duplicates it serves
 *    are not indexed as separate pages.
 */
export function contentAlternates(locale: string, path: string, translated: readonly string[]) {
  const available = [defaultLocale, ...translated]
  const canonicalLocale = available.includes(locale as (typeof available)[number]) ? locale : defaultLocale

  const languages: Record<string, string> = {}
  for (const l of available) languages[l] = absoluteUrl(localePath(l, path))
  languages["x-default"] = absoluteUrl(localePath(defaultLocale, path))

  return { canonical: absoluteUrl(localePath(canonicalLocale, path)), languages }
}
