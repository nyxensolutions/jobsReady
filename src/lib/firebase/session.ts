import { cookies } from "next/headers"
import { adminAuth } from "./admin"

export const SESSION_COOKIE = "firebase-session"
export const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000 // 5 days

export async function getServerSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value
  if (!sessionCookie) return null
  try {
    return await adminAuth.verifySessionCookie(sessionCookie, true)
  } catch {
    return null
  }
}

export async function createSessionCookie(idToken: string) {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS })
}
