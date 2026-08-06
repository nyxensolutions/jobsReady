import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerShell from "@/components/employer/EmployerShell"

/**
 * Shared layout for all /employer/* pages.
 * Fetches employer data server-side, passes to the EmployerShell client
 * component which renders the collapsible sidebar + main content area.
 */
export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])

  // Non-employers and unregistered users: let child pages handle their own redirects
  if (!dbUser || dbUser.role !== "EMPLOYER" || !employer) {
    return <>{children}</>
  }

  const jobCount = await prisma.jobListing.count({ where: { employerId: employer.id } })

  return (
    <EmployerShell
      companyName={employer.companyName}
      companyInitial={employer.companyName.charAt(0).toUpperCase()}
      contactPerson={employer.contactPerson}
      jobCount={jobCount}
    >
      {children}
    </EmployerShell>
  )
}
