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
import { alternatesFor, SITE_URL } from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: "Jobs24India — Find Jobs Across India",
    description:
      "India's fastest-growing job portal for delivery, driver, security, sales, factory, housekeeping and frontline workers. Apply to lakhs of verified jobs near you — no CV needed.",
    alternates: alternatesFor(locale, "/"),
    openGraph: {
      title: "Jobs24India — Find Jobs Across India",
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

// WebPage JSON-LD: identifies the home page as the authoritative root of the site.
const homeWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/#webpage`,
  url: SITE_URL,
  name: "Jobs24India — Find Jobs. Hire People.",
  isPartOf: { "@id": `${SITE_URL}/#website` },
  about: { "@id": `${SITE_URL}/#organization` },
  description:
    "India's fastest-growing job portal for delivery, driver, security, sales, factory, housekeeping and frontline workers. Apply to lakhs of verified jobs near you — no CV needed.",
  inLanguage: "en-IN",
  potentialAction: [
    {
      "@type": "ReadAction",
      target: [SITE_URL],
    },
  ],
}

// ItemList JSON-LD: hints Google about the top destination pages on the site.
// Combined with the site-wide WebSite + SearchAction schema in layout.tsx,
// this gives Google the signals it needs to generate sitelinks in search results.
const homeItemListJsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Jobs24India — Top Sections",
  description: "Key pages and job categories on Jobs24India",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Browse All Jobs",
      url: `${SITE_URL}/jobs`,
      description: "Search lakhs of verified jobs near you — delivery, driver, security, sales and more",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Delivery Jobs",
      url: `${SITE_URL}/jobs?category=delivery`,
      description: "Find delivery partner and courier jobs across India",
    },
    {
      "@type": "ListItem",
      position: 3,
      name: "Driver Jobs",
      url: `${SITE_URL}/jobs?category=driving`,
      description: "Car driver, cab driver and logistics driving jobs",
    },
    {
      "@type": "ListItem",
      position: 4,
      name: "Security Guard Jobs",
      url: `${SITE_URL}/jobs?category=security-guard`,
      description: "Security guard and watchman jobs across India",
    },
    {
      "@type": "ListItem",
      position: 5,
      name: "Sales Jobs",
      url: `${SITE_URL}/jobs?category=sales`,
      description: "Field sales, telesales and retail sales jobs",
    },
    {
      "@type": "ListItem",
      position: 6,
      name: "Post a Job — Hire Talent",
      url: `${SITE_URL}/login`,
      description: "Employers: post jobs and hire verified frontline workers for free",
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeWebPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListJsonLd) }}
      />
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
