import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import type { Metadata } from "next"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SeekerBottomNav from "@/components/layout/SeekerBottomNav"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  return {}
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

type InitialAuth = { name: string; role: "SEEKER" | "EMPLOYER" | "ADMIN"; initial: string }

async function getInitialAuth(uid: string): Promise<InitialAuth | null> {
  const dbUser = await prisma.user.findUnique({ where: { id: uid }, select: { role: true } })
  if (!dbUser) return null

  if (dbUser.role === "SEEKER") {
    const profile = await prisma.seekerProfile.findUnique({ where: { userId: uid }, select: { name: true } })
    const raw = profile?.name
    const name = (!raw || /^\+?\d+$/.test(raw)) ? "User" : raw
    return { name, role: "SEEKER", initial: name[0].toUpperCase() }
  }
  if (dbUser.role === "EMPLOYER") {
    const profile = await prisma.employerProfile.findUnique({ where: { userId: uid }, select: { companyName: true, contactPerson: true } })
    const name = profile?.contactPerson ?? profile?.companyName ?? "Employer"
    return { name, role: "EMPLOYER", initial: name[0].toUpperCase() }
  }
  return { name: "Admin", role: "ADMIN", initial: "A" }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const [messages, session] = await Promise.all([getMessages(), getServerSession()])
  const initialAuth = session ? await getInitialAuth(session.uid) : null

  return (
    <NextIntlClientProvider messages={messages}>
      <Header initialAuth={initialAuth} />
      <main className="flex-1">{children}</main>
      <Footer />
      <SeekerBottomNav />
    </NextIntlClientProvider>
  )
}
