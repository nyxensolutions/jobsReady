import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { CITY_CLUSTERS } from "@/lib/cityClusters"

/**
 * Metro areas a seeker can filter by as one place, e.g. Delhi NCR.
 *
 * Separate from /api/cities because that endpoint returns a bare array which
 * the released app already consumes; adding a key there would break it.
 *
 * Only clusters resolving to more than one existing city are returned. The
 * rest are defined ahead of their cities being added, and would otherwise be
 * a filter that silently matches one place.
 */
export async function GET() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  const existing = new Set(cities.map((c) => c.slug))

  const clusters = CITY_CLUSTERS.map((cluster) => ({
    slug: cluster.slug,
    name: cluster.name,
    cities: cluster.cities.filter((c) => existing.has(c)),
  })).filter((cluster) => cluster.cities.length > 1)

  return NextResponse.json(clusters)
}
