import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (dbUser.role === "SEEKER") {
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: session.uid }, select: { name: true } })
    return NextResponse.json({ name: profile?.name ?? null, role: dbUser.role })
  }

  if (dbUser.role === "EMPLOYER") {
    const profile = await prisma.employerProfile.findUnique({ where: { userId: session.uid }, select: { companyName: true, contactPerson: true } })
    return NextResponse.json({ name: profile?.contactPerson ?? profile?.companyName ?? null, role: dbUser.role })
  }

  return NextResponse.json({ name: "Admin", role: dbUser.role })
}
