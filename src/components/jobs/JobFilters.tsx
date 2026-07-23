"use client"

import { useTranslations } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"

const CATEGORIES = [
  { key: "delivery", label: "Delivery" },
  { key: "driver", label: "Driver" },
  { key: "sales", label: "Sales" },
  { key: "security", label: "Security Guard" },
  { key: "housekeeping", label: "Housekeeping" },
  { key: "cook", label: "Cook / Chef" },
  { key: "construction", label: "Construction" },
  { key: "factory", label: "Factory Worker" },
  { key: "retail", label: "Retail" },
  { key: "fieldWork", label: "Field Work" },
  { key: "it", label: "IT / Computer" },
  { key: "healthcare", label: "Healthcare" },
]

const JOB_TYPES = [
  { key: "FULL_TIME", label: "Full Time" },
  { key: "PART_TIME", label: "Part Time" },
  { key: "CONTRACT", label: "Contract" },
  { key: "GIG", label: "Gig / Freelance" },
]

type Props = {
  activeCategory?: string
}

export default function JobFilters({ activeCategory }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
  }

  const currentType = searchParams.get("type")

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
      <h3 className="font-semibold text-gray-900 mb-4 text-sm">Filters</h3>

      {/* Category */}
      <div className="mb-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter("category", c.key)}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                activeCategory === c.key
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Job type */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Job Type</h4>
        <div className="flex flex-col gap-1">
          {JOB_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter("type", t.key)}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                currentType === t.key
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {(activeCategory || currentType) && (
        <button
          onClick={() => router.push("/jobs")}
          className="mt-4 w-full text-xs text-red-500 hover:text-red-700 font-medium py-1.5"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}
