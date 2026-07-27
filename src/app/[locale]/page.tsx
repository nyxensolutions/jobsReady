import HeroSection from "@/components/home/HeroSection"
import CategoryGrid from "@/components/home/CategoryGrid"
import HowItWorks from "@/components/home/HowItWorks"
import StatsBar from "@/components/home/StatsBar"
import GetJobNowSection from "@/components/home/GetJobNowSection"
import QualificationSection from "@/components/home/QualificationSection"
import CitiesSection from "@/components/home/CitiesSection"

export default function HomePage() {
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
