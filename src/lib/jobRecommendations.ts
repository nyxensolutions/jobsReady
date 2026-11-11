import { Gender, JobType } from "@prisma/client"
import { prisma } from "./db"

/**
 * Relevance ordering for a signed-in seeker.
 *
 * Scoring happens in application code rather than SQL. There are ~100 live
 * listings, so the cost is nothing, and expressing this as a query would mean
 * a relevance expression no one could read or change. If the live set ever
 * reaches the thousands this needs replacing with a real search index — the
 * cap in `rankJobs` exists to make that failure loud rather than slow.
 */

export interface SeekerSignals {
  skills: string[]
  preferredCategories: string[]
  city: string | null
  preferredCities: string[]
  preferredJobTypes: JobType[]
  gender: Gender | null
  experienceYears: number
}

export interface ScorableJob {
  categorySlug: string | null
  cityName: string | null
  jobType: JobType
  experienceMin: number | null
  genderPreference: Gender | null
  publishedAt: Date | null
  isFeatured: boolean
}

/**
 * Deliberately readable and hand-tuned rather than learned: with 10
 * applications in the system there is nothing to learn from yet, and a
 * transparent rule can be argued with.
 */
export const WEIGHTS = {
  /** The seeker explicitly chose this category. */
  category: 50,
  /** A skill they listed belongs to this job's category. */
  skillCategory: 25,
  /** Their city, or one they said they would move to. */
  city: 30,
  preferredCity: 20,
  jobType: 15,
  /** The role states a gender preference and it is theirs. */
  genderMatch: 20,
  /**
   * Stated and not theirs. Large enough to sink the job below everything
   * relevant, deliberately short of removing it: the seeker still sees the
   * whole board, which is both the fairer behaviour and the legal one.
   */
  genderMismatch: -120,
  experienceFits: 10,
  featured: 5,
  freshBonus: 8,
} as const

const FRESH_DAYS = 7
const MAX_SCORED = 2000

/**
 * The job categories implied by a seeker's listed skills.
 *
 * This is what the Skill table's categorySlugs are for: "Two-Wheeler Riding"
 * implies delivery, driver and field work without anyone matching free text
 * against job descriptions. Skills typed by hand that are not in the
 * vocabulary simply contribute nothing, which is the honest outcome.
 */
export async function categoriesForSkills(skills: string[]): Promise<Set<string>> {
  const out = new Set<string>()
  if (skills.length === 0) return out

  const wanted = skills.map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (wanted.length === 0) return out

  const rows = await prisma.skill.findMany({
    where: { isActive: true },
    select: { nameEn: true, aliases: true, categorySlugs: true },
  })

  for (const row of rows) {
    const names = [row.nameEn.toLowerCase(), ...row.aliases.map((a) => a.toLowerCase())]
    if (wanted.some((w) => names.includes(w))) {
      for (const c of row.categorySlugs) out.add(c)
    }
  }
  return out
}

export interface JobScore {
  score: number
  /**
   * Whether the job is the kind of work this person does, as opposed to
   * merely nearby or within their experience.
   *
   * The distinction matters because almost every job earns something from the
   * incidental weights — being in the right city and asking for no more
   * experience than the seeker has is true of most of the board. Scoring alone
   * put all 106 live jobs in the "recommended" set, Media Anchor included, for
   * a delivery rider. Only a category or skill match makes a job a
   * recommendation; everything else just orders the ones that already are.
   */
  relevant: boolean
}

export function scoreJob(
  job: ScorableJob,
  s: SeekerSignals,
  skillCategories: Set<string>
): JobScore {
  let score = 0
  let relevant = false

  if (job.categorySlug) {
    if (s.preferredCategories.includes(job.categorySlug)) {
      score += WEIGHTS.category
      relevant = true
    } else if (skillCategories.has(job.categorySlug)) {
      score += WEIGHTS.skillCategory
      relevant = true
    }
  }

  if (job.cityName) {
    if (s.city && job.cityName.toLowerCase() === s.city.toLowerCase()) score += WEIGHTS.city
    else if (s.preferredCities.some((c) => c.toLowerCase() === job.cityName!.toLowerCase())) {
      score += WEIGHTS.preferredCity
    }
  }

  if (s.preferredJobTypes.length > 0 && s.preferredJobTypes.includes(job.jobType)) {
    score += WEIGHTS.jobType
  }

  // Unstated on either side is neutral, never a penalty — most seekers will
  // leave this blank and must not be pushed down the list for it.
  const seekerGender =
    s.gender && s.gender !== "PREFER_NOT_TO_SAY" ? s.gender : null
  if (job.genderPreference && seekerGender) {
    score += job.genderPreference === seekerGender ? WEIGHTS.genderMatch : WEIGHTS.genderMismatch
  }

  // A job asking for less experience than they have is a fit; one asking for
  // more is not disqualifying, since stated minimums are often aspirational.
  if (job.experienceMin !== null && job.experienceMin <= s.experienceYears) {
    score += WEIGHTS.experienceFits
  }

  if (job.isFeatured) score += WEIGHTS.featured

  if (job.publishedAt) {
    const days = (Date.now() - job.publishedAt.getTime()) / 86_400_000
    if (days <= FRESH_DAYS) score += WEIGHTS.freshBonus
  }

  return { score, relevant }
}

/**
 * True when the profile can produce a recommendation at all.
 *
 * City is deliberately not enough. Somewhere to work says nothing about what
 * work suits the person, and treating it as a signal would relabel the whole
 * local board as "recommended for you".
 */
export function hasUsableSignals(s: SeekerSignals): boolean {
  return s.preferredCategories.length > 0 || s.skills.length > 0
}

export function rankJobs<T extends { id: string }>(
  jobs: (T & ScorableJob)[],
  s: SeekerSignals,
  skillCategories: Set<string>
): { job: T; score: number; relevant: boolean }[] {
  if (jobs.length > MAX_SCORED) {
    console.warn(
      `[jobRecommendations] scoring ${jobs.length} jobs in memory; past ${MAX_SCORED} this needs a search index`
    )
  }
  return jobs
    .map((job) => {
      const { score, relevant } = scoreJob(job, s, skillCategories)
      return { job: job as T, score, relevant }
    })
    .sort((a, b) => b.score - a.score)
}
