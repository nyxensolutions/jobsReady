import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import VerifyDocsClient from "./VerifyDocsClient"

export default async function VerifyDocsPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") redirect("/login")

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) redirect("/employer/register")

  return <VerifyDocsClient uploadedDocs={employer.docUrls ?? []} />
}
