import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import ResponsesClient from "@/components/employer/ResponsesClient"

export default async function ResponsesPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")
  if (!employer) redirect("/employer/register")

  const applications = await prisma.application.findMany({
    where: { job: { employerId: employer.id } },
    include: {
      seeker: {
        select: {
          id: true, name: true, city: true, experienceYears: true,
          skills: true, bio: true, photoUrl: true, resumeUrl: true,
        },
      },
      job: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/employer/dashboard" className="text-gray-400 hover:text-[#1a3461] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs text-gray-400">Employer Portal</p>
            <p className="text-sm font-semibold text-gray-700">Responses</p>
          </div>
        </div>
      </div>
      <ResponsesClient initialApplications={applications as any} />
    </div>
  )
}
