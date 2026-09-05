import "@/lib/firebase/admin" // ensures the firebase-admin app is initialized
import { getMessaging } from "firebase-admin/messaging"
import { prisma } from "@/lib/db"

type PushPayload = {
  title: string
  body: string
  data?: Record<string, string>
}

// Sends a push notification to every device the given user is signed into
// on the mobile app. Safe to call for a user with no registered devices
// (e.g. web-only users) — it's a no-op. Fire-and-forget from callers; never
// throws, since a failed push should never break the request that triggered it.
export async function sendPushToUser(userId: string, payload: PushPayload) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { fcmTokens: true } })
    const tokens = user?.fcmTokens ?? []
    if (tokens.length === 0) return

    const res = await getMessaging().sendEachForMulticast({
      tokens,
      notification: { title: payload.title, body: payload.body },
      data: payload.data,
    })

    // Prune tokens that are no longer valid (app uninstalled, token rotated, etc.)
    const deadTokens = res.responses
      .map((r, i) => (!r.success && isUnregisteredError(r.error?.code) ? tokens[i] : null))
      .filter((t): t is string => t !== null)

    if (deadTokens.length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { fcmTokens: tokens.filter((t) => !deadTokens.includes(t)) },
      })
    }
  } catch (err) {
    console.error("sendPushToUser failed:", err)
  }
}

function isUnregisteredError(code?: string) {
  return code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token"
}

// ── Broadcast ──────────────────────────────────────────────────────────────

/**
 * Seekers and employers are always addressed separately: a message that suits
 * one reads wrong to the other, so there is deliberately no "everyone" option.
 * To reach both, send two broadcasts with their own copy.
 */
export type BroadcastAudience = "SEEKER" | "EMPLOYER"

/** sendEachForMulticast rejects more than 500 tokens in one call. */
const FCM_MULTICAST_LIMIT = 500

export type BroadcastResult = {
  devices: number
  sent: number
  failed: number
  pruned: number
}

/**
 * Pushes to every device belonging to users of one role.
 *
 * Unlike sendPushToUser this reports its outcome rather than swallowing it —
 * an admin pressing "Send" needs to know how many devices it actually reached.
 * Individual token failures are still tolerated; only a total failure throws.
 */
export async function sendPushBroadcast(opts: {
  audience: BroadcastAudience
  title: string
  body: string
  data?: Record<string, string>
}): Promise<BroadcastResult> {
  const users = await prisma.user.findMany({
    where: { role: opts.audience, isActive: true, NOT: { fcmTokens: { isEmpty: true } } },
    select: { id: true, fcmTokens: true },
  })

  // One token can only belong to one user — the newest registration wins, so a
  // shared/handed-down device doesn't get the previous owner's broadcasts.
  const ownerByToken = new Map<string, string>()
  for (const user of users) {
    for (const token of user.fcmTokens) ownerByToken.set(token, user.id)
  }
  const tokens = [...ownerByToken.keys()]
  if (tokens.length === 0) return { devices: 0, sent: 0, failed: 0, pruned: 0 }

  let sent = 0
  let failed = 0
  const deadTokens: string[] = []

  for (let i = 0; i < tokens.length; i += FCM_MULTICAST_LIMIT) {
    const chunk = tokens.slice(i, i + FCM_MULTICAST_LIMIT)
    const res = await getMessaging().sendEachForMulticast({
      tokens: chunk,
      notification: { title: opts.title, body: opts.body },
      data: opts.data,
    })
    sent += res.successCount
    failed += res.failureCount
    res.responses.forEach((r, idx) => {
      if (!r.success && isUnregisteredError(r.error?.code)) deadTokens.push(chunk[idx])
    })
  }

  await pruneTokens(deadTokens, ownerByToken)
  return { devices: tokens.length, sent, failed, pruned: deadTokens.length }
}

/** Drops uninstalled/rotated tokens, one update per affected user. */
async function pruneTokens(deadTokens: string[], ownerByToken: Map<string, string>) {
  if (deadTokens.length === 0) return

  const deadByUser = new Map<string, Set<string>>()
  for (const token of deadTokens) {
    const userId = ownerByToken.get(token)
    if (!userId) continue
    const set = deadByUser.get(userId) ?? new Set<string>()
    set.add(token)
    deadByUser.set(userId, set)
  }

  for (const [userId, dead] of deadByUser) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { fcmTokens: true } })
      if (!user) continue
      await prisma.user.update({
        where: { id: userId },
        data: { fcmTokens: user.fcmTokens.filter((t) => !dead.has(t)) },
      })
    } catch (err) {
      console.error("pruneTokens failed for user", userId, err)
    }
  }
}
