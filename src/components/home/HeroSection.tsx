"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
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
    <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
          {t("title")}
        </h1>
        <p className="text-blue-100 text-base sm:text-lg mb-10 max-w-xl mx-auto">
          {t("subtitle")}
        </p>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-2 flex flex-col sm:flex-row gap-2">
          <div className="flex items-center flex-1 gap-2 px-3">
            <Search size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="flex-1 text-gray-800 text-sm outline-none placeholder-gray-400 py-2 bg-transparent"
            />
          </div>
          <div className="hidden sm:block w-px bg-gray-200 self-stretch my-1" />
          <div className="flex items-center flex-1 gap-2 px-3">
            <MapPin size={18} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t("locationPlaceholder")}
              className="flex-1 text-gray-800 text-sm outline-none placeholder-gray-400 py-2 bg-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shrink-0"
          >
            {t("searchButton")}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-blue-200 text-xs">{t("popularSearches")}:</span>
          {POPULAR_SEARCHES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQuery(s)
                router.push(`/jobs?q=${encodeURIComponent(s)}`)
              }}
              className="text-xs bg-blue-500/40 hover:bg-blue-500/60 text-white px-3 py-1 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
