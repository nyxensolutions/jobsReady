import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "SEEKER") {
    return NextResponse.json({ error: "Not a seeker account" }, { status: 403 })
  }

  const { name, city, bio, skills, preferredJobTypes, experienceYears, isOpenToWork } = await req.json()

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const data = {
    name: name.trim(),
    city: city?.trim() || null,
    bio: bio?.trim() || null,
    skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
    preferredJobTypes: Array.isArray(preferredJobTypes) ? preferredJobTypes : [],
    experienceYears: parseInt(experienceYears) || 0,
    isProfileComplete: !!(name?.trim() && city?.trim()),
    isOpenToWork: isOpenToWork !== false,
  }

  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...data },
    update: data,
  })

  return NextResponse.json({ success: true })
}
