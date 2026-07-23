"use client"

import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Search, MapPin, X } from "lucide-react"

type Props = {
  defaultQuery?: string
  defaultCity?: string
}

export default function JobSearchBar({ defaultQuery = "", defaultCity = "" }: Props) {
  const t = useTranslations("home.hero")
  const router = useRouter()
  const [query, setQuery] = useState(defaultQuery)
  const [city, setCity] = useState(defaultCity)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (city) params.set("city", city)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
      <div className="flex items-center flex-1 gap-2 px-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-400 py-2.5 bg-transparent"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex items-center flex-1 gap-2 px-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
        <MapPin size={16} className="text-gray-400 shrink-0" />
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t("locationPlaceholder")}
          className="flex-1 text-sm text-gray-900 outline-none placeholder-gray-400 py-2.5 bg-transparent"
        />
        {city && (
          <button type="button" onClick={() => setCity("")}>
            <X size={14} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <button
        type="submit"
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shrink-0"
      >
        {t("searchButton")}
      </button>
    </form>
  )
}
