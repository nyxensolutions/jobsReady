import { NextRequest, NextResponse } from "next/server"
import { ALL_POSTS } from "@/data/blog"
import { HI_TRANSLATIONS } from "@/data/blog/translations"
import { buildCarousel, buildOnePager, type Format, type Lang } from "@/lib/socialSlides"
import { SITE_URL } from "@/lib/seo"

/**
 * Hindi blog carousels for the social posting bot.
 *
 * Sibling of `/api/social/feed`, and deliberately the same shape: the bot holds
 * no database credentials and no content of its own, it renders exactly what it
 * is handed. The difference is that this route needs no employers, which is why
 * it exists — the job feed cannot fill a carousel until enough employers have
 * signed up, and an account that posts nothing until then never starts.
 *
 * Only posts with a Hindi translation are eligible. Seeker content is Hindi
 * only, and a Hindi card linking to an English article sends someone who reads
 * Hindi to a page they cannot read.
 */

export const dynamic = "force-dynamic"

/**
 * The posts that may be published in English.
 *
 * Deliberately a short allowlist and not "all of them". Seeker content is
 * Hindi-only by design: the audience is Hindi-first, and mirroring the whole
 * catalogue into English would halve the relevance of the feed and double the
 * posting rate without reaching anyone new.
 *
 * These eight are the exceptions — office and back-office roles whose readers
 * generally do work in English, and the money and paperwork explainers whose
 * terms (CTC, PF, ESI, salary slip) are read in English even by people who
 * speak Hindi all day. A delivery or security guard post is not on this list
 * and should not be added to it.
 */
const ENGLISH_ELIGIBLE = new Set([
  "bpo-telecaller-jobs-in-bangalore",
  "data-entry-jobs-from-home-real-pay",
  "ctc-vs-in-hand-salary-explained",
  "how-to-read-your-salary-slip",
  "pf-withdrawal-process-explained",
  "resume-for-freshers-without-experience",
  "common-interview-questions-freshers-answers",
  "phone-interview-tips-for-jobs",
])

export async function GET(req: NextRequest) {
  const secret =
    req.headers.get("x-social-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.SOCIAL_FEED_TOKEN || secret !== process.env.SOCIAL_FEED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = req.nextUrl.searchParams

  /**
   * `carousel` (five slides) or `onepager` (one). The two run as separate
   * rotations over the same articles, which is the point: a post that has
   * already been a carousel can still make a one-pager, so 15 translations
   * cover roughly twice as many slots. The caller keeps a per-format
   * `exclude` list to hold the two apart.
   */
  const formatParam = params.get("format") ?? "carousel"
  if (formatParam !== "carousel" && formatParam !== "onepager") {
    return NextResponse.json(
      { error: `Unknown format "${formatParam}". Expected "carousel" or "onepager".` },
      { status: 400 },
    )
  }
  const format: Format = formatParam
  const builder = format === "onepager" ? buildOnePager : buildCarousel

  const langParam = params.get("lang") ?? "hi"
  if (langParam !== "hi" && langParam !== "en") {
    return NextResponse.json(
      { error: `Unknown lang "${langParam}". Expected "hi" or "en".` },
      { status: 400 },
    )
  }
  const lang: Lang = langParam

  /**
   * Hindi reads from the translation; English reads from the post itself,
   * which already carries the same fields the builders need. So English needs
   * no new content written — only the decision about which posts qualify.
   */
  const build = (post: (typeof ALL_POSTS)[number]) =>
    lang === "en"
      ? builder(post, post, "en")
      : builder(post, HI_TRANSLATIONS[post.slug], "hi")

  /** Slugs the caller has posted recently, so a rotation does not repeat. */
  const exclude = new Set(
    (params.get("exclude") ?? "").split(",").map(s => s.trim()).filter(Boolean),
  )

  const requested = params.get("slug")?.trim()

  // Hindi needs a translation to exist; English needs the post to be on the
  // allowlist above. Both are "is there anything to build from".
  const eligible = ALL_POSTS.filter(p =>
    lang === "en" ? ENGLISH_ELIGIBLE.has(p.slug) : Boolean(HI_TRANSLATIONS[p.slug]),
  )

  if (requested) {
    const post = eligible.find(p => p.slug === requested)
    if (!post) {
      return NextResponse.json(
        {
          // Say which rule rejected it. The two languages exclude posts for
          // entirely different reasons, and "no Hindi translation" on an
          // English request sends whoever reads it looking in the wrong place.
          error: lang === "en"
            ? `"${requested}" is not on the English allowlist.`
            : `No Hindi translation for "${requested}".`,
          available: eligible.map(p => p.slug),
        },
        { status: 404 },
      )
    }
    return NextResponse.json(decorate(post.slug, build(post)))
  }

  /**
   * Oldest-posted first, so the rotation covers everything before repeating.
   * `exclude` is the bot's memory; with none supplied this is simply the
   * newest post, which is the right answer for a one-off manual run.
   */
  const queue = eligible.filter(p => !exclude.has(p.slug))

  if (!queue.length) {
    return NextResponse.json({
      ready: false,
      // `exhausted` is the difference between "nothing today" and "nothing
      // ever again": the caller opens an issue on this, because a rotation
      // that has run out looks exactly like a healthy one that posted
      // yesterday, and would otherwise go quiet without telling anyone.
      exhausted: true,
      format,
      skipReason:
        `All ${eligible.length} translated post(s) have been used for this ` +
        `format. Translate more posts, or clear the bot's ${format} state to ` +
        `start the rotation again.`,
      carousel: null,
    })
  }

  // Walk the queue until one builds: a post whose article has no card-shaped
  // content should cost a skipped slot, not a broken post.
  const skipped: { slug: string; reason: string }[] = []
  for (const post of queue) {
    const built = build(post)
    if (!built.skipReason) return NextResponse.json(decorate(post.slug, built))
    skipped.push({ slug: post.slug, reason: built.skipReason })
  }

  return NextResponse.json({
    ready: false,
    // Every remaining article was tried and none could build. There is nothing
    // left to come back to tomorrow, so this is exhaustion too.
    exhausted: true,
    format,
    skipReason: `No eligible post produced a ${format}.`,
    skipped,
    carousel: null,
  })
}

function decorate(slug: string, carousel: ReturnType<typeof buildCarousel>) {
  const post = ALL_POSTS.find(p => p.slug === slug)!
  return {
    ready: carousel.skipReason === null,
    skipReason: carousel.skipReason,
    generatedAt: new Date().toISOString(),
    carousel: carousel.skipReason
      ? null
      : {
          ...carousel,
          // The Hindi article, not the English one — the card is Hindi.
          url: `${SITE_URL}/hi/blog/${post.category}/${slug}`,
        },
  }
}
