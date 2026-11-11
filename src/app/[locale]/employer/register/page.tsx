import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerSetupForm from "@/components/employer/EmployerSetupForm"

export default async function EmployerRegisterPage() {
  const session = await getServerSession()
  if (!session) redirect("/login?role=employer")

  const [dbUser, employer] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
  ])
  if (!dbUser) redirect("/login?role=employer")
  if (dbUser.role === "SEEKER") redirect("/seeker/dashboard")
  // Already registered → go to dashboard
  if (employer) redirect("/employer/dashboard")

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  })

  // A password account signed up with this address, so it is the credential
  // rather than an optional contact detail: the form pre-fills and locks it,
  // and will not complete until it has been confirmed. Phone and Google
  // employers are unaffected and keep the optional field they always had.
  const emailIsCredential = session.firebase?.sign_in_provider === "password"

  return (
    <EmployerSetupForm
      cities={cities.map((c) => c.name)}
      accountEmail={dbUser.email}
      emailIsCredential={emailIsCredential}
      alreadyVerified={dbUser.emailVerified}
    />
  )
}
