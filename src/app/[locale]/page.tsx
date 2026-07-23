import { useTranslations } from "next-intl"
import HeroSection from "@/components/home/HeroSection"
import CategoryGrid from "@/components/home/CategoryGrid"
import HowItWorks from "@/components/home/HowItWorks"
import StatsBar from "@/components/home/StatsBar"

export default function HomePage() {
  const t = useTranslations("home")

  return (
    <div className="flex flex-col">
      <HeroSection />
      <StatsBar />
      <CategoryGrid />
      <HowItWorks />
    </div>
  )
}
