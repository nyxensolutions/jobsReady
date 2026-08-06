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

/** Free-tier limits used when no active subscription. */
export const FREE_LIMITS = {
  activeJobLimit: 1,
  candidateUnlockCredits: 0,
  boostCredits: 0,
  isHighReach: false,
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
    return { ...FREE_LIMITS, unlocksLeft: 0, boostsLeft: 0, sub: null }
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
