import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"

/**
 * One definition of candidate search, shared by the employer Talent Search
 * page and /api/employer/candidates.
 *
 * Those two carried separate copies of this filter and had already drifted:
 * the page supported a `language` filter the API did not, and a fix applied to
 * one left the other untouched.
 */

export interface CandidateFilters {
  city?: string
  category?: string
  keyword?: string
  minExp?: number
  language?: string
}

export const CANDIDATE_SELECT = {
  id: true,
  name: true,
  city: true,
  stateCode: true,
  experienceYears: true,
  skills: true,
  preferredCategories: true,
  preferredJobTypes: true,
  bio: true,
  photoUrl: true,
  updatedAt: true,
  languages: true,
  openToRelocate: true,
  preferredCities: true,
} satisfies Prisma.SeekerProfileSelect

/** Fuller profiles first, so sparse ones sort last rather than mixing through. */
const ORDER_BY: Prisma.SeekerProfileOrderByWithRelationInput[] = [
  { isProfileComplete: "desc" },
  { updatedAt: "desc" },
]

/**
 * A city and a non-empty skills list are deliberately NOT required. Demanding
 * both reduced the pool to 8 of 37 seekers, because a frontline worker who
 * signs up by OTP has typed neither — which made Talent Search look empty
 * rather than selective.
 */
export function candidateWhere(
  f: CandidateFilters,
  opts: { ignoreCategory?: boolean } = {}
): Prisma.SeekerProfileWhereInput {
  const and: Prisma.SeekerProfileWhereInput[] = []

  if (f.city) and.push({ city: { contains: f.city, mode: "insensitive" } })

  if (f.category && !opts.ignoreCategory) {
    // Also matches the categories a seeker has actually applied in, the same
    // fallback the daily digest uses, because preferredCategories is empty for
    // every seeker today.
    and.push({
      OR: [
        { preferredCategories: { hasSome: [f.category] } },
        { applications: { some: { job: { category: { slug: f.category } } } } },
      ],
    })
  }

  if (f.minExp !== undefined && !Number.isNaN(f.minExp)) {
    and.push({ experienceYears: { gte: f.minExp } })
  }

  if (f.language) and.push({ languages: { hasSome: [f.language] } })

  if (f.keyword) {
    and.push({
      OR: [
        { bio: { contains: f.keyword, mode: "insensitive" } },
        { skills: { hasSome: [f.keyword] } },
      ],
    })
  }

  return { isOpenToWork: true, ...(and.length > 0 ? { AND: and } : {}) }
}

export interface CandidateSearchResult {
  candidates: Prisma.SeekerProfileGetPayload<{ select: typeof CANDIDATE_SELECT }>[]
  total: number
  page: number
  pages: number
  /**
   * Populated only when a category filter matched nobody: the same search with
   * the category dropped. Kept separate from `candidates` on purpose — a
   * caller that does not know about this field shows its ordinary empty state
   * rather than silently presenting unrelated people as matches.
   */
  suggested: CandidateSearchResult["candidates"]
  /** The category slug that was dropped to produce `suggested`. */
  relaxedCategory: string | null
}

export async function searchCandidates(
  filters: CandidateFilters,
  page: number,
  take = 24
): Promise<CandidateSearchResult> {
  const where = candidateWhere(filters)

  const [candidates, total] = await Promise.all([
    prisma.seekerProfile.findMany({
      where,
      select: CANDIDATE_SELECT,
      orderBy: ORDER_BY,
      skip: (page - 1) * take,
      take,
    }),
    prisma.seekerProfile.count({ where }),
  ])

  let suggested: CandidateSearchResult["candidates"] = []
  let relaxedCategory: string | null = null

  if (total === 0 && filters.category) {
    suggested = await prisma.seekerProfile.findMany({
      where: candidateWhere(filters, { ignoreCategory: true }),
      select: CANDIDATE_SELECT,
      orderBy: ORDER_BY,
      take,
    })
    if (suggested.length > 0) relaxedCategory = filters.category
  }

  return { candidates, total, page, pages: Math.ceil(total / take), suggested, relaxedCategory }
}
