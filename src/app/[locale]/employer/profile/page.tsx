import { redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"
import EmployerProfileForm from "@/components/employer/EmployerProfileForm"
import { ArrowLeft } from "lucide-react"

export default async function EmployerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } })
  if (!employer) redirect("/employer/register")

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-6">
          <Link href="/employer/dashboard" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your company information visible to job seekers</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <EmployerProfileForm initial={{
            companyName: employer.companyName,
            industry: employer.industry,
            contactPerson: employer.contactPerson,
            contactPhone: employer.contactPhone,
            city: employer.city,
            website: employer.website,
            description: employer.description,
          }} />
        </div>
      </div>
    </div>
  )
}
