"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { X } from "lucide-react"

const CATEGORY_LABELS: Record<string, string> = {
  delivery: "Delivery", driver: "Driver", sales: "Sales", bpo: "BPO / Telecaller",
  security: "Security Guard", housekeeping: "Housekeeping", cook: "Cook / Chef",
  dataEntry: "Data Entry", construction: "Construction", factory: "Factory Worker",
  retail: "Retail / Shop", fieldWork: "Field Work", teaching: "Teaching",
  accounting: "Accounting", it: "IT / Computer", healthcare: "Healthcare",
  beauty: "Beauty / Salon", logistics: "Warehouse",
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", CONTRACT: "Contract",
  GIG: "Gig / Freelance", WALK_IN: "Walk-in",
}

const SALARY_LABELS: Record<string, string> = {
  "5000": "₹5K+", "10000": "₹10K+", "15000": "₹15K+",
  "20000": "₹20K+", "30000": "₹30K+", "50000": "₹50K+",
}

const POSTED_LABELS: Record<string, string> = {
  today: "Last 24h", week: "Last 7 days",
}

const QUAL_LABELS: Record<string, string> = {
  below10: "Below 10th", "10th": "10th Pass", "12th": "12th Pass",
  diploma: "Diploma", graduate: "Graduate", postgraduate: "Post Graduate",
}

type Props = {
  category?: string
  type?: string
  minSalary?: string
  freshers?: string
  qualification?: string
  posted?: string
}

export default function FilterChips({ category, type, minSalary, freshers, qualification, posted }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const chips = [
    category && { key: "category", label: CATEGORY_LABELS[category] ?? category },
    type && { key: "type", label: TYPE_LABELS[type] ?? type },
    minSalary && { key: "minSalary", label: `Min ${SALARY_LABELS[minSalary] ?? `₹${minSalary}`}` },
    freshers === "1" && { key: "freshers", label: "Freshers Only" },
    qualification && { key: "qualification", label: QUAL_LABELS[qualification] ?? qualification },
    posted && { key: "posted", label: POSTED_LABELS[posted] ?? posted },
  ].filter(Boolean) as { key: string; label: string }[]

  if (chips.length === 0) return null

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete("page")
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#eef2ff] border border-[#c5d4ff] text-[#1a3461] text-xs font-semibold"
        >
          {label}
          <button
            onClick={() => removeFilter(key)}
            className="hover:text-red-500 transition-colors"
            aria-label={`Remove ${label} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
    </div>
  )
}
