import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { alternatesFor } from "@/lib/seo"

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return {
    title: "Browse Jobs by City — Jobs24India",
    description: "Find verified jobs near you across India — Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Pune, Kolkata, Ahmedabad, Noida, Gurugram and more.",
    alternates: alternatesFor(locale, "/cities"),
  }
}

type CityEntry = { name: string; slug: string; img: string; state: string; tagline?: string }

// Top-tier: national metros shown prominently up front
const METRO_CITIES: CityEntry[] = [
  { name: "Delhi",        slug: "delhi",       img: "/images/cities/delhi.jpg",       state: "Delhi",       tagline: "Capital city — 1000s of openings daily" },
  { name: "Mumbai",       slug: "mumbai",      img: "/images/cities/mumbai.jpg",      state: "Maharashtra", tagline: "Financial capital — delivery, BPO & more" },
  { name: "Bangalore",    slug: "bangalore",   img: "/images/cities/bangalore.jpg",   state: "Karnataka",   tagline: "Tech hub with booming frontline demand" },
  { name: "Hyderabad",    slug: "hyderabad",   img: "/images/cities/hyderabad.jpg",   state: "Telangana",   tagline: "IT & pharma city, growing fast" },
  { name: "Chennai",      slug: "chennai",     img: "/images/cities/chennai.jpg",     state: "Tamil Nadu",  tagline: "Manufacturing & port jobs" },
  { name: "Pune",         slug: "pune",        img: "/images/cities/pune.jpg",        state: "Maharashtra", tagline: "Auto & IT services hub" },
  { name: "Kolkata",      slug: "kolkata",     img: "/images/cities/kolkata.jpg",     state: "West Bengal", tagline: "Eastern India's biggest job market" },
  { name: "Ahmedabad",    slug: "ahmedabad",   img: "/images/cities/ahmedabad.jpg",   state: "Gujarat",     tagline: "Textile & trade city" },
  { name: "Noida",        slug: "noida",       img: "/images/cities/noida.jpg",       state: "UP",          tagline: "IT & logistics hub, fast growing" },
  { name: "Gurugram",     slug: "gurugram",    img: "/images/cities/gurugram.jpg",    state: "Haryana",     tagline: "Corporate & delivery hotspot" },
  { name: "Ghaziabad",    slug: "ghaziabad",   img: "/images/cities/ghaziabad.jpg",   state: "UP",          tagline: "Factory & manufacturing jobs" },
  { name: "Greater Noida",slug: "greater-noida",img: "/images/cities/greater-noida.jpg",state: "UP",       tagline: "Warehousing & tech growth corridor" },
]

// Secondary Delhi NCR + nearby cities — shown in expandable panel
const NCR_MORE_CITIES: CityEntry[] = [
  { name: "Faridabad",    slug: "faridabad",    img: "/images/cities/faridabad.jpg",    state: "Haryana",   tagline: "Industrial city near Delhi" },
  { name: "Meerut",       slug: "meerut",       img: "/images/cities/meerut.jpg",       state: "UP",        tagline: "Western UP's largest city" },
  { name: "Hapur",        slug: "hapur",        img: "/images/cities/hapur.jpg",        state: "UP",        tagline: "Nearby NCR, growing job market" },
  { name: "Muzaffarnagar",slug: "muzaffarnagar",img: "/images/cities/muzaffarnagar.jpg",state: "UP",        tagline: "Sugar & agri-industry jobs" },
  { name: "Baghpat",      slug: "baghpat",      img: "/images/cities/baghpat.jpg",      state: "UP",        tagline: "Close to Delhi border" },
  { name: "Bulandshahr",  slug: "bulandshahr",  img: "/images/cities/bulandshahr.jpg",  state: "UP",        tagline: "Emerging job market" },
  { name: "Sonipat",      slug: "sonipat",      img: "/images/cities/sonipat.jpg",      state: "Haryana",   tagline: "Industrial town near Panipat" },
  { name: "Panipat",      slug: "panipat",      img: "/images/cities/panipat.jpg",      state: "Haryana",   tagline: "Textile & manufacturing hub" },
  { name: "Rohtak",       slug: "rohtak",       img: "/images/cities/rohtak.jpg",       state: "Haryana",   tagline: "Education & trade city" },
  { name: "Rewari",       slug: "rewari",       img: "/images/cities/rewari.jpg",       state: "Haryana",   tagline: "Growing industrial area" },
  { name: "Palwal",       slug: "palwal",       img: "/images/cities/palwal.jpg",       state: "Haryana",   tagline: "On Delhi-Agra highway" },
  { name: "Alwar",        slug: "alwar",        img: "/images/cities/alwar.jpg",        state: "Rajasthan", tagline: "NCR's Rajasthan gateway" },
]

function CityCard({ city, large = false }: { city: CityEntry; large?: boolean }) {
  return (
    <Link
      href={`/jobs?city=${city.slug}`}
      className={`relative group rounded-2xl overflow-hidden flex items-end ${large ? "aspect-[16/9]" : "aspect-[4/3]"}`}
    >
      <Image
        src={city.img}
        alt={`Jobs in ${city.name}`}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 p-4 w-full">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-white font-bold text-lg leading-tight drop-shadow">{city.name}</p>
            <p className="text-white/75 text-xs mt-0.5">{city.tagline ?? city.state}</p>
          </div>
          <span className="shrink-0 text-xs bg-white/20 border border-white/30 text-white font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {city.state}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function CitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-2">Browse Jobs by City</h1>
          <p className="text-gray-500 text-sm max-w-xl">
            Jobs24India covers all major Indian cities — from Delhi and Mumbai to Bangalore, Chennai and beyond.
            Find verified frontline jobs near you, apply in one click.
          </p>
        </div>

        {/* Major cities grid */}
        <div className="mb-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-5 rounded-full bg-orange-500 inline-block" />
            <h2 className="text-base font-bold text-gray-800">Major Cities Across India</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{METRO_CITIES.length} cities</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {METRO_CITIES.map(c => <CityCard key={c.slug} city={c} />)}
          </div>
        </div>

        {/* More Delhi NCR cities — expandable */}
        <details className="mt-8 group">
          <summary className="flex items-center gap-3 cursor-pointer select-none list-none mb-2">
            <span className="w-1 h-5 rounded-full bg-[#1a3461] inline-block" />
            <h2 className="text-base font-bold text-gray-800">More Delhi NCR Cities</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{NCR_MORE_CITIES.length} cities</span>
            <span className="ml-auto text-xs text-[#1a3461] font-semibold group-open:hidden">Show all ↓</span>
            <span className="ml-auto text-xs text-[#1a3461] font-semibold hidden group-open:inline">Collapse ↑</span>
          </summary>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {NCR_MORE_CITIES.map(c => <CityCard key={c.slug} city={c} />)}
          </div>
        </details>

        {/* SEO text */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h2 className="font-bold text-gray-800 mb-3">Find Jobs Near You — Anywhere in India</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Jobs24India is India's fastest-growing job platform, connecting frontline workers with employers
            across Delhi, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Noida, Gurugram and hundreds
            of other cities. Whether you're looking for a delivery job, driver job, security guard job, factory worker job,
            BPO role, or any other frontline opportunity — find verified openings near you and apply in one click.
            No CV needed, no registration fee, direct contact with HR.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              "Delivery jobs Delhi", "Driver jobs Mumbai", "Security jobs Bangalore",
              "Factory jobs Pune", "BPO jobs Hyderabad", "Cook jobs Chennai",
            ].map(t => (
              <span key={t} className="text-xs bg-[#EBF3FF] text-[#1a3461] px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
