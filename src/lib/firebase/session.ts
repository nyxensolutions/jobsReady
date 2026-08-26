import { cookies, headers } from "next/headers"
import { adminAuth } from "./admin"

export const SESSION_COOKIE = "firebase-session"
export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

// Web (browser) auth uses the httpOnly session cookie. Mobile has no cookie
// jar, so it sends the raw Firebase ID token as `Authorization: Bearer <idToken>`
// on every request instead. Both paths resolve to the same DecodedIdToken shape,
// so every existing `session.uid` call site keeps working unchanged.
export async function getServerSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value
  if (sessionCookie) {
    try {
      return await adminAuth.verifySessionCookie(sessionCookie, false)
    } catch {
      return null
    }
  }

  const authHeader = (await headers()).get("authorization")
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
  if (!bearerToken) return null
  try {
    return await adminAuth.verifyIdToken(bearerToken)
  } catch {
    return null
  }
}

export async function createSessionCookie(idToken: string) {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS })
}
