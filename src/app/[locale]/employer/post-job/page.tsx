import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import PostJobForm from "@/components/employer/PostJobForm"
import { Briefcase } from "lucide-react"

export default async function PostJobPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) redirect("/employer/register")

  const [categories, cities] = await Promise.all([
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
  ])

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Briefcase size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-gray-500 text-sm mt-2">
            Posting as <span className="font-semibold text-gray-700">{employer.companyName}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <PostJobForm categories={categories} cities={cities} />
        </div>
      </div>
    </div>
  )
}
