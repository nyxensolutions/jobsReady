import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import EmployerSetupForm from "@/components/employer/EmployerSetupForm"

export default async function EmployerRegisterPage() {
  const session = await getServerSession()
  if (!session) redirect("/login?role=employer")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser) redirect("/login?role=employer")

  // Already registered → go to dashboard
  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (employer) redirect("/employer/dashboard")

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  })

  return <EmployerSetupForm cities={cities.map((c) => c.name)} />
}
