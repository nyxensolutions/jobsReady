import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import HeroSection from "@/components/home/HeroSection"
import CategoryGrid from "@/components/home/CategoryGrid"
import HowItWorks from "@/components/home/HowItWorks"
import StatsBar from "@/components/home/StatsBar"
import GetJobNowSection from "@/components/home/GetJobNowSection"
import QualificationSection from "@/components/home/QualificationSection"
import CitiesSection from "@/components/home/CitiesSection"
import { alternatesFor } from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: "Jobs24India — Find Blue-Collar Jobs in India",
    description:
      "India's fastest-growing job portal for delivery, driver, security, sales, factory, housekeeping and frontline workers. Apply to lakhs of verified jobs near you — no CV needed.",
    alternates: alternatesFor(locale, "/"),
    openGraph: {
      title: "Jobs24India — Find Blue-Collar Jobs in India",
      description: "Lakhs of verified jobs for delivery, driver, security, sales and frontline workers across India.",
      url: "/",
      images: [{ url: "/og-home.png", width: 1200, height: 630, alt: "Jobs24India — Find Jobs. Hire People." }],
    },
    keywords: [
      "blue collar jobs india", "delivery job", "driver job", "security guard job",
      "factory job", "sales job delhi", "jobs near me", "frontline jobs india",
      "jobs24india", "blue collar job portal",
    ],
  }
}

export default async function HomePage() {
  const session = await getServerSession()
  if (session) {
    const user = await prisma.user.findUnique({ where: { id: session.uid }, select: { role: true } })
    if (user?.role === "EMPLOYER") redirect("/employer/dashboard")
    if (user?.role === "ADMIN") redirect("/admin")
    if (user?.role === "SEEKER") redirect("/seeker/dashboard")
  }

  return (
    <div className="flex flex-col">
      <GetJobNowSection />
      <HeroSection />
      <StatsBar />
      <CategoryGrid />
      <QualificationSection />
      <CitiesSection />
      <HowItWorks />
    </div>
  )
}
