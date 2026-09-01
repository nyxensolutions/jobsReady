import { prisma } from "@/lib/db"
import { Plan, Subscription } from "@prisma/client"

export type ActiveSub = Subscription & { plan: Plan }

/** Returns the employer's current ACTIVE or TRIAL subscription, or null (free tier). */
export async function getActiveSub(employerId: string): Promise<ActiveSub | null> {
  return prisma.subscription.findFirst({
    where: {
      employerId,
      status: { in: ["ACTIVE", "TRIAL"] },
      expiresAt: { gt: new Date() },
    },
    include: { plan: true },
    orderBy: { expiresAt: "desc" },
  })
}

/**
 * Effectively uncapped. Used rather than a sentinel like -1 so every existing
 * `>=` / `<=` comparison keeps working untouched.
 */
export const UNLIMITED = Number.MAX_SAFE_INTEGER

/**
 * Free-tier limits — currently the launch offer.
 *
 * The plans page advertises ten capabilities as included for free, headlined
 * "Hire for free. No limits." These values are what actually enforce that, so
 * anything capped here silently breaks an advertised feature: the previous
 * activeJobLimit of 1 blocked a second job posting outright, and zero unlock
 * and boost credits made two more advertised features unusable.
 *
 * When paid plans launch, tighten these back up *and* update the plans page in
 * the same change.
 */
export const FREE_LIMITS = {
  activeJobLimit: UNLIMITED,
  candidateUnlockCredits: UNLIMITED,
  boostCredits: UNLIMITED,
  isHighReach: true,
}

export interface PlanLimits {
  activeJobLimit: number
  candidateUnlockCredits: number
  boostCredits: number
  isHighReach: boolean
  unlocksLeft: number
  boostsLeft: number
  sub: ActiveSub | null
}

/** Returns resolved limits for an employer (sub or free). */
export async function getPlanLimits(employerId: string): Promise<PlanLimits> {
  const sub = await getActiveSub(employerId)
  if (!sub) {
    return { ...FREE_LIMITS, unlocksLeft: UNLIMITED, boostsLeft: UNLIMITED, sub: null }
  }
  return {
    activeJobLimit: sub.plan.activeJobLimit,
    candidateUnlockCredits: sub.plan.candidateUnlockCredits,
    boostCredits: sub.plan.boostCredits,
    isHighReach: true,
    unlocksLeft: sub.plan.candidateUnlockCredits - sub.candidateUnlocksUsed,
    boostsLeft: sub.plan.boostCredits - sub.boostsUsed,
    sub,
  }
}

/** Count employer's currently ACTIVE jobs. */
export async function countActiveJobs(employerId: string): Promise<number> {
  return prisma.jobListing.count({
    where: { employerId, status: "ACTIVE" },
  })
}

/** Check if employer can post another job. Returns null (ok) or error message. */
export async function checkPostJobLimit(employerId: string): Promise<string | null> {
  const [limits, activeCount] = await Promise.all([
    getPlanLimits(employerId),
    countActiveJobs(employerId),
  ])
  if (activeCount >= limits.activeJobLimit) {
    return `Your plan allows ${limits.activeJobLimit} active job${limits.activeJobLimit > 1 ? "s" : ""}. Close an existing job or upgrade to post more.`
  }
  return null
}
