"use client"

import Link from "next/link"
import { MapPin, Clock, Users, Building2, PhoneCall, ChevronDown, ChevronUp } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
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
  description: string
  requirements: string[]
  perks: string[]
  callToHrEnabled: boolean
  callToHrPhone: string | null
  qualificationRequired: string | null
}

const QUAL_LABELS: Record<string, string> = {
  below10: "Below 10th",
  "10th": "10th Pass",
  "12th": "12th Pass",
  diploma: "Diploma",
  graduate: "Graduate",
  postgraduate: "Post Graduate",
}

const EXPERIENCE_LABEL: Record<number, string> = {
  0: "Fresher OK",
  1: "1+ yr exp",
  2: "2+ yrs exp",
  3: "3+ yrs exp",
  5: "5+ yrs exp",
}

export default function JobCard({ job }: { job: Job }) {
  const t = useTranslations("jobs")
  const [expanded, setExpanded] = useState(false)

  const isFresh = Date.now() - new Date(job.postedAt).getTime() < 24 * 60 * 60 * 1000

  const descSnippet = job.description
    ? job.description.replace(/<[^>]+>/g, "").slice(0, 160)
    : ""
  const showExpand = job.description && job.description.replace(/<[^>]+>/g, "").length > 160

  const expLabel = EXPERIENCE_LABEL[job.experienceMin] ?? `${job.experienceMin}+ yrs`
  const qualLabel = job.qualificationRequired ? QUAL_LABELS[job.qualificationRequired] ?? null : null

  // Show max 4 skills/requirements as tags
  const skillTags = job.requirements.slice(0, 4)
  // Show max 3 perks
  const perkTags = job.perks.slice(0, 3)

  return (
    <div className="bg-white border border-gray-200 rounded-xl hover:border-[#1a3461]/30 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-4 sm:p-5">

        {/* ── Row 1: Title + badges + save ── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {job.isFeatured && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wide">
                  ⭐ Featured
                </span>
              )}
              {isFresh && !job.isFeatured && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                  New
                </span>
              )}
            </div>
            <Link href={`/jobs/${job.id}`}>
              <h3 className="font-bold text-gray-900 text-[15px] sm:text-base leading-snug hover:text-[#1a3461] transition-colors mt-1">
                {job.title}
              </h3>
            </Link>
          </div>
          <SaveJobButton jobId={job.id} compact />
        </div>

        {/* ── Row 2: Salary ── */}
        <p className="text-base font-extrabold text-gray-800 mt-1.5">
          {job.salary}
          {job.salary !== "Salary not mentioned" && (
            <span className="text-xs font-normal text-gray-400 ml-1">per month</span>
          )}
        </p>

        {/* ── Row 3: Company + Location ── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
          {job.company && (
            <span className="flex items-center gap-1.5">
              <Building2 size={13} className="text-gray-400 shrink-0" />
              <span className="font-medium text-gray-700">{job.company}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MapPin size={13} className="text-gray-400 shrink-0" />
            {job.city}
          </span>
          <span className="flex items-center gap-1.5">
            <Users size={13} className="text-gray-400 shrink-0" />
            {job.vacancies} {job.vacancies === 1 ? t("opening") : t("openings")}
          </span>
        </div>

        {/* ── Row 4: Skill tags ── */}
        {skillTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-xs text-gray-400 shrink-0 self-center">Skills:</span>
            {skillTags.map((s, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* ── Row 5: Perk + type + qual + exp tags ── */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.experienceMin === 0 && (
            <span className="text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-medium">
              Freshers OK
            </span>
          )}
          {job.experienceMin > 0 && (
            <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full font-medium">
              {expLabel}
            </span>
          )}
          {qualLabel && (
            <span className="text-xs px-2.5 py-0.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-full">
              {qualLabel}
            </span>
          )}
          {perkTags.map((p, i) => (
            <span key={i} className="text-xs px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full">
              {p}
            </span>
          ))}
        </div>

        {/* ── Row 6: Description snippet ── */}
        {descSnippet && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              {expanded ? job.description.replace(/<[^>]+>/g, "") : descSnippet}
              {!expanded && showExpand && "…"}
            </p>
            {showExpand && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-[#1a3461] font-medium mt-0.5 flex items-center gap-0.5 hover:underline"
              >
                {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
              </button>
            )}
          </div>
        )}

        {/* ── Row 7: Posted time + CTAs ── */}
        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-400 flex items-center gap-1 shrink-0">
            <Clock size={11} />
            Posted {formatRelativeTime(job.postedAt)}
          </span>

          <div className="flex items-center gap-2">
            {job.callToHrEnabled && job.callToHrPhone && (
              <a
                href={`tel:${job.callToHrPhone}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
              >
                <PhoneCall size={13} />
                {t("callHr")}
              </a>
            )}
            <Link
              href={`/jobs/${job.id}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-[#1a3461] text-[#1a3461] hover:bg-[#1a3461] hover:text-white text-xs font-bold transition-all"
            >
              {t("applyNow")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
