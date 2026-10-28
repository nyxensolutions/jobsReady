import { ALL_POSTS } from "@/data/blog"
import { BLOG_CATEGORIES, CATEGORY_HI, getBlogCategory, type BlogCategory } from "@/data/blog/categories"
import { HI_TRANSLATIONS } from "@/data/blog/translations"
import { blogUi, type ContentLang } from "@/data/blog/ui"
import { blockText, type BlogPost, type Block } from "@/data/blog/types"

const WORDS_PER_MINUTE = 200

/**
 * Stable anchor id for a heading — used by the TOC and by heading elements.
 *
 * Unicode-aware on purpose: letters (\p{L}), combining marks (\p{M}, which carry
 * Devanagari vowel signs) and digits survive, so Hindi headings get real ids
 * instead of collapsing to an empty string. For English text the result is
 * identical to the old ASCII-only version, so existing anchors do not change.
 */
export function anchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

export function readingMinutes(post: BlogPost): number {
  const words = post.blocks.reduce((n, b) => n + blockText(b).split(/\s+/).filter(Boolean).length, 0)
  const faqWords = post.faqs.reduce((n, f) => n + (f.q + " " + f.a).split(/\s+/).length, 0)
  return Math.max(1, Math.round((words + faqWords) / WORDS_PER_MINUTE))
}

export type TocEntry = { id: string; text: string; level: 2 | 3 }

export function tableOfContents(post: BlogPost): TocEntry[] {
  const entries: TocEntry[] = []
  for (const block of post.blocks) {
    if (block.type === "h2") entries.push({ id: anchorId(block.text), text: block.text, level: 2 })
    if (block.type === "h3") entries.push({ id: anchorId(block.text), text: block.text, level: 3 })
  }
  if (post.faqs.length > 0) entries.push({ id: "faqs", text: "FAQs", level: 2 })
  return entries
}

function byNewest(a: BlogPost, b: BlogPost) {
  return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
}

export function getAllPosts(): BlogPost[] {
  return [...ALL_POSTS].sort(byNewest)
}

export function getPost(category: string, slug: string): BlogPost | undefined {
  return ALL_POSTS.find((p) => p.slug === slug && p.category === category)
}

export function getPostsByCategory(category: string): BlogPost[] {
  return ALL_POSTS.filter((p) => p.category === category).sort(byNewest)
}

/** Categories that actually have at least one published post. */
export function getPopulatedCategories() {
  return BLOG_CATEGORIES.filter((c) => ALL_POSTS.some((p) => p.category === c.slug))
}

export function countByCategory(slug: string): number {
  return ALL_POSTS.filter((p) => p.category === slug).length
}

/**
 * Same category first, then anything else, to fill three slots. On Hindi pages
 * translated posts rank first inside each group, so a Hindi reader is pointed at
 * Hindi articles before English ones.
 */
export function getRelatedPosts(post: BlogPost, limit = 3, locale?: string): BlogPost[] {
  const rank = (a: BlogPost, b: BlogPost) => {
    if (locale === "hi") {
      const diff = Number(hasHindi(b.slug)) - Number(hasHindi(a.slug))
      if (diff !== 0) return diff
    }
    return byNewest(a, b)
  }
  const sameCategory = ALL_POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).sort(rank)
  const others = ALL_POSTS.filter((p) => p.category !== post.category && p.slug !== post.slug).sort(rank)
  return [...sameCategory, ...others].slice(0, limit)
}

export function postUrl(post: BlogPost): string {
  return `/blog/${post.category}/${post.slug}`
}

export function formatPostDate(iso: string, lang: ContentLang = "en"): string {
  return new Date(iso).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

// ── Localisation ────────────────────────────────────────────────────────────

export type LocalizedPost = BlogPost & { lang: ContentLang }
export type LocalizedCategory = BlogCategory & { lang: ContentLang }

export function hasHindi(slug: string): boolean {
  return slug in HI_TRANSLATIONS
}

/** Locales (other than the default English) that have a real translation of this post. */
export function translatedLocales(slug: string): string[] {
  return hasHindi(slug) ? ["hi"] : []
}

/**
 * Returns the post in the reader's language when a translation exists, otherwise
 * the English original. `lang` records which one you got so the page chrome can
 * match the content instead of mixing languages.
 */
export function localizePost(post: BlogPost, locale: string): LocalizedPost {
  if (locale === "hi") {
    const hi = HI_TRANSLATIONS[post.slug]
    if (hi) return { ...post, ...hi, author: blogUi("hi").author, lang: "hi" }
  }
  return { ...post, lang: "en" }
}

/** On Hindi pages, translated posts come first; otherwise order is left as given. */
export function localizeAll(posts: BlogPost[], locale: string): LocalizedPost[] {
  const localized = posts.map((p) => localizePost(p, locale))
  if (locale !== "hi") return localized
  return [...localized].sort((a, b) => Number(b.lang === "hi") - Number(a.lang === "hi"))
}

export function localizeCategory(category: BlogCategory, lang: ContentLang): LocalizedCategory {
  const hi = lang === "hi" ? CATEGORY_HI[category.slug] : undefined
  return hi ? { ...category, ...hi, lang } : { ...category, lang }
}

/** Does this category have at least one Hindi article? Decides whether its /hi/ page is worth indexing. */
export function categoryHasHindi(slug: string): boolean {
  return ALL_POSTS.some((p) => p.category === slug && hasHindi(p.slug))
}

export function anyHindi(): boolean {
  return ALL_POSTS.some((p) => hasHindi(p.slug))
}

export { BLOG_CATEGORIES, getBlogCategory }
export type { BlogPost, Block }
