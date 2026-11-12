import { redirect } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerProfileForm from "@/components/employer/EmployerProfileForm"
import EmployerSignInMethods from "@/components/employer/EmployerSignInMethods"
import WhatsAppConsentToggle from "@/components/WhatsAppConsentToggle"
import { ArrowLeft } from "lucide-react"

export default async function EmployerProfilePage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")
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
            logoUrl: employer.logoUrl,
          }} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mt-6">
          <h2 className="text-base font-bold text-gray-900">Sign-in methods</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            How you sign in to this account. Adding a password keeps the same account — it does
            not create a second one.
          </p>
          <EmployerSignInMethods
            currentEmail={dbUser.email}
            emailVerified={dbUser.emailVerified}
          />
        </div>

        {/* employer_plan_expiring_v1 came back from Meta as MARKETING, not
            Utility, so the renewal reminder may only be sent to an employer
            who has opted in. Without this card that template cannot legally
            fire at all. */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mt-6">
          <h2 className="text-base font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Updates about your jobs, applications and payments are always sent. This controls
            the reminders that are not.
          </p>
          <WhatsAppConsentToggle
            initial={dbUser.whatsappOptIn}
            label="Reminders on WhatsApp"
            hint="Jobs24India may message you on WhatsApp before your plan expires and about new features for employers. You can turn this off at any time."
          />
        </div>
      </div>
    </div>
  )
}
