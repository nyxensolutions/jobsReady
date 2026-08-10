// Content model for the Jobs Ready career blog.
//
// Posts are plain typed data rather than MDX so that every article shares one
// renderer, one anchor scheme and one set of structured-data rules. That keeps
// the SEO surface (TOC anchors, FAQPage schema, live job widgets) consistent
// across every post without trusting hand-written markup.

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; caption?: string; head: string[]; rows: string[][] }
  | { type: "callout"; tone: "tip" | "warn"; title: string; text: string }
  /** Injects live listings from our own DB — keeps the article fresh and links into job pages. */
  | { type: "jobs"; heading: string; categorySlug?: string; citySlug?: string }
  | { type: "cta"; text: string; label: string; href: string }

export type Faq = {
  q: string
  a: string
}

export type BlogPost = {
  slug: string
  /** Blog category slug — must exist in BLOG_CATEGORIES. */
  category: string
  /** The <h1> on the page. */
  title: string
  /** The <title> tag — deliberately a different keyword variant from `title`. */
  seoTitle: string
  description: string
  /** Shown on listing cards. */
  excerpt: string
  author: string
  publishedAt: string
  updatedAt?: string
  keywords: string[]
  blocks: Block[]
  faqs: Faq[]
}

/** Text-bearing block types, used for word counting and TOC extraction. */
export function blockText(block: Block): string {
  switch (block.type) {
    case "p":
    case "h2":
    case "h3":
      return block.text
    case "ul":
    case "ol":
      return block.items.join(" ")
    case "table":
      return [...block.head, ...block.rows.flat()].join(" ")
    case "callout":
      return `${block.title} ${block.text}`
    case "cta":
      return block.text
    case "jobs":
      return ""
  }
}
