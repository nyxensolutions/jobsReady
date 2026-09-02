import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Fetch user row and both profile rows in parallel — we don't know the
  // role until we have dbUser, but the profile queries are cheap and running
  // all three together saves one network round-trip to Supabase.
  const [dbUser, seekerProfile, employerProfile] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.seekerProfile.findUnique({ where: { userId: session.uid }, select: { name: true, photoUrl: true } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid }, select: { companyName: true, contactPerson: true, logoUrl: true } }),
  ])

  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (dbUser.role === "SEEKER") {
    const name = seekerProfile?.name
    const isPhonePlaceholder = !name || /^\+?\d+$/.test(name)
    return NextResponse.json({ name: isPhonePlaceholder ? null : name, role: dbUser.role, photoUrl: seekerProfile?.photoUrl || null })
  }

  if (dbUser.role === "EMPLOYER") {
    return NextResponse.json({ name: employerProfile?.contactPerson ?? employerProfile?.companyName ?? null, role: dbUser.role, photoUrl: employerProfile?.logoUrl || null })
  }

  return NextResponse.json({ name: "Admin", role: dbUser.role })
}
