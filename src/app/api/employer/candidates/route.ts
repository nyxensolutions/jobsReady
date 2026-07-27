import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const city = searchParams.get("city")?.trim()
  const category = searchParams.get("category")?.trim()
  const keyword = searchParams.get("q")?.trim()
  const minExp = searchParams.get("minExp") ? parseInt(searchParams.get("minExp")!) : undefined
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const take = 24

  const candidates = await prisma.seekerProfile.findMany({
    where: {
      city: { not: null },
      skills: { isEmpty: false },
      isOpenToWork: true,
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(category ? { preferredCategories: { hasSome: [category] } } : {}),
      ...(minExp !== undefined ? { experienceYears: { gte: minExp } } : {}),
      ...(keyword ? {
        OR: [
          { bio: { contains: keyword, mode: "insensitive" } },
          { skills: { hasSome: [keyword] } },
        ],
      } : {}),
    },
    select: {
      id: true,
      name: true,
      city: true,
      stateCode: true,
      experienceYears: true,
      skills: true,
      preferredCategories: true,
      preferredJobTypes: true,
      bio: true,
      photoUrl: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
    skip: (page - 1) * take,
    take,
  })

  const total = await prisma.seekerProfile.count({
    where: {
      city: { not: null },
      skills: { isEmpty: false },
      isOpenToWork: true,
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(category ? { preferredCategories: { hasSome: [category] } } : {}),
      ...(minExp !== undefined ? { experienceYears: { gte: minExp } } : {}),
      ...(keyword ? {
        OR: [
          { bio: { contains: keyword, mode: "insensitive" } },
          { skills: { hasSome: [keyword] } },
        ],
      } : {}),
    },
  })

  return NextResponse.json({ candidates, total, page, pages: Math.ceil(total / take) })
}
