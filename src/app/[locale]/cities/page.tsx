import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Browse Jobs by City",
  description: "Find blue-collar jobs near you in Delhi NCR, Noida, Gurugram, Ghaziabad, Meerut, Hapur and other cities across India.",
}

const NCR_CITIES = [
  { name: "Delhi",         slug: "delhi",         img: "/images/cities/delhi.jpg",         state: "Delhi",   tagline: "Capital city, 1000s of openings daily" },
  { name: "Noida",         slug: "noida",         img: "/images/cities/noida.jpg",         state: "UP",      tagline: "IT & logistics hub, fast growing" },
  { name: "Gurugram",      slug: "gurugram",      img: "/images/cities/gurugram.jpg",      state: "Haryana", tagline: "Corporate & delivery hotspot" },
  { name: "Ghaziabad",     slug: "ghaziabad",     img: "/images/cities/ghaziabad.jpg",     state: "UP",      tagline: "Factory & manufacturing jobs" },
  { name: "Faridabad",     slug: "faridabad",     img: "/images/cities/faridabad.jpg",     state: "Haryana", tagline: "Industrial city near Delhi" },
  { name: "Greater Noida", slug: "greater-noida", img: "/images/cities/greater-noida.jpg", state: "UP",      tagline: "Growing hub for warehousing & tech" },
  { name: "Meerut",        slug: "meerut",        img: "/images/cities/meerut.jpg",        state: "UP",      tagline: "Western UP's largest city" },
  { name: "Hapur",         slug: "hapur",         img: "/images/cities/hapur.jpg",         state: "UP",      tagline: "Nearby NCR, growing job market" },
  { name: "Muzaffarnagar", slug: "muzaffarnagar", img: "/images/cities/muzaffarnagar.jpg", state: "UP",      tagline: "Sugar & agri-industry jobs" },
  { name: "Baghpat",       slug: "baghpat",       img: "/images/cities/baghpat.jpg",       state: "UP",      tagline: "Close to Delhi border" },
  { name: "Bulandshahr",   slug: "bulandshahr",   img: "/images/cities/bulandshahr.jpg",   state: "UP",      tagline: "Emerging job market" },
  { name: "Sonipat",       slug: "sonipat",       img: "/images/cities/sonipat.jpg",       state: "Haryana", tagline: "Industrial town near Panipat" },
  { name: "Panipat",       slug: "panipat",       img: "/images/cities/panipat.jpg",       state: "Haryana", tagline: "Textile & manufacturing hub" },
  { name: "Rohtak",        slug: "rohtak",        img: "/images/cities/rohtak.jpg",        state: "Haryana", tagline: "Education & trade city" },
  { name: "Rewari",        slug: "rewari",        img: "/images/cities/rewari.jpg",        state: "Haryana", tagline: "Growing industrial area" },
  { name: "Palwal",        slug: "palwal",        img: "/images/cities/palwal.jpg",        state: "Haryana", tagline: "On Delhi-Agra highway" },
  { name: "Alwar",         slug: "alwar",         img: "/images/cities/alwar.jpg",         state: "Rajasthan", tagline: "NCR's Rajasthan gateway" },
]

const OTHER_CITIES = [
  { name: "Mumbai",     slug: "mumbai",     img: "/images/cities/mumbai.jpg",     state: "Maharashtra" },
  { name: "Bangalore",  slug: "bangalore",  img: "/images/cities/bangalore.jpg",  state: "Karnataka" },
  { name: "Hyderabad",  slug: "hyderabad",  img: "/images/cities/hyderabad.jpg",  state: "Telangana" },
  { name: "Chennai",    slug: "chennai",    img: "/images/cities/chennai.jpg",    state: "Tamil Nadu" },
  { name: "Kolkata",    slug: "kolkata",    img: "/images/cities/kolkata.jpg",    state: "West Bengal" },
  { name: "Pune",       slug: "pune",       img: "/images/cities/pune.jpg",       state: "Maharashtra" },
  { name: "Ahmedabad",  slug: "ahmedabad",  img: "/images/cities/ahmedabad.jpg",  state: "Gujarat" },
]

type CityEntry = { name: string; slug: string; img: string; state: string; tagline?: string }

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
            Job Ready focuses on Delhi NCR and nearby cities first — the region with the most blue-collar job demand in India.
          </p>
        </div>

        {/* NCR section */}
        <div className="mb-3">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-5 rounded-full bg-orange-500 inline-block" />
            <h2 className="text-base font-bold text-gray-800">Delhi NCR &amp; Nearby Cities</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{NCR_CITIES.length} cities</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {NCR_CITIES.map(c => <CityCard key={c.slug} city={c} />)}
          </div>
        </div>

        {/* Other major cities */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-5 rounded-full bg-[#1a3461] inline-block" />
            <h2 className="text-base font-bold text-gray-800">Other Major Cities</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Coming soon — more jobs being added</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {OTHER_CITIES.map(c => <CityCard key={c.slug} city={c} />)}
          </div>
        </div>

        {/* SEO text */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
          <h2 className="font-bold text-gray-800 mb-3">Find Jobs Near You in Delhi NCR</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Job Ready is India's fastest-growing blue-collar job platform, focused on Delhi, Noida, Gurugram, Ghaziabad,
            Faridabad, Meerut, Hapur and the entire NCR belt. Whether you're looking for a delivery job, driver job,
            security guard job, factory worker job, or any other frontline role — find verified openings near you and apply
            in one click. No CV needed, no registration fee, and direct contact with HR.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Delivery jobs Delhi", "Driver jobs Noida", "Security jobs Gurugram", "Factory jobs Ghaziabad", "Cook jobs Faridabad"].map(t => (
              <span key={t} className="text-xs bg-[#EBF3FF] text-[#1a3461] px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
