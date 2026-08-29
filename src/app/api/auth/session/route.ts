import { NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase/admin"
import { createSessionCookie, SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const { idToken, role } = await req.json()
  if (!idToken) return NextResponse.json({ error: "Missing token" }, { status: 400 })

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(idToken)
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  const assignedRole = (role === "EMPLOYER" ? "EMPLOYER" : "SEEKER") as "SEEKER" | "EMPLOYER"

  // Run DB upsert and session-cookie creation in parallel — they're independent.
  let dbUser: Awaited<ReturnType<typeof prisma.user.upsert>>
  let sessionCookie: string
  try {
    ;[dbUser, sessionCookie] = await Promise.all([
      // Upsert user in DB — role follows whichever login page the user came through
      // so the same phone number can serve both a seeker and employer account.
      prisma.user.upsert({
        where: { id: decoded.uid },
        create: {
          id: decoded.uid,
          phone: decoded.phone_number ?? null,
          email: decoded.email ?? null,
          role: assignedRole,
        },
        update: { role: assignedRole },
      }),
      // Create Firebase session cookie — only needs the idToken, not the DB result
      createSessionCookie(idToken),
    ])
  } catch {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }

  // Profile checks — seeker stub creation and employer requiresProfile are independent
  let requiresProfile = false
  if (dbUser.role === "SEEKER") {
    const exists = await prisma.seekerProfile.findUnique({ where: { userId: dbUser.id } })
    if (!exists) {
      const name = decoded.name ?? decoded.phone_number ?? "New User"
      await prisma.seekerProfile.create({ data: { userId: dbUser.id, name } })
    }
  } else if (dbUser.role === "EMPLOYER") {
    const employer = await prisma.employerProfile.findUnique({ where: { userId: dbUser.id } })
    requiresProfile = !employer
  }

  const response = NextResponse.json({ success: true, role: dbUser.role, requiresProfile })
  response.cookies.set(SESSION_COOKIE, sessionCookie, {
    maxAge: SESSION_MAX_AGE_MS / 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  // Explicitly expire the cookie — more reliable than cookies.delete() across all browsers/CDNs
  response.cookies.set(SESSION_COOKIE, "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  })
  return response
}
