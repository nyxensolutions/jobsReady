"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { Search, MapPin, ChevronRight } from "lucide-react"

const POPULAR_SEARCHES = [
  "Delivery Boy", "Driver", "Security Guard", "Sales Executive", "Cook", "Helper"
]

export default function HeroSection() {
  const t = useTranslations("home.hero")
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (location) params.set("city", location)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <section className="bg-gradient-to-br from-[#f0f4ff] to-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left: text + search */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              50,000+ jobs available across India
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1a3461] leading-tight mb-4">
              {t("title")}
            </h1>
            <p className="text-slate-500 text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
              {t("subtitle")}
            </p>

            <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-md border border-slate-200 p-2 flex flex-col sm:flex-row gap-2 max-w-xl">
              <div className="flex items-center flex-1 gap-2 px-3">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="flex-1 text-slate-700 text-sm outline-none placeholder-slate-400 py-2.5 bg-transparent"
                />
              </div>
              <div className="hidden sm:block w-px bg-slate-200 self-stretch my-1.5" />
              <div className="flex items-center flex-1 gap-2 px-3">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t("locationPlaceholder")}
                  className="flex-1 text-slate-700 text-sm outline-none placeholder-slate-400 py-2.5 bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-sm transition-colors shrink-0 flex items-center gap-1.5"
              >
                {t("searchButton")} <ChevronRight size={14} />
              </button>
            </form>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-xs">{t("popularSearches")}:</span>
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => router.push(`/jobs?q=${encodeURIComponent(s)}`)}
                  className="text-xs bg-white border border-slate-200 hover:border-[#1a3461] hover:text-[#1a3461] text-slate-500 px-3 py-1.5 rounded-full transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right: photo */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-white">
              <Image
                src="/images/hero-seeker.jpg"
                alt="Blue-collar workers finding jobs in India"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
