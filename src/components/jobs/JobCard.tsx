"use client"

import Link from "next/link"
import { MapPin, Clock, Users, Zap } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatRelativeTime } from "@/lib/utils"
import SaveJobButton from "@/components/jobs/SaveJobButton"

type Job = {
  id: string
  title: string
  company: string
  city: string
  salary: string
  type: string
  category: string
  vacancies: number
  experienceMin: number
  postedAt: Date
  isFeatured: boolean
}

// Deterministic gradient per company initial
const AVATAR_GRADIENTS = [
  "from-violet-500 to-purple-600",
  "from-sky-500 to-blue-600",
  "from-emerald-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
]

export default function JobCard({ job }: { job: Job }) {
  const t = useTranslations("jobs")
  const tt = useTranslations("jobs.types")

  const avatarSeed = job.company || job.title
  const gradient = AVATAR_GRADIENTS[avatarSeed.charCodeAt(0) % AVATAR_GRADIENTS.length]
  const initial = avatarSeed[0].toUpperCase()

  const typeLabel = (() => {
    try { return tt(job.type as any) } catch { return job.type }
  })()

  const isFresh = (() => {
    const diffMs = Date.now() - new Date(job.postedAt).getTime()
    return diffMs < 24 * 60 * 60 * 1000
  })()

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-[#1a3461]/20 transition-all duration-200 flex flex-col overflow-hidden">
      <Link href={`/jobs/${job.id}`} className="block p-5 flex-1">

        {/* Top row */}
        <div className="flex items-start gap-3.5">
          {/* Company avatar */}
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm`}>
            {initial}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-900 text-sm sm:text-[15px] leading-snug truncate group-hover:text-[#1a3461] transition-colors">
                  {job.title}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{job.company}</p>
              </div>

              {/* Badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                {job.isFeatured && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide">
                    ⭐ {t("featuredBadge")}
                  </span>
                )}
                {isFresh && !job.isFeatured && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 uppercase tracking-wide">
                    New
                  </span>
                )}
                <SaveJobButton jobId={job.id} compact />
              </div>
            </div>
          </div>
        </div>

        {/* Salary — most prominent field */}
        <div className="mt-3.5 flex items-center gap-2">
          <span className="text-base font-extrabold text-green-600">{job.salary}</span>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-gray-400">
          <span className="flex items-center gap-1 font-medium">
            <MapPin size={11} className="text-gray-300" />
            {job.city}
          </span>
          <span className="text-gray-200">·</span>
          <span className="flex items-center gap-1">
            <Users size={11} className="text-gray-300" />
            {job.vacancies} {job.vacancies === 1 ? t("opening") : t("openings")}
          </span>
          <span className="text-gray-200">·</span>
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-gray-300" />
            {formatRelativeTime(job.postedAt)}
          </span>
        </div>

        {/* Tag chips */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#eef2ff] text-[#4f46e5]">
            {typeLabel}
          </span>
          {job.experienceMin === 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Zap size={10} /> {t("freshersOk")}
            </span>
          )}
        </div>
      </Link>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link
          href={`/jobs/${job.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1a3461] group-hover:bg-[#142a52] text-white text-xs font-bold tracking-wide transition-all duration-200 shadow-sm group-hover:shadow-md"
        >
          {t("applyNow")}
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-70 group-hover:translate-x-0.5 transition-transform">
            <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>
    </div>
  )
}
