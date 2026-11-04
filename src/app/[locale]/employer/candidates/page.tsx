import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import { searchCandidates } from "@/lib/candidateQuery"
import CandidateSearchClient from "@/components/employer/CandidateSearchClient"

type SearchParams = {
  city?: string
  category?: string
  q?: string
  minExp?: string
  language?: string
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
  const language = sp.language?.trim()
  const page = Math.max(1, parseInt(sp.page ?? "1"))
  const take = 24

  const { candidates, total, suggested, relaxedCategory } = await searchCandidates(
    { city, category, keyword, minExp, language },
    page
  )

  return (
    <CandidateSearchClient
      initialCandidates={candidates as any}
      initialTotal={total}
      initialPage={page}
      suggested={suggested as any}
      relaxedCategory={relaxedCategory}
      activeJobs={activeJobs as any}
      categories={categories}
      cities={cities}
      filters={{ city, category, keyword, minExp: sp.minExp, language }}
      companyName={employer.companyName}
    />
  )
}
