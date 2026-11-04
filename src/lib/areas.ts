/**
 * Sub-city areas a job can be tagged with.
 *
 * Okhla is not a city — it is an industrial area inside South East Delhi — so
 * it is deliberately not a `City` row. Adding areas as cities would make an
 * Okhla job stop being a Delhi job: `City` is a flat table with no parent, so
 * a seeker filtering "Delhi" would silently miss them, and the city dropdown
 * (rendered by six forms) would grow by a dozen entries per metro.
 *
 * So the area rides on the job as a label, and the job keeps its real city.
 *
 * This is a fixed list rather than free text on purpose. `pincode` is already
 * a free-text field and it is set on 0 of 107 active listings; a free-text
 * area would instead fill up with "Okhla", "okhla", "OKHLA Phase 2" and
 * "Okhla Industrial Area" as four different places, which is worse than empty
 * because it looks like data. The stored value is the slug, so the Hindi name
 * used in social captions comes from here and cannot drift per row.
 *
 * Areas earn their place when an employer would describe the job that way and
 * a seeker would travel differently because of it. Add as the market grows.
 */

export type JobArea = {
  slug: string
  name: string
  /** Used by Hindi seeker surfaces and the social captions. */
  nameHi: string
  /** The `City.slug` this area sits inside. */
  citySlug: string
}

export const JOB_AREAS: JobArea[] = [
  // Delhi — the industrial belts where blue-collar hiring concentrates.
  { slug: "okhla", name: "Okhla", nameHi: "ओखला", citySlug: "delhi" },
  { slug: "mayapuri", name: "Mayapuri", nameHi: "मायापुरी", citySlug: "delhi" },
  { slug: "naraina", name: "Naraina", nameHi: "नरैना", citySlug: "delhi" },
  { slug: "wazirpur", name: "Wazirpur", nameHi: "वज़ीरपुर", citySlug: "delhi" },
  { slug: "bawana", name: "Bawana", nameHi: "बवाना", citySlug: "delhi" },
  { slug: "narela", name: "Narela", nameHi: "नरेला", citySlug: "delhi" },
  { slug: "mundka", name: "Mundka", nameHi: "मुंडका", citySlug: "delhi" },

  // Noida — by sector, which is how both employers and seekers name them.
  { slug: "noida-sector-62", name: "Sector 62", nameHi: "सेक्टर 62", citySlug: "noida" },
  { slug: "noida-sector-63", name: "Sector 63", nameHi: "सेक्टर 63", citySlug: "noida" },
  { slug: "noida-sector-58", name: "Sector 58", nameHi: "सेक्टर 58", citySlug: "noida" },
  { slug: "noida-sector-16", name: "Sector 16", nameHi: "सेक्टर 16", citySlug: "noida" },

  { slug: "udyog-vihar", name: "Udyog Vihar", nameHi: "उद्योग विहार", citySlug: "gurugram" },
]

/** The areas offerable for a city, for a form's area dropdown. */
export function areasForCity(citySlug: string): JobArea[] {
  return JOB_AREAS.filter(a => a.citySlug === citySlug)
}

export function areaBySlug(slug: string): JobArea | undefined {
  return JOB_AREAS.find(a => a.slug === slug)
}

/**
 * Whether this area may be stored against this city. A mismatch is a caller
 * bug — an Okhla area on a Hyderabad job — and is rejected rather than saved,
 * because a wrong area is what sends a seeker across the city for nothing.
 */
export function isAreaInCity(areaSlug: string, citySlug: string): boolean {
  const area = areaBySlug(areaSlug)
  return area !== undefined && area.citySlug === citySlug
}
