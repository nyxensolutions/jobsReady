"use client"

import { useState } from "react"
import {
  Eye, ChevronDown, Briefcase, MapPin, Users,
  Download, FileText, CheckCircle, Clock,
} from "lucide-react"

type Seeker = {
  id: string
  name: string
  city: string | null
  experienceYears: number
  skills: string[]
  bio: string | null
  photoUrl: string | null
  resumeUrl: string | null
}

type Job = {
  id: string
  title: string
}

type Application = {
  id: string
  status: string
  createdAt: string
  coverNote: string | null
  seeker: Seeker
  job: Job
}

type Props = {
  initialApplications: Application[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  APPLIED:     { label: "Applied",     color: "text-blue-700 bg-blue-50 border-blue-200",       dot: "bg-blue-500" },
  VIEWED:      { label: "Viewed",      color: "text-gray-700 bg-gray-100 border-gray-200",       dot: "bg-gray-400" },
  SHORTLISTED: { label: "Shortlisted", color: "text-green-700 bg-green-50 border-green-200",     dot: "bg-green-500" },
  REJECTED:    { label: "Rejected",    color: "text-red-600 bg-red-50 border-red-200",           dot: "bg-red-400" },
  HIRED:       { label: "Hired 🎉",    color: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
}

const NEXT_STATUSES: Record<string, { action: string; label: string; className: string }[]> = {
  APPLIED:     [
    { action: "VIEWED",      label: "Mark Viewed",  className: "text-gray-600 border border-gray-300 hover:bg-gray-50" },
    { action: "SHORTLISTED", label: "Shortlist ✓",  className: "text-white bg-green-600 hover:bg-green-700" },
    { action: "REJECTED",    label: "Reject",       className: "text-red-600 border border-red-200 hover:bg-red-50" },
  ],
  VIEWED:      [
    { action: "SHORTLISTED", label: "Shortlist ✓",  className: "text-white bg-green-600 hover:bg-green-700" },
    { action: "REJECTED",    label: "Reject",       className: "text-red-600 border border-red-200 hover:bg-red-50" },
  ],
  SHORTLISTED: [
    { action: "HIRED",       label: "Mark Hired",   className: "text-white bg-emerald-600 hover:bg-emerald-700" },
    { action: "REJECTED",    label: "Reject",       className: "text-red-600 border border-red-200 hover:bg-red-50" },
  ],
  REJECTED:    [
    { action: "SHORTLISTED", label: "Reconsider",   className: "text-green-600 border border-green-200 hover:bg-green-50" },
  ],
  HIRED: [],
}

const TAB_FILTERS = ["All", "APPLIED", "VIEWED", "SHORTLISTED", "HIRED", "REJECTED"]

export default function ResponsesClient({ initialApplications }: Props) {
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [actioning, setActioning] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("All")
  const [expanded, setExpanded] = useState<string | null>(null)

  async function updateStatus(appId: string, status: string) {
    setActioning(appId + status)
    try {
      const res = await fetch(`/api/employer/applications/${appId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status } : a))
        )
      }
    } finally {
      setActioning(null)
    }
  }

  function exportCSV() {
    const rows = [
      ["Name", "City", "Experience (yrs)", "Job Applied For", "Skills", "Status", "Applied On", "Cover Note"],
      ...applications.map((a) => [
        a.seeker.name,
        a.seeker.city ?? "",
        String(a.seeker.experienceYears),
        a.job.title,
        a.seeker.skills.join("; "),
        a.status,
        new Date(a.createdAt).toLocaleDateString("en-IN"),
        (a.coverNote ?? "").replace(/"/g, '""'),
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `responses_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered =
    activeTab === "All" ? applications : applications.filter((a) => a.status === activeTab)

  const counts = TAB_FILTERS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === "All" ? applications.length : applications.filter((a) => a.status === tab).length
    return acc
  }, {})

  // Summary stats
  const newCount  = applications.filter((a) => a.status === "APPLIED").length
  const shortlisted = applications.filter((a) => a.status === "SHORTLISTED").length
  const hired     = applications.filter((a) => a.status === "HIRED").length

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-7">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Responses</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {applications.length} total application{applications.length !== 1 ? "s" : ""} across all your jobs
            </p>
          </div>
          {applications.length > 0 && (
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shrink-0"
            >
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>

        {/* Summary cards */}
        {applications.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{newCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">New</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{shortlisted}</p>
              <p className="text-xs text-gray-500 mt-0.5">Shortlisted</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{hired}</p>
              <p className="text-xs text-gray-500 mt-0.5">Hired</p>
            </div>
          </div>
        )}

        {/* Status filter tabs */}
        <div className="flex gap-1.5 flex-wrap mb-5">
          {TAB_FILTERS.map((tab) =>
            counts[tab] > 0 || tab === "All" ? (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === tab
                    ? "bg-[#1a3461] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#1a3461] hover:text-[#1a3461]"
                }`}
              >
                {tab === "All" ? "All" : STATUS_CONFIG[tab]?.label}
                <span
                  className={`text-xs rounded-full px-1.5 py-0.5 ${
                    activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {counts[tab]}
                </span>
              </button>
            ) : null
          )}
        </div>

        {/* Application cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-20 text-center px-4">
            <Users size={36} className="text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600">
              {applications.length === 0 ? "No responses yet" : "No applications in this category"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {applications.length === 0
                ? "When job seekers apply to your jobs, their responses will appear here"
                : "Try switching to a different filter tab above"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.APPLIED
              const nextActions = NEXT_STATUSES[app.status] ?? []
              const isExpanded = expanded === app.id

              return (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-sm"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#eef2ff] text-[#1a3461] flex items-center justify-center font-bold text-sm shrink-0 border border-[#dde5ff]">
                        {app.seeker.name?.[0]?.toUpperCase() ?? "?"}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name + badge row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{app.seeker.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                              {app.seeker.city && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={11} />{app.seeker.city}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Briefcase size={11} />{app.seeker.experienceYears}y exp
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={11} />{new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </span>
                            </div>
                          </div>
                          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {/* Job pill */}
                        <div className="mt-2 inline-flex items-center gap-1 text-xs text-[#1a3461] bg-[#eef2ff] border border-[#dde5ff] px-2.5 py-1 rounded-full font-medium">
                          <FileText size={11} />
                          Applied for: {app.job.title}
                        </div>

                        {/* Skills */}
                        {app.seeker.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {app.seeker.skills.slice(0, 5).map((s) => (
                              <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {s}
                              </span>
                            ))}
                            {app.seeker.skills.length > 5 && (
                              <span className="text-xs text-gray-400">+{app.seeker.skills.length - 5} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action row */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : app.id)}
                        className="text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1 transition-colors"
                      >
                        <Eye size={12} />
                        {isExpanded ? "Hide" : "View"} Details
                        <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {nextActions.map(({ action, label, className }) => (
                        <button
                          key={action}
                          onClick={() => updateStatus(app.id, action)}
                          disabled={actioning === app.id + action}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${className}`}
                        >
                          {actioning === app.id + action ? "…" : label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50 space-y-3">
                      {app.seeker.bio && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">About</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{app.seeker.bio}</p>
                        </div>
                      )}
                      {app.coverNote && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cover Note</p>
                          <p className="text-sm text-gray-700 italic leading-relaxed">"{app.coverNote}"</p>
                        </div>
                      )}
                      {!app.seeker.bio && !app.coverNote && (
                        <p className="text-sm text-gray-400 italic">No additional information provided.</p>
                      )}
                      {app.seeker.resumeUrl && (
                        <a
                          href={app.seeker.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a3461] border border-[#1a3461]/30 px-3 py-1.5 rounded-lg hover:bg-[#eef2ff] transition-colors"
                        >
                          <FileText size={12} /> View Resume
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
