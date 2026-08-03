import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "SEEKER") {
    return NextResponse.json({ error: "Not a seeker account" }, { status: 403 })
  }

  const { name, city, bio, skills, preferredJobTypes, experienceYears, isOpenToWork } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const profile = await prisma.seekerProfile.upsert({
    where: { userId: session.uid },
    create: {
      userId: session.uid,
      name: name.trim(),
      city: city?.trim() || null,
      bio: bio?.trim() || null,
      skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
      preferredJobTypes: Array.isArray(preferredJobTypes) ? preferredJobTypes : [],
      experienceYears: experienceYears != null ? parseInt(experienceYears) : 0,
      isOpenToWork: isOpenToWork ?? true,
    },
    update: {
      name: name.trim(),
      city: city?.trim() || null,
      bio: bio?.trim() || null,
      skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
      preferredJobTypes: Array.isArray(preferredJobTypes) ? preferredJobTypes : [],
      experienceYears: experienceYears != null ? parseInt(experienceYears) : 0,
      isOpenToWork: isOpenToWork ?? true,
    },
  })

  return NextResponse.json({ success: true, profile })
}
