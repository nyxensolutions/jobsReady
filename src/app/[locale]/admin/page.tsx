import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import AdminPanel from "@/components/admin/AdminPanel"

export default async function AdminPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "ADMIN") redirect("/")

  return <AdminPanel />
}
