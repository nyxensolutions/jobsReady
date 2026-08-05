"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

const CATEGORY_KEYS = [
  "delivery", "driver", "sales", "bpo", "security", "housekeeping",
  "cook", "dataEntry", "construction", "factory", "retail",
  "fieldWork", "accounting", "teaching", "it", "healthcare", "beauty", "logistics",
]

const CATEGORY_LABELS: Record<string, string> = {
  bpo: "BPO / Telecaller",
  dataEntry: "Data Entry",
  accounting: "Accounting",
  teaching: "Teaching",
  beauty: "Beauty / Salon",
  logistics: "Logistics / Warehouse",
}

const QUALIFICATION_KEYS = ["below10", "10th", "12th", "diploma", "graduate", "postgraduate"]

const JOB_TYPE_KEYS = [
  { key: "FULL_TIME" },
  { key: "PART_TIME" },
  { key: "CONTRACT" },
  { key: "GIG" },
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
  onFilterApply?: () => void
}

export default function JobFilters({ activeCategory, onFilterApply }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tf = useTranslations("jobs.filters")
  const tc = useTranslations("categories")
  const tq = useTranslations("jobs.qualifications")
  const tt = useTranslations("jobs.types")

  function setFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || params.get(key) === value) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
    onFilterApply?.()
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
        <h3 className="font-bold text-gray-900 text-sm">{tf("title")}</h3>
        {hasFilters && (
          <button
            onClick={() => router.push("/jobs")}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            {tf("clearAll")}
          </button>
        )}
      </div>

      {/* Date Posted */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{tf("datePosted")}</h4>
        <div className="flex flex-col gap-1.5">
          {[
            { key: "today", label: tf("last24h") },
            { key: "week", label: tf("last7d") },
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
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{tf("qualification")}</h4>
        <div className="flex flex-col gap-1.5">
          {QUALIFICATION_KEYS.map((qk) => (
            <label key={qk} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="qualification"
                checked={currentQual === qk}
                onChange={() => setFilter("qualification", qk)}
                className="w-3.5 h-3.5 accent-[#1a3461]"
              />
              <span className={`text-sm transition-colors ${currentQual === qk ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-[#1a3461]"}`}>
                {tq(qk as any)}
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
          <span className="text-sm text-gray-700 font-medium">{tf("freshersOnly")}</span>
        </label>
      </div>

      {/* Monthly Salary */}
      <div className="mb-5">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{tf("monthlySalary")}</h4>
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
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{tf("jobType")}</h4>
        <div className="flex flex-col gap-1.5">
          {JOB_TYPE_KEYS.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="jobtype"
                checked={currentType === key}
                onChange={() => setFilter("type", key)}
                className="w-3.5 h-3.5 accent-[#1a3461]"
              />
              <span className={`text-sm transition-colors ${currentType === key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-[#1a3461]"}`}>
                {label ?? tt(key as any)}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{tf("category")}</h4>
        <div className="flex flex-col gap-1">
          {CATEGORY_KEYS.map((key) => {
            // Some categories don't have a direct locale key; fall back to hardcoded label
            let label: string
            try {
              label = CATEGORY_LABELS[key] ?? tc(key as any)
            } catch {
              label = CATEGORY_LABELS[key] ?? key
            }
            return (
              <button
                key={key}
                onClick={() => setFilter("category", key)}
                className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                  activeCategory === key
                    ? "bg-[#eef2ff] text-[#1a3461] font-semibold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
