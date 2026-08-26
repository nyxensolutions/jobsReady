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
