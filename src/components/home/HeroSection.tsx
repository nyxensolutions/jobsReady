"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { Search, MapPin } from "lucide-react"

const POPULAR_SEARCHES = [
  "Delivery Boy", "Driver", "Security Guard", "Sales Executive", "Cook", "Helper"
]

const QUICK_JOBS = [
  "Delivery Executive", "BPO Executive", "Telecaller", "Driver", "Security Guard",
  "Sales Executive", "Cook", "Data Entry", "Helper", "Factory Worker", "Warehouse", "Nurse",
]

export default function HeroSection() {
  const t = useTranslations("home.hero")
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (location) params.set("city", location)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <section className="relative bg-gradient-to-br from-[#eef3ff] via-[#f5f7ff] to-white border-b border-slate-100 overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a3461]/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none animate-float" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none animate-float-delayed" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left: text + search */}
          <div>
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 bg-white border border-orange-200 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              {t("badge")}
            </div>

            {/* Heading — smaller style (swapped with GetJobNowSection) */}
            <h1 className={`text-2xl sm:text-3xl font-black text-[#1a3461] leading-tight mb-2 transition-all duration-700 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {t("title")}
            </h1>
            <p className={`text-slate-500 text-sm sm:text-base mb-6 max-w-lg leading-relaxed transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {t("subtitle")}
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className={`transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-2 flex flex-col sm:flex-row gap-1.5 max-w-xl">
                {/* Job input */}
                <div className="flex items-center flex-1 gap-2.5 px-3.5 py-1">
                  <Search size={15} className="text-slate-300 shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="flex-1 text-slate-700 text-sm outline-none placeholder-slate-300 py-2 bg-transparent"
                  />
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px bg-slate-100 self-stretch my-2" />

                {/* Location input */}
                <div className="flex items-center flex-1 gap-2.5 px-3.5 py-1">
                  <MapPin size={15} className="text-slate-300 shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t("locationPlaceholder")}
                    className="flex-1 text-slate-700 text-sm outline-none placeholder-slate-300 py-2 bg-transparent"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold rounded-xl text-sm transition-all duration-150 shrink-0 shadow-sm hover:shadow-md flex items-center justify-center gap-1.5"
                >
                  <Search size={14} strokeWidth={2.5} />
                  {t("searchButton")}
                </button>
              </div>
            </form>

            {/* Popular searches */}
            <div className={`mt-5 flex flex-wrap items-center gap-2 transition-all duration-700 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <span className="text-slate-400 text-xs font-medium">{t("popularSearches")}:</span>
              {POPULAR_SEARCHES.map((s) => (
                <button
                  key={s}
                  onClick={() => router.push(`/jobs?q=${encodeURIComponent(s)}`)}
                  className="text-xs bg-white border border-slate-200 hover:border-[#1a3461]/40 hover:text-[#1a3461] hover:bg-[#eef2ff] text-slate-500 px-3 py-1.5 rounded-full transition-all duration-150 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Right: popular job types (stays on bottom where it originally was) */}
          <div className="hidden lg:block">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-4">
              Popular Job Types
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_JOBS.map((job) => (
                <button
                  key={job}
                  onClick={() => router.push(`/jobs?q=${encodeURIComponent(job)}`)}
                  className="bg-white hover:bg-[#1a3461] hover:text-white text-[#1a3461] text-sm font-medium px-4 py-2 rounded-full transition-colors border border-slate-200 shadow-sm"
                >
                  {job}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
