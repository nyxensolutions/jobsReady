"use client"

import Link from "next/link"
import { MapPin, Clock, Users, ChevronRight } from "lucide-react"
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

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
]

export default function JobCard({ job }: { job: Job }) {
  const t = useTranslations("jobs")
  const tt = useTranslations("jobs.types")

  const avatarSeed = job.company || job.title
  const avatarColor = AVATAR_COLORS[avatarSeed.charCodeAt(0) % AVATAR_COLORS.length]

  const typeLabel = (() => {
    try { return tt(job.type as any) } catch { return job.type }
  })()

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-[#1a3461]/30 hover:shadow-md transition-all">
      <Link href={`/jobs/${job.id}`} className="block p-4 sm:p-5">
        {/* Top row: avatar + title + featured badge */}
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${avatarColor}`}>
            {avatarSeed[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="font-bold text-[#1a3461] text-sm sm:text-base leading-snug group-hover:text-blue-700 truncate">
                  {job.title}
                </h3>
                {job.company && <p className="text-xs text-gray-500 mt-0.5 truncate">{job.company}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {job.isFeatured && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {t("featuredBadge")}
                  </span>
                )}
                <SaveJobButton jobId={job.id} compact />
              </div>
            </div>

            {/* Salary — prominent */}
            <p className="text-base font-bold text-green-600 mt-2">{job.salary}</p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={11} />{job.city}</span>
              <span className="flex items-center gap-1">
                <Users size={11} />
                {job.vacancies} {job.vacancies === 1 ? t("opening") : t("openings")}
              </span>
              <span className="flex items-center gap-1"><Clock size={11} />{formatRelativeTime(job.postedAt)}</span>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                {typeLabel}
              </span>
              {job.experienceMin === 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium border border-green-100">
                  {t("freshersOk")}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* CTA button */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 -mt-1">
        <Link
          href={`/jobs/${job.id}`}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1a3461] hover:bg-[#142a52] hover:shadow-md active:scale-[0.98] text-white text-xs font-bold rounded-lg transition-all"
        >
          {t("applyNow")} <ChevronRight size={13} />
        </Link>
      </div>
    </div>
  )
}
