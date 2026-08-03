import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import ApplicantsPanel from "@/components/employer/ApplicantsPanel"

export default async function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id } = await params
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) redirect("/employer/register")

  const job = await prisma.jobListing.findFirst({
    where: { id, employerId: employer.id },
    select: { id: true, title: true, status: true },
  })
  if (!job) notFound()

  const applications = await prisma.application.findMany({
    where: { jobId: id },
    include: {
      seeker: {
        select: {
          id: true, name: true, city: true, experienceYears: true,
          skills: true, bio: true, photoUrl: true, resumeUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Link href="/employer/dashboard" className="text-gray-400 hover:text-[#1a3461] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs text-gray-400">Employer Dashboard</p>
            <p className="text-sm font-semibold text-gray-700">Applicants</p>
          </div>
        </div>
      </div>
      <ApplicantsPanel
        jobId={id}
        jobTitle={job.title}
        initialApplications={applications as any}
      />
    </div>
  )
}
