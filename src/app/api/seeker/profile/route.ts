import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

// GET /api/seeker/profile — current seeker's profile (used by the mobile app;
// the web app renders this server-side instead, via a Server Component).
export async function GET() {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "SEEKER") {
    return NextResponse.json({ error: "Not a seeker account" }, { status: 403 })
  }

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: session.uid } })
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  return NextResponse.json({ ...profile, phone: dbUser.phone, email: dbUser.email })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "SEEKER") {
    return NextResponse.json({ error: "Not a seeker account" }, { status: 403 })
  }

  const {
    name, city, bio, skills, preferredJobTypes, experienceYears,
    isOpenToWork, openToRelocate, preferredCities, languages,
  } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const patch = {
    name: name.trim(),
    city: city?.trim() || null,
    bio: bio?.trim() || null,
    skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
    preferredJobTypes: Array.isArray(preferredJobTypes) ? preferredJobTypes : [],
    experienceYears: experienceYears != null ? parseInt(experienceYears) : 0,
    isOpenToWork: isOpenToWork ?? true,
    openToRelocate: openToRelocate ?? true,
    preferredCities: Array.isArray(preferredCities) ? preferredCities.filter(Boolean) : [],
    languages: Array.isArray(languages) ? languages.filter(Boolean) : [],
  }

  const profile = await prisma.seekerProfile.upsert({
    where: { userId: session.uid },
    create: { userId: session.uid, ...patch },
    update: patch,
  })

  return NextResponse.json({ success: true, profile })
}
