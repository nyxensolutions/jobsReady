import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") return NextResponse.json({ error: "Employers only" }, { status: 403 })

  const { searchParams } = req.nextUrl
  const city = searchParams.get("city")?.trim()
  const category = searchParams.get("category")?.trim()
  const keyword = searchParams.get("q")?.trim()
  const minExp = searchParams.get("minExp") ? parseInt(searchParams.get("minExp")!) : undefined
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const take = 24

  // Each supplied filter adds one clause, ANDed together. Built once and shared
  // by the page query and the count, which previously carried two copies of
  // this and could drift.
  //
  // What is deliberately NOT required: a city, and a non-empty skills list.
  // Requiring both narrowed the whole candidate pool to 8 of 37 seekers — a
  // frontline worker who signed up by OTP has typed neither, and excluding them
  // made Talent Search look empty rather than selective.
  const filters: Prisma.SeekerProfileWhereInput[] = []

  if (city) filters.push({ city: { contains: city, mode: "insensitive" } })

  if (category) {
    // Falls back to the categories a seeker has actually applied in, the same
    // way the daily digest does. Nobody has filled preferredCategories yet —
    // the web picker is days old and mobile does not collect it — so matching
    // on the stated column alone returned nothing for every category.
    filters.push({
      OR: [
        { preferredCategories: { hasSome: [category] } },
        { applications: { some: { job: { category: { slug: category } } } } },
      ],
    })
  }

  if (minExp !== undefined) filters.push({ experienceYears: { gte: minExp } })

  if (keyword) {
    filters.push({
      OR: [
        { bio: { contains: keyword, mode: "insensitive" } },
        { skills: { hasSome: [keyword] } },
      ],
    })
  }

  const where: Prisma.SeekerProfileWhereInput = {
    isOpenToWork: true,
    ...(filters.length > 0 ? { AND: filters } : {}),
  }

  const [candidates, total] = await Promise.all([
    prisma.seekerProfile.findMany({
      where,
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
      // Fuller profiles first, so relaxing the filters above surfaces the
      // sparse ones last rather than mixing them through the list.
      orderBy: [{ isProfileComplete: "desc" }, { updatedAt: "desc" }],
      skip: (page - 1) * take,
      take,
    }),
    prisma.seekerProfile.count({ where }),
  ])

  return NextResponse.json({ candidates, total, page, pages: Math.ceil(total / take) })
}
