"use client"

import Link from "next/link"
import { MapPin, Clock, Briefcase, Users, Star } from "lucide-react"
import { formatRelativeTime, formatSalary } from "@/lib/utils"

type Job = {
  id: string
  title: string
  company: string
  city: string
  salary: string
  type: string
  category: string
  vacancies: number
  postedAt: Date
  isFeatured: boolean
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT: "Contract",
  GIG: "Gig",
}

const TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-green-100 text-green-700",
  PART_TIME: "bg-yellow-100 text-yellow-700",
  CONTRACT: "bg-purple-100 text-purple-700",
  GIG: "bg-orange-100 text-orange-700",
}

export default function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`block bg-white rounded-xl border transition-all hover:shadow-md hover:border-blue-200 group ${
        job.isFeatured ? "border-blue-200 shadow-sm" : "border-gray-200"
      }`}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Company logo placeholder */}
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 group-hover:scale-105 transition-transform">
            {job.company[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                {job.isFeatured && (
                  <div className="flex items-center gap-1 text-amber-600 text-xs font-semibold mb-1">
                    <Star size={12} fill="currentColor" />
                    Featured
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-700 transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${TYPE_COLORS[job.type] ?? "bg-gray-100 text-gray-600"}`}>
                {TYPE_LABELS[job.type] ?? job.type}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={13} />
                {job.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={13} />
                {job.salary}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                {job.vacancies} {job.vacancies === 1 ? "vacancy" : "vacancies"}
              </span>
              <span className="flex items-center gap-1 ml-auto text-xs">
                <Clock size={12} />
                {formatRelativeTime(job.postedAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Apply Now
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            className="px-4 py-2 border border-gray-300 hover:border-blue-400 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </Link>
  )
}
