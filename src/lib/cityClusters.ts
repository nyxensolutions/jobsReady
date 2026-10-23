/**
 * Metro-area groupings a seeker can filter by as one place.
 *
 * Someone looking for work in Noida will take a job in Ghaziabad; making them
 * tick six boxes to see that is friction with no purpose.
 *
 * Each cluster lists every city that belongs to it, including ones not yet in
 * the City table — resolution filters to what exists, so a cluster starts
 * working the moment its cities are added. Only clusters that resolve to more
 * than one city are offered, which is why Mumbai and Bengaluru are defined
 * here but will not appear until their neighbours exist.
 */
export type CityCluster = {
  slug: string
  /** Shown to seekers. Translated client-side via `cities.clusters.<slug>`. */
  name: string
  cities: string[]
}

export const CITY_CLUSTERS: CityCluster[] = [
  {
    slug: "delhi-ncr",
    name: "Delhi NCR",
    cities: [
      "delhi",
      "noida",
      "greater-noida",
      "ghaziabad",
      // "gurgaon" was merged into "gurugram" and deactivated; it stays listed
      // so any link still carrying the old slug resolves.
      "gurgaon",
      "gurugram",
      "faridabad",
      "meerut",
      "hapur",
    ],
  },
  {
    slug: "mumbai-mmr",
    name: "Mumbai MMR",
    cities: ["mumbai", "thane", "navi-mumbai", "kalyan", "vasai-virar", "panvel", "mira-bhayandar"],
  },
  {
    slug: "bengaluru-urban",
    name: "Bengaluru Urban",
    cities: ["bengaluru", "whitefield", "electronic-city", "yelahanka", "hosur"],
  },
  {
    slug: "pune-metro",
    name: "Pune Metro",
    cities: ["pune", "pimpri-chinchwad", "hinjewadi", "chakan"],
  },
  {
    slug: "chennai-metro",
    name: "Chennai Metro",
    cities: ["chennai", "tambaram", "avadi", "sriperumbudur"],
  },
  {
    slug: "hyderabad-metro",
    name: "Hyderabad Metro",
    cities: ["hyderabad", "secunderabad", "cyberabad", "medchal"],
  },
]

const BY_SLUG = new Map(CITY_CLUSTERS.map((c) => [c.slug, c]))

/** True when the value names a cluster rather than a single city. */
export function isCityCluster(slug: string): boolean {
  return BY_SLUG.has(slug)
}

/**
 * Expands any cluster slugs into their member cities, leaving plain city
 * slugs untouched. Duplicates are removed, so overlapping selections are safe.
 */
export function expandCitySlugs(slugs: string[]): string[] {
  const out = new Set<string>()
  for (const slug of slugs) {
    const cluster = BY_SLUG.get(slug)
    if (cluster) cluster.cities.forEach((c) => out.add(c))
    else out.add(slug)
  }
  return [...out]
}
