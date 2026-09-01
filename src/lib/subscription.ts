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
 * Effectively uncapped, as an Int the database can hold. Used rather than a
 * sentinel like -1 so every existing `>=` / `<=` comparison keeps working.
 */
export const UNLIMITED = 2_147_483_647

export const FREE_PLAN_SLUG = "free-launch"

/** Ten years — long enough that the free subscription never lapses on its own. */
export const FREE_PLAN_DURATION_DAYS = 3650

/**
 * Fallback for an employer with no subscription at all.
 *
 * This should not happen in practice: every employer is auto-enrolled in the
 * free plan on first access. It exists only so a failed enrolment degrades to
 * something usable rather than blocking the employer entirely.
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

/**
 * Enrols an employer in the free launch plan.
 *
 * Called lazily rather than only at registration so employers created before
 * the free plan existed are picked up too — no backfill migration needed, and
 * it self-heals if an enrolment is ever missed.
 *
 * Returns null if the free plan hasn't been seeded yet, in which case callers
 * fall back to FREE_LIMITS.
 */
export async function ensureFreeSubscription(employerId: string): Promise<ActiveSub | null> {
  const plan = await prisma.plan.findUnique({ where: { slug: FREE_PLAN_SLUG } })
  if (!plan) return null

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + plan.durationDays)

  try {
    return await prisma.subscription.create({
      data: { employerId, planId: plan.id, status: "ACTIVE", expiresAt },
      include: { plan: true },
    })
  } catch {
    // Two concurrent requests can both find no subscription and both try to
    // create one. There's no unique constraint to lean on, so re-read instead
    // of failing — whichever won is fine.
    return getActiveSub(employerId)
  }
}

/**
 * Resolved limits for an employer.
 *
 * Every employer has a subscription — the free launch plan if nothing else —
 * so callers can rely on `sub` being present and don't need a separate
 * free-tier branch.
 */
export async function getPlanLimits(employerId: string): Promise<PlanLimits> {
  const sub = (await getActiveSub(employerId)) ?? (await ensureFreeSubscription(employerId))
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
