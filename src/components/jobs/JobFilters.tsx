"use client"

import { useSearchParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { X, Check } from "lucide-react"
import { useState } from "react"

const CATEGORY_KEYS = [
  "delivery", "driver", "sales", "bpo", "security", "housekeeping",
  "cook", "dataEntry", "construction", "factory", "retail",
  "fieldWork", "accounting", "teaching", "it", "healthcare", "beauty", "logistics",
]

// Override labels not in the categories translation namespace
const CATEGORY_LABEL_OVERRIDES: Record<string, string> = {
  bpo: "BPO / Telecaller",
  dataEntry: "Data Entry",
  accounting: "Accounting",
  teaching: "Teaching",
  beauty: "Beauty / Salon",
  logistics: "Warehouse / Logistics",
}

const SALARY_AMOUNTS = ["5000", "10000", "15000", "20000", "30000", "50000"]

type Props = {
  activeCategory?: string   // comma-separated slugs OR single slug
  onFilterApply?: () => void
  inDrawer?: boolean
}

export default function JobFilters({ activeCategory, onFilterApply, inDrawer }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tf = useTranslations("jobs.filters")
  const tc = useTranslations("categories")

  const [showAllCategories, setShowAllCategories] = useState(false)

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

  const currentType     = searchParams.get("type")
  const currentSalary   = searchParams.get("minSalary")
  const currentFreshers = searchParams.get("freshers")
  const currentExp      = searchParams.get("exp")
  const currentQual     = searchParams.get("qualification")
  const currentPosted   = searchParams.get("posted")
  const currentCatRaw   = searchParams.get("category") ?? (activeCategory ?? "")
  const activeCats      = currentCatRaw ? currentCatRaw.split(",").map(s => s.trim()).filter(Boolean) : []
  const hasFilters      = activeCats.length > 0 || currentType || currentSalary || currentFreshers || currentExp || currentQual || currentPosted

  const activeFilterCount = [
    activeCats.length > 0 ? activeCats.join(",") : null,
    currentType, currentSalary, currentFreshers || currentExp, currentQual, currentPosted
  ].filter(Boolean).length

  function toggleCategory(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    const current = new Set(activeCats)
    if (current.has(key)) current.delete(key)
    else current.add(key)
    if (current.size === 0) params.delete("category")
    else params.set("category", Array.from(current).join(","))
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
    onFilterApply?.()
  }

  // Experience — encode as pair (freshers / exp)
  type ExpKey = "fresher" | "lt1" | "lt2" | "lt3" | "lt4" | "gt4"
  const EXP_OPTIONS: { key: ExpKey; freshers: string | null; exp: string | null }[] = [
    { key: "fresher", freshers: "1",  exp: null },
    { key: "lt1",     freshers: null, exp: "1"  },
    { key: "lt2",     freshers: null, exp: "2"  },
    { key: "lt3",     freshers: null, exp: "3"  },
    { key: "lt4",     freshers: null, exp: "4"  },
    { key: "gt4",     freshers: null, exp: "5"  },
  ]
  const EXP_LABELS: Record<ExpKey, string> = {
    fresher: tf("fresherExp"),
    lt1: tf("lt1Year"),
    lt2: tf("lt2Years"),
    lt3: tf("lt3Years"),
    lt4: tf("lt4Years"),
    gt4: tf("gt4Years"),
  }

  const activeExpKey = EXP_OPTIONS.find((o) =>
    o.freshers ? currentFreshers === "1" : currentExp === o.exp
  )?.key ?? null

  function setExp(opt: typeof EXP_OPTIONS[number] | null) {
    if (!opt) setMultiple([["freshers", null], ["exp", null]])
    else if (opt.freshers) setMultiple([["freshers", "1"], ["exp", null]])
    else setMultiple([["freshers", null], ["exp", opt.exp]])
  }

  // Qualification options
  const QUAL_OPTIONS = [
    { key: "",         label: tf("allLevels") },
    { key: "below10",  label: "Below 10th" },
    { key: "10th",     label: "10th Pass and above" },
    { key: "12th",     label: "12th Pass and above" },
    { key: "diploma",  label: "Diploma and above" },
    { key: "graduate", label: "Graduate and above" },
  ]

  const INITIAL_CAT_COUNT = 8
  const visibleCategories = showAllCategories ? CATEGORY_KEYS : CATEGORY_KEYS.slice(0, INITIAL_CAT_COUNT)

  return (
    <div className={inDrawer ? "" : "bg-white rounded-xl border border-gray-200 sticky top-20"}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          {tf("title")}
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-bold bg-[#1a3461] text-white rounded-full px-1.5 py-0.5 leading-none">
              {activeFilterCount}
            </span>
          )}
        </h3>
        {hasFilters && (
          <button
            onClick={() => { router.push("/jobs"); onFilterApply?.() }}
            className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <X size={11} /> {tf("clearAll")}
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-5">

        {/* ── Quick Filters ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{tf("quickFilters")}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { label: tf("partTime"),    active: currentType === "PART_TIME",    action: () => setFilter("type",     currentType === "PART_TIME" ? null : "PART_TIME") },
              { label: tf("walkIn"),      active: currentType === "WALK_IN",      action: () => setFilter("type",     currentType === "WALK_IN" ? null : "WALK_IN")    },
              { label: tf("fresher"),     active: currentFreshers === "1",        action: () => setFilter("freshers", currentFreshers === "1" ? null : "1")            },
              { label: tf("postedToday"), active: currentPosted === "today",      action: () => setFilter("posted",   currentPosted === "today" ? null : "today")      },
            ].map(({ label, active, action }) => (
              <button
                key={label}
                onClick={action}
                className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                  active
                    ? "bg-[#1a3461] text-white border-[#1a3461]"
                    : "bg-white text-gray-600 border-gray-300 hover:border-[#1a3461] hover:text-[#1a3461]"
                }`}
              >
                {active && <Check size={11} strokeWidth={3} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Job Roles / Category — pill chips ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{tf("jobRoles")}</p>
          <div className="flex flex-wrap gap-2">
            {visibleCategories.map((key) => {
              let label: string
              try { label = CATEGORY_LABEL_OVERRIDES[key] ?? tc(key as any) }
              catch { label = CATEGORY_LABEL_OVERRIDES[key] ?? key }
              const isActive = activeCats.includes(key)
              return (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    isActive
                      ? "bg-[#1a3461] text-white border-[#1a3461]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#1a3461] hover:text-[#1a3461]"
                  }`}
                >
                  {isActive && <Check size={11} strokeWidth={3} />}
                  {label}
                  {!isActive && <span className="text-gray-400 font-normal ml-0.5">+</span>}
                </button>
              )
            })}

            {/* Show more / less toggle */}
            <button
              onClick={() => setShowAllCategories((v) => !v)}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border border-dashed border-gray-300 text-[#1a3461] font-semibold hover:border-[#1a3461] hover:bg-[#f0f4ff] transition-all"
            >
              {showAllCategories
                ? tf("showLess")
                : `+${CATEGORY_KEYS.length - INITIAL_CAT_COUNT} ${tf("showMore")}`}
            </button>
          </div>
        </div>

        {/* ── Monthly Salary — pill chips ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{tf("monthlySalary")}</p>
          <div className="flex flex-col gap-2">
            {SALARY_AMOUNTS.map((amount) => {
              const isActive = currentSalary === amount
              const label = `More than ₹${Number(amount).toLocaleString("en-IN")}`
              return (
                <label key={amount} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="salary"
                    checked={isActive}
                    onChange={() => setFilter("minSalary", isActive ? null : amount)}
                    className="w-4 h-4 accent-[#1a3461] shrink-0"
                  />
                  <span className={`text-sm transition-colors ${isActive ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                    {label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* ── Experience — pill chips ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{tf("experience")}</p>
          <div className="flex flex-wrap gap-2">
            {EXP_OPTIONS.map((opt) => {
              const isActive = activeExpKey === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => setExp(isActive ? null : opt)}
                  className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    isActive
                      ? "bg-[#1a3461] text-white border-[#1a3461]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#1a3461] hover:text-[#1a3461]"
                  }`}
                >
                  {isActive && <Check size={11} strokeWidth={3} />}
                  {EXP_LABELS[opt.key]}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Qualification — radio list ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{tf("qualification")}</p>
          <div className="flex flex-col gap-2">
            {QUAL_OPTIONS.map((q) => {
              const isActive = q.key === "" ? !currentQual : currentQual === q.key
              return (
                <label key={q.key || "all"} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="qualification"
                    checked={isActive}
                    onChange={() => setFilter("qualification", q.key || null)}
                    className="w-4 h-4 accent-[#1a3461] shrink-0"
                  />
                  <span className={`text-sm transition-colors ${isActive ? "text-[#1a3461] font-semibold" : "text-gray-600 group-hover:text-gray-900"}`}>
                    {q.label}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* ── Date Posted — pill chips ── */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">{tf("datePosted")}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "today", label: tf("last24h") },
              { key: "week",  label: tf("last7d")  },
            ].map((d) => {
              const isActive = currentPosted === d.key
              return (
                <button
                  key={d.key}
                  onClick={() => setFilter("posted", isActive ? null : d.key)}
                  className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    isActive
                      ? "bg-[#1a3461] text-white border-[#1a3461]"
                      : "bg-white text-gray-600 border-gray-300 hover:border-[#1a3461] hover:text-[#1a3461]"
                  }`}
                >
                  {isActive && <Check size={11} strokeWidth={3} />}
                  {d.label}
                </button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
