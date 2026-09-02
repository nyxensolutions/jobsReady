import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import PostJobWizard from "@/components/employer/PostJobWizard"

type Props = { searchParams: Promise<{ draft?: string }> }

export default async function PostJobPage({ searchParams }: Props) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const { draft: draftId } = await searchParams

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser) redirect("/login")
  if (dbUser.role === "SEEKER") redirect("/seeker/dashboard")
  if (!employer) redirect("/employer/register")

  const [categories, cities, draftJob] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, nameEn: true },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, stateName: true },
    }),
    draftId
      ? prisma.jobListing.findFirst({
          where: { id: draftId, employerId: employer.id, status: "DRAFT" },
          include: {
            category: { select: { slug: true } },
            city: { select: { slug: true } },
          },
        })
      : Promise.resolve(null),
  ])

  return (
    <PostJobWizard
      categories={categories}
      cities={cities}
      companyName={employer.companyName}
      contactPhone={employer.contactPhone ?? ""}
      draftJob={draftJob ?? null}
    />
  )
}
