import { NextRequest, NextResponse } from "next/server"
import { Gender } from "@prisma/client"

const GENDERS: unknown[] = [Gender.MALE, Gender.FEMALE, Gender.OTHER, Gender.PREFER_NOT_TO_SAY]
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { isSeekerProfileComplete } from "@/lib/seekerProfile"
import { sendSeekerWelcomeEmail } from "@/lib/email"
import { sendSeekerWelcomeWhatsApp } from "@/lib/whatsapp"

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
    name, city, bio, skills, preferredJobTypes, preferredCategories, experienceYears,
    isOpenToWork, openToRelocate, preferredCities, languages, gender,
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
    // Drives the daily digest and employer Talent Search, both of which match
    // on this column; until this form wrote it, every seeker had an empty array.
    preferredCategories: Array.isArray(preferredCategories) ? preferredCategories.filter(Boolean) : [],
    experienceYears: experienceYears != null ? parseInt(experienceYears) : 0,
    isOpenToWork: isOpenToWork ?? true,
    openToRelocate: openToRelocate ?? true,
    preferredCities: Array.isArray(preferredCities) ? preferredCities.filter(Boolean) : [],
    languages: Array.isArray(languages) ? languages.filter(Boolean) : [],
    // Optional and never inferred. An unrecognised value is stored as null
    // rather than rejected, so a stale client cannot fail the whole save.
    gender: GENDERS.includes(gender) ? gender : null,
    // Nothing ever set this: the column was written only by the admin
    // create-user path, so every seeker read as incomplete regardless of what
    // they had filled in. The rule is shared with the backfill.
    isProfileComplete: isSeekerProfileComplete({ name, city, preferredCategories }),
  }

  const existingProfile = await prisma.seekerProfile.findUnique({ where: { userId: session.uid } })

  const profile = await prisma.seekerProfile.upsert({
    where: { userId: session.uid },
    create: { userId: session.uid, ...patch },
    update: patch,
  })

  if (!existingProfile) {
    if (dbUser.email) void sendSeekerWelcomeEmail({ email: dbUser.email, name: profile.name })
    if (dbUser.phone) void sendSeekerWelcomeWhatsApp(dbUser.phone, profile.name)
  }

  return NextResponse.json({ success: true, profile })
}
