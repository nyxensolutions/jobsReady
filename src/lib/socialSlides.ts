import type { Block, BlogPost, PostTranslation } from "@/data/blog/types"
import { BLOG_CATEGORIES } from "@/data/blog/categories"

/**
 * Turns a Hindi blog post into an Instagram carousel.
 *
 * The slides are *extracted* from the article, never written freshly. That is
 * the whole point: every number on a card — ₹19,000, 12 घंटे, 7 तारीख — is a
 * string lifted verbatim from a block the editorial process already approved.
 * A generator that paraphrased could put a salary on a card with our logo on it
 * that appears nowhere in the article, and in this category an invented salary
 * is the one mistake that is not forgiven.
 *
 * The cost of that guarantee is that slides read like an article, because they
 * are one. The ordering below is what buys most of it back: tables and callouts
 * first, headings last, because a row like
 *   "फुल-टाइम · ₹24,000 – ₹34,000 · हाथ में ₹19,000 – ₹27,000"
 * is already a finished slide, while an h2 is only a topic.
 */

export type Slide = {
  /** One emoji, chosen from the block's own shape — never from its meaning. */
  icon: string
  text: string
  kind: "hook" | "fact" | "cta"
}

export type Carousel = {
  slug: string
  /** Blog category label, shown as the eyebrow on every slide. */
  tag: string
  /** Hindi post title — the caption's first line, not rendered on a card. */
  title: string
  slides: Slide[]
  /** Why a post produced no carousel, for the bot to log instead of guessing. */
  skipReason: string | null
}

/** Slides between the hook and the CTA. Five total is the carousel. */
const FACT_SLIDES = 3

/**
 * Devanagari renders taller and wider than Latin at the same point size, and
 * the card is read on a phone at arm's length. Past roughly this many
 * characters the renderer has to drop a size step and the slide stops being
 * glanceable, so an over-long candidate is rejected rather than shrunk.
 */
const MAX_SLIDE_CHARS = 84
const MIN_SLIDE_CHARS = 18

/** The hook slide has no label or values beside it, so it can run longer. */
const HOOK_MAX_CHARS = 104

/** Hindi sentences end in a danda; question marks and full stops also appear. */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[।?!.])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
}

/**
 * A slide earns its place by being concrete. Money, counts and time windows are
 * what a seeker stops scrolling for; a sentence of context is what they skip.
 */
function concreteness(text: string): number {
  let score = 0
  if (/₹/.test(text)) score += 3
  if (/\d/.test(text)) score += 2
  if (/(घंटे|दिन|महीने|तारीख|साल|%)/.test(text)) score += 1
  // Hedging language is the opposite of a fact worth a slide.
  if (/(हो सकता|शायद|आमतौर पर|लगभग)/.test(text)) score -= 1
  return score
}

function iconFor(kind: Block["type"], text: string): string {
  if (/₹/.test(text)) return "💰"
  if (kind === "table") return "📊"
  if (kind === "callout") return "⚠️"
  if (/(PF|ESI|CTC)/.test(text)) return "📄"
  return "✅"
}

/**
 * An extracted fragment that opens a quotation without closing it is half of a
 * sample answer — the interview post is full of them — and reads as a typo on a
 * card. Checked for both straight and curly pairs, since the Hindi copy uses
 * both.
 */
function quotesBalanced(text: string): boolean {
  const straight = (text.match(/"/g) ?? []).length
  const open = (text.match(/“/g) ?? []).length
  const close = (text.match(/”/g) ?? []).length
  return straight % 2 === 0 && open === close
}

/** Trims to a whole sentence under the cap rather than cutting mid-word. */
function fit(text: string, cap = MAX_SLIDE_CHARS): string | null {
  const clean = text.replace(/\s+/g, " ").trim()
  if (!quotesBalanced(clean)) return null
  if (clean.length <= cap) return clean.length >= MIN_SLIDE_CHARS ? clean : null
  const parts = sentences(clean)
  let out = ""
  for (const s of parts) {
    if ((out + " " + s).trim().length > cap) break
    out = (out + " " + s).trim()
  }
  if (!quotesBalanced(out)) return null
  return out.length >= MIN_SLIDE_CHARS ? out : null
}

type Candidate = { text: string; icon: string; score: number }

/**
 * Pulls every slide-shaped line out of the article, best first.
 *
 * Tables contribute one candidate per row, joined with a separator, because a
 * row is a complete comparison and its columns are meaningless apart. The first
 * column is the label; a row whose label is empty is a spacer and is dropped.
 */
function candidates(blocks: Block[]): Candidate[] {
  const out: Candidate[] = []

  for (const block of blocks) {
    switch (block.type) {
      case "table": {
        const head = block.head ?? []
        for (const row of block.rows) {
          const [label, ...rest] = row
          if (!label?.trim()) continue

          /**
           * Every cell carries its column header.
           *
           * A row without its headers is the most dangerous output this file
           * can produce. In the fake-offer article one table compares real pay
           * against what a scam promises; as bare cells that row renders as
           *   "डेटा एंट्री · ₹10,000 – ₹16,000 · ₹35,000 – ₹50,000"
           * which reads as us advertising the inflated figure — the exact claim
           * the article exists to warn against. With headers it reads as the
           * comparison it is, and becomes the strongest slide in the post.
           *
           * A table whose header row is blank cannot be made safe this way, so
           * it falls back to the caption and is scored lower.
           */
          const labelled = rest
            .map((cell, i) => {
              const h = (head[i + 1] ?? "").trim()
              const v = (cell ?? "").trim()
              if (!v) return null
              return h ? `${h}: ${v}` : v
            })
            .filter((s): s is string => Boolean(s))

          if (!labelled.length) continue

          const hasHeaders = head.slice(1).some(h => h?.trim())
          const prefix = hasHeaders ? label.trim() : [block.caption?.trim(), label.trim()].filter(Boolean).join(" — ")

          // Headers make rows long, so drop trailing columns until one fits
          // rather than losing the row entirely. The leading columns are the
          // ones the author put first, which is the right thing to keep.
          let text: string | null = null
          for (let take = labelled.length; take >= 1 && !text; take--) {
            text = fit(`${prefix} — ${labelled.slice(0, take).join(" · ")}`)
          }
          if (!text) continue

          out.push({
            text,
            icon: iconFor("table", text),
            score: concreteness(text) + (hasHeaders ? 2 : 0),
          })
        }
        break
      }
      case "callout": {
        // The title alone is a headline, not a fact; the text carries the point.
        const text = fit(block.text)
        if (text) {
          out.push({
            text,
            icon: block.tone === "warn" ? "⚠️" : "💡",
            // A warning is the single most useful thing we publish to this
            // audience, so it outranks an equally concrete neutral line.
            score: concreteness(text) + (block.tone === "warn" ? 3 : 1),
          })
        }
        break
      }
      case "ul":
      case "ol": {
        for (const item of block.items) {
          const text = fit(item)
          if (text) out.push({ text, icon: iconFor(block.type, text), score: concreteness(text) + 1 })
        }
        break
      }
      case "p": {
        for (const s of sentences(block.text)) {
          const text = fit(s)
          // Prose only competes when it carries a number; otherwise it is the
          // connective tissue of an article and reads as filler on a card.
          if (text && /\d/.test(text)) {
            out.push({ text, icon: iconFor("p", text), score: concreteness(text) })
          }
        }
        break
      }
      default:
        break
    }
  }

  return out
}

/** Collapses near-duplicates, which tables produce in quantity. */
function dedupe(items: Candidate[]): Candidate[] {
  const seenHead = new Set<string>()
  const seenTail = new Set<string>()
  const out: Candidate[] = []
  for (const c of items) {
    const norm = c.text.replace(/\s+/g, " ")
    // Two rows of one table often differ only in a trailing clause.
    const head = norm.slice(0, 28)
    /**
     * …and just as often differ only in the *leading* one. The CTC article's
     * salary table ends three consecutive rows with "पूरा आपको मिलता है", which
     * filled the whole carousel with the same sentence and never reached the
     * deductions the article is actually about.
     */
    const tail = norm.slice(-20)
    if (seenHead.has(head) || seenTail.has(tail)) continue
    seenHead.add(head)
    seenTail.add(tail)
    out.push(c)
  }
  return out
}

export function buildCarousel(post: BlogPost, hi: PostTranslation): Carousel {
  const tag = BLOG_CATEGORIES.find(c => c.slug === post.category)?.label ?? "Jobs24India"

  /**
   * The hook slide carries less furniture than a fact slide — no label, no
   * trailing values — so it can hold a longer line at the same type size.
   * Without the extra room the Ghaziabad post was dropped entirely for an
   * excerpt two characters over the fact cap.
   */
  const hook = fit(hi.excerpt, HOOK_MAX_CHARS) ?? fit(hi.description, HOOK_MAX_CHARS)
  if (!hook) {
    return {
      slug: post.slug,
      tag,
      title: hi.title,
      slides: [],
      skipReason: "No excerpt or description short enough to use as a hook.",
    }
  }

  const facts = dedupe(candidates(hi.blocks))
    .sort((a, b) => b.score - a.score)
    .slice(0, FACT_SLIDES)

  if (facts.length < FACT_SLIDES) {
    return {
      slug: post.slug,
      tag,
      title: hi.title,
      slides: [],
      skipReason:
        `Only ${facts.length} usable fact slide(s); ${FACT_SLIDES} needed. ` +
        `The article has no table, callout or list short enough to fit a card.`,
    }
  }

  return {
    slug: post.slug,
    tag,
    title: hi.title,
    skipReason: null,
    slides: [
      { icon: "👇", text: hook, kind: "hook" },
      ...facts.map(f => ({ icon: f.icon, text: f.text, kind: "fact" as const })),
      {
        icon: "🔎",
        // No URL on the card: Instagram does not linkify it and a seeker cannot
        // type it from a reel. The caption and the bio carry the link.
        text: "पूरी जानकारी — लिंक बायो में",
        kind: "cta",
      },
    ],
  }
}
