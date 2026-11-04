import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { expandCitySlugs, CITY_CLUSTERS } from "@/lib/cityClusters"
import { areaBySlug, JOB_AREAS } from "@/lib/areas"
import { liveJobWhere } from "@/lib/jobListingQuery"
import { salaryRangeError } from "@/lib/salary"

/**
 * The job feed the social posting bot renders cards from.
 *
 * Every card it produces carries a "verified employer" badge, so this route —
 * not the bot — decides what is allowed to wear one. The bot lives in another
 * repository and has no database access; it renders exactly what it is handed.
 * Keeping the rule here means it sits next to the schema it depends on and
 * cannot drift from what the site itself shows.
 *
 * The gate matters because the listing table is overwhelmingly scraped: at the
 * time of writing, 265 of 271 active jobs came from a scrape and only 6 from a
 * verified employer. A generator that simply took "the newest active jobs"
 * would put a verification badge on aggregated listings every morning,
 * unattended — which is precisely the claim the product is built on not making.
 * `jobs/page.tsx` already withholds the badge from scraped rows; this is the
 * same rule for the social surface.
 *
 * When too few jobs qualify the answer is `ready: false` and an empty list. The
 * caller is expected to skip the slot rather than pad it: no scraped listings,
 * no reposting yesterday's, no filler. A skipped morning is a signal to go and
 * sign up employers, and that signal is only honest if nothing covers it up.
 */

type Slot = "carousel" | "reel"

/**
 * Below these counts a post is not worth making: a three-job carousel reads as
 * an empty jobs board, and the reel template has five card slots to fill.
 */
const SLOT_RULES: Record<Slot, { minimum: number; limit: number }> = {
  carousel: { minimum: 4, limit: 6 },
  reel: { minimum: 5, limit: 5 },
}

function isSlot(value: string): value is Slot {
  return value === "carousel" || value === "reel"
}

export async function GET(req: NextRequest) {
  const secret =
    req.headers.get("x-social-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.SOCIAL_FEED_TOKEN || secret !== process.env.SOCIAL_FEED_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const params = req.nextUrl.searchParams
  const slotParam = params.get("slot") ?? "carousel"
  if (!isSlot(slotParam)) {
    return NextResponse.json(
      { error: `Unknown slot "${slotParam}". Expected "carousel" or "reel".` },
      { status: 400 },
    )
  }

  const rules = SLOT_RULES[slotParam]
  const limit = Math.min(Number(params.get("limit")) || rules.limit, 10)

  /**
   * `cluster` takes either a metro-area slug ("delhi-ncr") or a plain city
   * slug; `expandCitySlugs` resolves both, so the bot does not need to know
   * which is which. Omitting it is allowed but only sensible before a cluster
   * is chosen.
   *
   * An unknown value is rejected rather than resolved to nothing. Sub-city
   * areas are the trap: "okhla" is a real go-to-market target but not a City
   * row, so `expandCitySlugs` hands it back unchanged, the `in` filter matches
   * nothing, and the caller sees a well-formed `ready: false` that looks like
   * "no jobs today" instead of "that place does not exist here". A bot that
   * skips its slot every morning for a typo is the failure mode this route
   * exists to prevent.
   */
  const cluster = params.get("cluster")
  let citySlugs: string[] | null = null
  if (cluster) {
    citySlugs = expandCitySlugs([cluster])
    const known =
      await prisma.city.count({ where: { slug: { in: citySlugs } } }) > 0
    if (!known) {
      return NextResponse.json(
        {
          error: `Unknown cluster "${cluster}". No city in this database matches it.`,
          hint: "Pass a metro cluster slug or a city slug. Sub-city areas such as \"okhla\" are not filterable: no job row carries a pincode yet.",
          clusters: CITY_CLUSTERS.map(c => c.slug),
        },
        { status: 400 },
      )
    }
  }

  /**
   * Narrows the cluster to one sub-city market, so a caption can say "ओखला"
   * and mean it. Validated against the city the area belongs to: an area
   * outside the requested cluster would otherwise produce an honest-looking
   * empty slot instead of saying the request made no sense.
   */
  const area = params.get("area")?.trim() || null
  if (area) {
    const known = areaBySlug(area)
    if (!known) {
      return NextResponse.json(
        { error: `Unknown area "${area}".`, areas: JOB_AREAS.map(a => a.slug) },
        { status: 400 },
      )
    }
    if (citySlugs && !citySlugs.includes(known.citySlug)) {
      return NextResponse.json(
        { error: `Area "${area}" is in ${known.citySlug}, not in cluster "${cluster}".` },
        { status: 400 },
      )
    }
  }

  /** Job ids the caller has already posted recently, so cards do not repeat. */
  const exclude = (params.get("exclude") ?? "")
    .split(",")
    .map(id => id.trim())
    .filter(Boolean)

  const now = new Date()

  const rows = await prisma.jobListing.findMany({
    where: {
      // Live, not merely ACTIVE — the same rule the site's own reads use.
      ...liveJobWhere(now),
      // The two conditions that earn the badge. Neither is negotiable.
      source: "EMPLOYER",
      employer: { status: "VERIFIED" },
      // A card with no pay on it is not worth posting; seekers scroll past it.
      salaryMin: { not: null },
      ...(citySlugs ? { city: { slug: { in: citySlugs } } } : {}),
      ...(area ? { area } : {}),
      ...(exclude.length ? { id: { notIn: exclude } } : {}),
    },
    select: {
      id: true,
      title: true,
      salaryMin: true,
      salaryMax: true,
      salaryUnit: true,
      jobType: true,
      shiftType: true,
      vacancies: true,
      pincode: true,
      area: true,
      publishedAt: true,
      city: { select: { name: true, nameHi: true, slug: true } },
      category: { select: { slug: true, nameEn: true, nameHi: true } },
      employer: { select: { companyName: true } },
    },
    orderBy: { publishedAt: "desc" },
    // Over-fetch so the salary filter below cannot leave us short of `limit`.
    take: limit * 3,
  })

  /**
   * Transposed salary bands predate the API-level validation in `salary.ts`, so
   * rows like "₹5,000 – ₹1,000" are still in the table. They render as nonsense
   * on a card, and a nonsense salary is exactly the kind of detail that costs
   * trust in this category.
   */
  const jobs = rows
    .filter(job => salaryRangeError(job.salaryMin, job.salaryMax) === null)
    .slice(0, limit)
    .map(job => ({
      id: job.id,
      title: job.title,
      company: job.employer.companyName,
      categorySlug: job.category.slug,
      categoryEn: job.category.nameEn,
      categoryHi: job.category.nameHi,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryUnit: job.salaryUnit,
      jobType: job.jobType,
      shiftType: job.shiftType,
      vacancies: job.vacancies,
      cityEn: job.city.name,
      cityHi: job.city.nameHi,
      pincode: job.pincode,
      area: job.area,
      // The Hindi name comes from the vocabulary, never from the row, so a
      // caption cannot end up with four spellings of the same place.
      areaHi: job.area ? (areaBySlug(job.area)?.nameHi ?? null) : null,
      url: `https://www.jobs24india.com/hi/jobs/${job.id}`,
    }))

  const ready = jobs.length >= rules.minimum

  return NextResponse.json({
    slot: slotParam,
    cluster,
    area,
    generatedAt: now.toISOString(),
    minimum: rules.minimum,
    count: jobs.length,
    ready,
    // Said plainly so the caller logs a cause, not just a count.
    skipReason: ready
      ? null
      : `Only ${jobs.length} card-ready job(s); ${rules.minimum} needed. Do not pad with scraped listings — sign up employers instead.`,
    jobs: ready ? jobs : [],
  })
}
