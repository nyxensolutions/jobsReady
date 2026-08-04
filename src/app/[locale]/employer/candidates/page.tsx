import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import CandidateSearchClient from "@/components/employer/CandidateSearchClient"

type SearchParams = {
  city?: string
  category?: string
  q?: string
  minExp?: string
  page?: string
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")
  if (!employer) redirect("/employer/register")

  // Employer's active jobs for the invite picker
  const activeJobs = await prisma.jobListing.findMany({
    where: { employerId: employer.id, status: "ACTIVE" },
    select: { id: true, title: true, city: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  // Categories for filter dropdown
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true, nameEn: true },
    orderBy: { sortOrder: "asc" },
  })

  // NCR cities for filter dropdown
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    select: { name: true, slug: true },
    orderBy: { name: "asc" },
  })

  // Initial candidate fetch (SSR with current filters)
  const city = sp.city?.trim()
  const category = sp.category?.trim()
  const keyword = sp.q?.trim()
  const minExp = sp.minExp ? parseInt(sp.minExp) : undefined
  const page = Math.max(1, parseInt(sp.page ?? "1"))
  const take = 24

  const where = {
    city: { not: null } as any,
    skills: { isEmpty: false },
    isOpenToWork: true,
    ...(city ? { city: { contains: city, mode: "insensitive" as const } } : {}),
    ...(category ? { preferredCategories: { hasSome: [category] } } : {}),
    ...(minExp !== undefined ? { experienceYears: { gte: minExp } } : {}),
    ...(keyword ? {
      OR: [
        { bio: { contains: keyword, mode: "insensitive" as const } },
        { skills: { hasSome: [keyword] } },
      ],
    } : {}),
  }

  const [candidates, total] = await Promise.all([
    prisma.seekerProfile.findMany({
      where,
      select: {
        id: true, name: true, city: true, stateCode: true,
        experienceYears: true, skills: true, preferredCategories: true,
        preferredJobTypes: true, bio: true, photoUrl: true, updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.seekerProfile.count({ where }),
  ])

  return (
    <CandidateSearchClient
      initialCandidates={candidates as any}
      initialTotal={total}
      initialPage={page}
      activeJobs={activeJobs as any}
      categories={categories}
      cities={cities}
      filters={{ city, category, keyword, minExp: sp.minExp }}
      companyName={employer.companyName}
    />
  )
}
