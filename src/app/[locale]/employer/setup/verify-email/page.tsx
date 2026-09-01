import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import VerifyEmailClient from "./VerifyEmailClient"

type Props = {
  searchParams: Promise<{ error?: string; success?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const sp = await searchParams

  const dbUser = await prisma.user.findUnique({
    where: { id: session.uid },
    select: { email: true, emailVerified: true },
  })

  if (!dbUser) redirect("/login")
  if (dbUser.emailVerified) redirect("/employer/dashboard")

  return (
    <VerifyEmailClient
      currentEmail={dbUser.email ?? null}
      errorParam={sp.error ?? null}
    />
  )
}
