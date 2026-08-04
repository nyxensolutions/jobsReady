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
      <HeroSection />
      <StatsBar />
      <GetJobNowSection />
      <CategoryGrid />
      <QualificationSection />
      <CitiesSection />
      <HowItWorks />
    </div>
  )
}
