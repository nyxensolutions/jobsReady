import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

/**
 * Returns true if the current session belongs to a user with isAdmin=true.
 * Works regardless of the user's role (SEEKER or EMPLOYER).
 * Use this in every admin API route and admin page instead of checking role === "ADMIN".
 */
export async function assertAdmin(): Promise<boolean> {
  const session = await getServerSession()
  if (!session) return false
  const dbUser = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { isAdmin: true },
  })
  return dbUser?.isAdmin === true
}
