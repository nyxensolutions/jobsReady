"use client"

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

const QUALIFICATIONS = [
  { key: "below10", label: "Below 10th" },
  { key: "10th", label: "10th Pass" },
  { key: "12th", label: "12th Pass" },
  { key: "diploma", label: "Diploma" },
  { key: "graduate", label: "Graduate" },
  { key: "postgraduate", label: "Post Graduate" },
]

const JOB_TYPES = [
  { key: "FULL_TIME", label: "Full Time" },
  { key: "PART_TIME", label: "Part Time" },
  { key: "CONTRACT", label: "Contract" },
  { key: "GIG", label: "Gig / Freelance" },
  { key: "WALK_IN", label: "Walk-in Interview" },
]

const SALARY_RANGES = [
  { key: "5000", label: "₹5,000+" },
  { key: "10000", label: "₹10,000+" },
  { key: "15000", label: "₹15,000+" },
  { key: "20000", label: "₹20,000+" },
  { key: "30000", label: "₹30,000+" },
  { key: "50000", label: "₹50,000+" },
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
  const currentSalary = searchParams.get("minSalary")
  const currentExp = searchParams.get("freshers")
  const currentQual = searchParams.get("qualification")
  const currentPosted = searchParams.get("posted")
  const hasFilters = activeCategory || currentType || currentSalary || currentExp || currentQual || currentPosted

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-sm">Filters</h3>
        {hasFilters && (
          <button
            onClick={() => router.push("/jobs")}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Date Posted */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Date Posted</h4>
        <div className="flex flex-col gap-1.5">
          {[
            { key: "today", label: "Last 24 hours" },
            { key: "week", label: "Last 7 days" },
          ].map((d) => (
            <label key={d.key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="posted"
                checked={currentPosted === d.key}
                onChange={() => setFilter("posted", d.key)}
                className="w-3.5 h-3.5 accent-[#1a3461]"
              />
              <span className={`text-sm transition-colors ${currentPosted === d.key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-[#1a3461]"}`}>
                {d.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Qualification */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Qualification</h4>
        <div className="flex flex-col gap-1.5">
          {QUALIFICATIONS.map((q) => (
            <label key={q.key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="qualification"
                checked={currentQual === q.key}
                onChange={() => setFilter("qualification", q.key)}
                className="w-3.5 h-3.5 accent-[#1a3461]"
              />
              <span className={`text-sm transition-colors ${currentQual === q.key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-[#1a3461]"}`}>
                {q.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Freshers */}
      <div className="mb-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={currentExp === "1"}
            onChange={() => setFilter("freshers", currentExp === "1" ? null : "1")}
            className="w-4 h-4 accent-[#1a3461] rounded"
          />
          <span className="text-sm text-gray-700 font-medium">Freshers Only</span>
        </label>
      </div>

      {/* Monthly Salary */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Monthly Salary</h4>
        <div className="flex flex-col gap-1.5">
          {SALARY_RANGES.map((s) => (
            <label key={s.key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="salary"
                checked={currentSalary === s.key}
                onChange={() => setFilter("minSalary", s.key)}
                className="w-3.5 h-3.5 accent-[#1a3461]"
              />
              <span className={`text-sm transition-colors ${currentSalary === s.key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-[#1a3461]"}`}>
                {s.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Job Type</h4>
        <div className="flex flex-col gap-1.5">
          {JOB_TYPES.map((t) => (
            <label key={t.key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="jobtype"
                checked={currentType === t.key}
                onChange={() => setFilter("type", t.key)}
                className="w-3.5 h-3.5 accent-[#1a3461]"
              />
              <span className={`text-sm transition-colors ${currentType === t.key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-[#1a3461]"}`}>
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Category</h4>
        <div className="flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter("category", c.key)}
              className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                activeCategory === c.key
                  ? "bg-[#eef2ff] text-[#1a3461] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
