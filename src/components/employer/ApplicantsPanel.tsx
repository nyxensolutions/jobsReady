"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Eye, Star, Users, MapPin, Briefcase, ChevronDown, Phone, Download, FileText, MessageCircle } from "lucide-react"

type Seeker = {
  id: string
  name: string
  city: string | null
  experienceYears: number
  skills: string[]
  bio: string | null
  photoUrl: string | null
  resumeUrl: string | null
  user: { phone: string | null }
}

type Application = {
  id: string
  status: string
  createdAt: string
  coverNote: string | null
  seeker: Seeker
}

type Props = {
  jobId: string
  jobTitle: string
  initialApplications: Application[]
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  APPLIED:     { label: "Applied",     color: "text-blue-700 bg-blue-50 border-blue-200" },
  VIEWED:      { label: "Viewed",      color: "text-gray-700 bg-gray-100 border-gray-200" },
  SHORTLISTED: { label: "Shortlisted", color: "text-green-700 bg-green-50 border-green-200" },
  REJECTED:    { label: "Rejected",    color: "text-red-600 bg-red-50 border-red-200" },
  HIRED:       { label: "Hired 🎉",    color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
}

const NEXT_STATUSES: Record<string, { action: string; label: string; className: string }[]> = {
  APPLIED:     [
    { action: "VIEWED",      label: "Mark Viewed",  className: "text-gray-600 border border-gray-300 hover:bg-gray-50" },
    { action: "SHORTLISTED", label: "Shortlist",    className: "text-white bg-green-600 hover:bg-green-700" },
    { action: "REJECTED",    label: "Reject",       className: "text-red-600 border border-red-200 hover:bg-red-50" },
  ],
  VIEWED:      [
    { action: "SHORTLISTED", label: "Shortlist",    className: "text-white bg-green-600 hover:bg-green-700" },
    { action: "REJECTED",    label: "Reject",       className: "text-red-600 border border-red-200 hover:bg-red-50" },
  ],
  SHORTLISTED: [
    { action: "HIRED",       label: "Mark Hired",   className: "text-white bg-emerald-600 hover:bg-emerald-700" },
    { action: "REJECTED",    label: "Reject",       className: "text-red-600 border border-red-200 hover:bg-red-50" },
  ],
  REJECTED:    [
    { action: "SHORTLISTED", label: "Reconsider",   className: "text-green-600 border border-green-200 hover:bg-green-50" },
  ],
  HIRED:       [],
}

const TAB_FILTERS = ["All", "APPLIED", "VIEWED", "SHORTLISTED", "HIRED", "REJECTED"]

export default function ApplicantsPanel({ jobId, jobTitle, initialApplications }: Props) {
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
      ["Name", "Phone", "City", "Experience (yrs)", "Skills", "Status", "Applied On", "Cover Note"],
      ...applications.map((a) => [
        a.seeker.name,
        a.seeker.user?.phone ?? "",
        a.seeker.city ?? "",
        String(a.seeker.experienceYears),
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
    a.download = `${jobTitle.replace(/\s+/g, "_")}_applicants.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = activeTab === "All" ? applications : applications.filter((a) => a.status === activeTab)

  const counts = TAB_FILTERS.reduce<Record<string, number>>((acc, tab) => {
    acc[tab] = tab === "All" ? applications.length : applications.filter((a) => a.status === tab).length
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Applicants for</p>
            <h1 className="text-xl font-bold text-gray-900">{jobTitle}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{applications.length} total application{applications.length !== 1 ? "s" : ""}</p>
          </div>
          {applications.length > 0 && (
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shrink-0">
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap mb-5">
          {TAB_FILTERS.map((tab) => (
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
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeTab === tab ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                  {counts[tab]}
                </span>
              </button>
            ) : null
          ))}
        </div>

        {/* Applicant cards */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 flex flex-col items-center justify-center py-16 text-center px-4">
            <Users size={32} className="text-gray-300 mb-3" />
            <p className="font-semibold text-gray-600">No applicants yet</p>
            <p className="text-sm text-gray-400 mt-1">When candidates apply, they'll appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((app) => {
              const cfg = STATUS_CONFIG[app.status] ?? STATUS_CONFIG.APPLIED
              const nextActions = NEXT_STATUSES[app.status] ?? []
              const isExpanded = expanded === app.id

              return (
                <div key={app.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-[#eef2ff] text-[#1a3461] flex items-center justify-center font-bold text-sm shrink-0 border border-[#dde5ff]">
                        {app.seeker.name[0].toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-gray-900">{app.seeker.name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-gray-500">
                              {app.seeker.city && <span className="flex items-center gap-1"><MapPin size={11} />{app.seeker.city}</span>}
                              <span className="flex items-center gap-1"><Briefcase size={11} />{app.seeker.experienceYears}y exp</span>
                              <span className="text-gray-300">·</span>
                              <span>Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                            </div>
                          </div>
                          <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                            {cfg.label}
                          </span>
                        </div>

                        {/* Skills */}
                        {app.seeker.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {app.seeker.skills.slice(0, 5).map((s) => (
                              <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                            ))}
                            {app.seeker.skills.length > 5 && (
                              <span className="text-xs text-gray-400">+{app.seeker.skills.length - 5}</span>
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
                        <Eye size={12} /> Details <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>
                      {nextActions.map(({ action, label, className }) => (
                        <button
                          key={action}
                          onClick={() => updateStatus(app.id, action)}
                          disabled={actioning === app.id + action}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${className}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 bg-gray-50 space-y-3">

                      {/* ── Contact — always first ── */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Contact</p>
                        {app.seeker.user?.phone ? (
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`tel:+91${app.seeker.user.phone}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1a3461] text-white text-xs font-bold rounded-xl hover:bg-[#142a52] transition-colors"
                            >
                              <Phone size={13} /> Call +91 {app.seeker.user.phone}
                            </a>
                            <a
                              href={`https://wa.me/91${app.seeker.user.phone}?text=${encodeURIComponent(`Hi, I saw your application on Jobs24India. I'd like to connect regarding the position.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                            >
                              <MessageCircle size={13} /> WhatsApp
                            </a>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">Phone number not available for this applicant.</p>
                        )}
                      </div>

                      {/* Resume */}
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Resume</p>
                        {app.seeker.resumeUrl ? (
                          <a
                            href={app.seeker.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a3461] border border-[#1a3461]/30 px-3 py-1.5 rounded-lg hover:bg-[#eef2ff] transition-colors"
                          >
                            <FileText size={12} /> View Resume
                          </a>
                        ) : (
                          <p className="text-xs text-gray-400 italic">No resume uploaded — contact directly via phone.</p>
                        )}
                      </div>

                      {/* About / Bio */}
                      {app.seeker.bio && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">About</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{app.seeker.bio}</p>
                        </div>
                      )}

                      {/* Cover note */}
                      {app.coverNote && (
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Cover Note</p>
                          <p className="text-sm text-gray-700 italic leading-relaxed">"{app.coverNote}"</p>
                        </div>
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
