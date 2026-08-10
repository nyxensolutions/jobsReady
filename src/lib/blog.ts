import { ALL_POSTS } from "@/data/blog"
import { BLOG_CATEGORIES, getBlogCategory } from "@/data/blog/categories"
import { blockText, type BlogPost, type Block } from "@/data/blog/types"

const WORDS_PER_MINUTE = 200

/** Stable anchor id for a heading — used by the TOC and by heading elements. */
export function anchorId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
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

/** Same category first, then anything else, to fill three slots. */
export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const sameCategory = ALL_POSTS.filter((p) => p.category === post.category && p.slug !== post.slug).sort(byNewest)
  const others = ALL_POSTS.filter((p) => p.category !== post.category && p.slug !== post.slug).sort(byNewest)
  return [...sameCategory, ...others].slice(0, limit)
}

export function postUrl(post: BlogPost): string {
  return `/blog/${post.category}/${post.slug}`
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

export { BLOG_CATEGORIES, getBlogCategory }
export type { BlogPost, Block }
