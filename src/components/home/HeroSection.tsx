"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState } from "react"
import { Search, MapPin } from "lucide-react"

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
    <section className="relative bg-gradient-to-br from-[#eef3ff] via-[#f5f7ff] to-white border-b border-slate-100 overflow-hidden">
      {/* Subtle background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a3461]/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-400/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left: text + search */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white border border-orange-200 text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              {t("badge")}
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#1a3461] leading-[1.15] mb-4">
              {t("title")}
            </h1>
            <p className="text-slate-500 text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
              {t("subtitle")}
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch}>
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
            <div className="mt-5 flex flex-wrap items-center gap-2">
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

          {/* Right: photo with floating cards */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative w-full max-w-md aspect-[4/3]">
              {/* Main image */}
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/hero-seeker.jpg"
                  alt="Blue-collar workers finding jobs in India"
                  width={560}
                  height={420}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>

              {/* Floating card: Jobs live */}
              <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">💼</div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">50,000+</p>
                  <p className="text-[10px] text-gray-400 font-medium">Active Jobs</p>
                </div>
              </div>

              {/* Floating card: Companies */}
              <div className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">🏢</div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">5,000+</p>
                  <p className="text-[10px] text-gray-400 font-medium">Companies Hiring</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
