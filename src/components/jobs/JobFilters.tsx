"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { X } from "lucide-react"

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
  logistics: "Warehouse / Logistics",
}

const SALARY_RANGES = [
  { key: "5000",  label: "More than ₹5,000" },
  { key: "10000", label: "More than ₹10,000" },
  { key: "15000", label: "More than ₹15,000" },
  { key: "20000", label: "More than ₹20,000" },
  { key: "30000", label: "More than ₹30,000" },
  { key: "50000", label: "More than ₹50,000" },
]

const EXPERIENCE_OPTIONS = [
  { key: "fresher",  label: "Fresher",         freshers: "1", exp: null },
  { key: "lt1",     label: "Less than 1 year", freshers: null, exp: "1" },
  { key: "lt2",     label: "Less than 2 years",freshers: null, exp: "2" },
  { key: "lt3",     label: "Less than 3 years",freshers: null, exp: "3" },
  { key: "lt4",     label: "Less than 4 years",freshers: null, exp: "4" },
  { key: "gt4",     label: "More than 4 years",freshers: null, exp: "5" },
]

const QUALIFICATION_OPTIONS = [
  { key: "",            label: "All Education levels" },
  { key: "below10",    label: "10th Pass and above" },
  { key: "10th",       label: "12th Pass and above" },
  { key: "12th",       label: "Diploma and above" },
  { key: "diploma",    label: "Graduate and above" },
  { key: "graduate",   label: "Post Graduate" },
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

  function setMultiple(pairs: [string, string | null][]) {
    const params = new URLSearchParams(searchParams.toString())
    pairs.forEach(([k, v]) => {
      if (v === null) params.delete(k)
      else params.set(k, v)
    })
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
    onFilterApply?.()
  }

  const currentType    = searchParams.get("type")
  const currentSalary  = searchParams.get("minSalary")
  const currentFreshers = searchParams.get("freshers")
  const currentExp     = searchParams.get("exp")
  const currentQual    = searchParams.get("qualification")
  const currentPosted  = searchParams.get("posted")
  const hasFilters = activeCategory || currentType || currentSalary || currentFreshers || currentExp || currentQual || currentPosted

  // Active experience option
  const activeExp = EXPERIENCE_OPTIONS.find((o) =>
    o.freshers ? currentFreshers === "1" : currentExp === o.exp
  )?.key ?? null

  function setExp(opt: typeof EXPERIENCE_OPTIONS[number] | null) {
    if (!opt) {
      setMultiple([["freshers", null], ["exp", null]])
    } else if (opt.freshers) {
      setMultiple([["freshers", "1"], ["exp", null]])
    } else {
      setMultiple([["freshers", null], ["exp", opt.exp]])
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 sticky top-20 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm">
          Filters
          {hasFilters ? (
            <span className="ml-1.5 text-[11px] font-bold bg-[#1a3461] text-white rounded-full px-1.5 py-0.5">
              {[activeCategory, currentType, currentSalary, currentFreshers || currentExp, currentQual, currentPosted].filter(Boolean).length}
            </span>
          ) : null}
        </h3>
        {hasFilters && (
          <button
            onClick={() => router.push("/jobs")}
            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <X size={11} /> Clear All
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-5 max-h-[calc(100vh-7rem)] overflow-y-auto">

        {/* ── Quick Filters ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Quick Filters</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Part Time",   action: () => setFilter("type", currentType === "PART_TIME" ? null : "PART_TIME") , active: currentType === "PART_TIME" },
              { label: "Walk-in",     action: () => setFilter("type", currentType === "WALK_IN" ? null : "WALK_IN"),       active: currentType === "WALK_IN" },
              { label: "Fresher",     action: () => setFilter("freshers", currentFreshers === "1" ? null : "1"),           active: currentFreshers === "1" },
              { label: "Posted Today",action: () => setFilter("posted", currentPosted === "today" ? null : "today"),       active: currentPosted === "today" },
            ].map(({ label, action, active }) => (
              <button
                key={label}
                onClick={action}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  active
                    ? "bg-[#1a3461] text-white border-[#1a3461]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#1a3461] hover:text-[#1a3461]"
                }`}
              >
                {active && <span className="mr-1">✓</span>}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Job Roles / Category ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Job Roles</p>
          <div className="flex flex-col gap-0.5">
            {CATEGORY_KEYS.map((key) => {
              let label: string
              try { label = CATEGORY_LABELS[key] ?? tc(key as any) }
              catch { label = CATEGORY_LABELS[key] ?? key }
              const isActive = activeCategory === key
              return (
                <button
                  key={key}
                  onClick={() => setFilter("category", key)}
                  className={`text-left text-sm px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between group ${
                    isActive
                      ? "bg-[#eef2ff] text-[#1a3461] font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span>{label}</span>
                  {isActive
                    ? <X size={12} className="text-[#1a3461]" />
                    : <span className="text-gray-300 group-hover:text-gray-500 text-sm font-bold">+</span>
                  }
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Monthly Salary ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Monthly Salary</p>
          <div className="flex flex-col gap-2">
            {SALARY_RANGES.map((s) => (
              <label key={s.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="salary"
                  checked={currentSalary === s.key}
                  onChange={() => setFilter("minSalary", s.key)}
                  className="w-4 h-4 accent-[#1a3461] shrink-0"
                />
                <span className={`text-sm transition-colors ${currentSalary === s.key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                  {s.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Experience ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Experience</p>
          <div className="flex flex-col gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="experience"
                  checked={activeExp === opt.key}
                  onChange={() => setExp(opt)}
                  className="w-4 h-4 accent-[#1a3461] shrink-0"
                />
                <span className={`text-sm transition-colors ${activeExp === opt.key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Qualification ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Qualification</p>
          <div className="flex flex-col gap-2">
            {QUALIFICATION_OPTIONS.map((q) => (
              <label key={q.key || "all"} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="qualification"
                  checked={q.key === "" ? !currentQual : currentQual === q.key}
                  onChange={() => setFilter("qualification", q.key || null)}
                  className="w-4 h-4 accent-[#1a3461] shrink-0"
                />
                <span className={`text-sm transition-colors ${(q.key === "" ? !currentQual : currentQual === q.key) ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                  {q.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ── Date Posted ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Date Posted</p>
          <div className="flex flex-col gap-2">
            {[
              { key: "today", label: "Last 24 hours" },
              { key: "week",  label: "Last 7 days" },
            ].map((d) => (
              <label key={d.key} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="posted"
                  checked={currentPosted === d.key}
                  onChange={() => setFilter("posted", d.key)}
                  className="w-4 h-4 accent-[#1a3461] shrink-0"
                />
                <span className={`text-sm transition-colors ${currentPosted === d.key ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                  {d.label}
                </span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
