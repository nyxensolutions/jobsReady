import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import PostJobForm from "@/components/employer/PostJobForm"
import { Pencil } from "lucide-react"

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")
  if (!employer) redirect("/employer/register")

  const job = await prisma.jobListing.findFirst({
    where: { id, employerId: employer.id },
    include: {
      category: { select: { slug: true } },
      city: { select: { slug: true } },
    },
  })

  if (!job) redirect("/employer/dashboard")
  if (job.status === "CLOSED" || job.status === "EXPIRED") redirect("/employer/dashboard")

  const [categories, cities] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, slug: true, nameEn: true } }),
    prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, slug: true, name: true, stateName: true } }),
  ])

  const initialData = {
    title: job.title,
    categorySlug: job.category.slug,
    citySlug: job.city.slug,
    jobType: job.jobType,
    salaryMin: job.salaryMin?.toString() ?? "",
    salaryMax: job.salaryMax?.toString() ?? "",
    salaryUnit: job.salaryUnit,
    vacancies: job.vacancies.toString(),
    experienceMin: job.experienceMin.toString(),
    qualificationRequired: job.qualificationRequired ?? "",
    description: job.description,
    requirements: job.requirements,
    perks: job.perks,
    pincode: job.pincode ?? "",
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Pencil size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Job</h1>
          <p className="text-gray-500 text-sm mt-1">Changes will be sent for review before going live again.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <PostJobForm
            categories={categories}
            cities={cities}
            initialData={initialData}
            editJobId={id}
          />
        </div>
      </div>
    </div>
  )
}
