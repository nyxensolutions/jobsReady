import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import AdminPanel from "@/components/admin/AdminPanel"
// Note: assertAdmin not used here — inline check avoids extra round-trip since
// we already have the session and only need the isAdmin flag.

export default async function AdminPage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid }, select: { isAdmin: true } })
  if (!dbUser?.isAdmin) redirect("/")

  return <AdminPanel />
}
