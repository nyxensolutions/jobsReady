"use client"
import { useEffect, useState } from "react"
import {
  CheckCircle, XCircle, Star, StarOff, ExternalLink, Phone,
  Building2, MapPin, Tag, Users, ChevronDown, ChevronUp,
  FileText, Globe, Loader2, AlertTriangle,
} from "lucide-react"

type Job = {
  id: string
  title: string
  salaryMin: number | null
  salaryMax: number | null
  salaryUnit: string
  jobType: string
  status: string
  isFeatured: boolean
  createdAt: string
  description: string
  requirements: string[]
  perks: string[]
  qualificationRequired: string | null
  experienceMin: number
  vacancies: number
  employer: {
    companyName: string; contactPerson: string; contactPhone: string
    status: string; website: string | null; description: string | null; docUrls: string[]
  }
  category: { nameEn: string }
  city: { name: string }
  _count: { applications: number }
}

type Employer = {
  id: string
  companyName: string
  contactPerson: string | null
  contactPhone: string | null
  city: string | null
  industry: string | null
  status: string
  createdAt: string
  website: string | null
  description: string | null
  gstCin: string | null
  docUrls: string[]
  user: { phone: string | null; email: string | null }
  _count: { jobListings: number }
}

const JOB_STATUS_TABS = ["PENDING_REVIEW", "ACTIVE", "REJECTED"]
const EMP_STATUS_TABS = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]

// ── Confirm dialog ─────────────────────────────────────────────────────────
function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-sm w-full mx-4">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Are you sure?</p>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-[#1a3461] text-white rounded-xl text-sm font-semibold hover:bg-[#142a52] transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [section, setSection] = useState<"jobs" | "employers">("jobs")

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobTab, setJobTab] = useState("PENDING_REVIEW")
  const [jobLoading, setJobLoading] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [expandedEmp, setExpandedEmp] = useState<string | null>(null)

  // Employers state
  const [employers, setEmployers] = useState<Employer[]>([])
  const [empTab, setEmpTab] = useState("PENDING")
  const [empLoading, setEmpLoading] = useState(false)

  // Confirm dialog state
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null)

  async function fetchJobs(status: string) {
    setJobLoading(true)
    const res = await fetch(`/api/admin/jobs?status=${status}`)
    if (res.status === 403) { alert("Access denied — admin only"); return }
    setJobs(await res.json())
    setJobLoading(false)
  }

  async function fetchEmployers(status: string) {
    setEmpLoading(true)
    const res = await fetch(`/api/admin/employers?status=${status}`)
    if (res.status === 403) { alert("Access denied — admin only"); return }
    setEmployers(await res.json())
    setEmpLoading(false)
  }

  useEffect(() => { if (section === "jobs") fetchJobs(jobTab) }, [section, jobTab])
  useEffect(() => { if (section === "employers") fetchEmployers(empTab) }, [section, empTab])

  // ── Per-item actions ──────────────────────────────────────────────────────
  async function jobAction(jobId: string, act: string) {
    setActioning(jobId + act)
    await fetch(`/api/admin/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    })
    setActioning(null)
    fetchJobs(jobTab)
  }

  async function empAction(empId: string, act: string) {
    setActioning(empId + act)
    await fetch(`/api/admin/employers/${empId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    })
    setActioning(null)
    fetchEmployers(empTab)
  }

  // ── Bulk actions ──────────────────────────────────────────────────────────
  function askThenBulkJob(action: string, label: string) {
    const count = jobs.length
    setConfirm({
      message: `This will ${label.toLowerCase()} all ${count} job${count !== 1 ? "s" : ""} in this tab. This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null)
        setBulkLoading(true)
        const res = await fetch("/api/admin/jobs/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, fromStatus: jobTab }),
        })
        const data = await res.json()
        setBulkLoading(false)
        fetchJobs(jobTab)
        alert(`Done — ${data.count} job${data.count !== 1 ? "s" : ""} updated.`)
      },
    })
  }

  function askThenBulkEmp(action: string, label: string) {
    const count = employers.length
    setConfirm({
      message: `This will ${label.toLowerCase()} all ${count} employer${count !== 1 ? "s" : ""} in this tab. This cannot be undone.`,
      onConfirm: async () => {
        setConfirm(null)
        setBulkLoading(true)
        const res = await fetch("/api/admin/employers/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, fromStatus: empTab }),
        })
        const data = await res.json()
        setBulkLoading(false)
        fetchEmployers(empTab)
        alert(`Done — ${data.count} employer${data.count !== 1 ? "s" : ""} updated.`)
      },
    })
  }

  const formatSalary = (min: number | null, max: number | null, unit = "monthly") => {
    const suffix = unit === "daily" ? "/day" : "/mo"
    const fmt = (n: number) => n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`
    if (min && max) return `${fmt(min)}–${fmt(max)}${suffix}`
    if (min) return `${fmt(min)}+${suffix}`
    if (max) return `Up to ${fmt(max)}${suffix}`
    return "Salary N/A"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage jobs and employers</p>
          </div>
          <span className="text-xs bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full uppercase tracking-wide">Admin Only</span>
        </div>

        {/* Section switcher */}
        <div className="flex gap-1 bg-gray-200 rounded-xl p-1 w-fit mb-6">
          <button
            onClick={() => setSection("jobs")}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${section === "jobs" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Tag size={14} /> Jobs
          </button>
          <button
            onClick={() => setSection("employers")}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${section === "employers" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Users size={14} /> Employers
          </button>
        </div>

        {/* ── JOBS SECTION ── */}
        {section === "jobs" && (
          <>
            {/* Tab bar + count + bulk actions */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {JOB_STATUS_TABS.map(tab => (
                  <button key={tab} onClick={() => setJobTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${jobTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab === "PENDING_REVIEW" ? "Pending" : tab === "ACTIVE" ? "Active" : "Rejected"}
                    {jobTab === tab && !jobLoading && (
                      <span className="ml-1.5 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full font-bold">
                        {jobs.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bulk action buttons — only show when items exist */}
              {!jobLoading && jobs.length > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  {bulkLoading && <Loader2 size={15} className="animate-spin text-gray-400" />}
                  {jobTab === "PENDING_REVIEW" && (
                    <>
                      <button
                        onClick={() => askThenBulkJob("reject", "Reject All")}
                        disabled={bulkLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={15} /> Reject All ({jobs.length})
                      </button>
                      <button
                        onClick={() => askThenBulkJob("approve", "Approve All")}
                        disabled={bulkLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={15} /> Approve All ({jobs.length})
                      </button>
                    </>
                  )}
                  {jobTab === "ACTIVE" && (
                    <button
                      onClick={() => askThenBulkJob("deactivate", "Deactivate All")}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} /> Deactivate All ({jobs.length})
                    </button>
                  )}
                  {jobTab === "REJECTED" && (
                    <button
                      onClick={() => askThenBulkJob("reapprove", "Re-approve All")}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={15} /> Re-approve All ({jobs.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {jobLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 size={24} className="animate-spin mr-2" /> Loading...
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nothing here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 text-base">{job.title}</h3>
                            {job.isFeatured && <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-semibold">Featured</span>}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Building2 size={13} />{job.employer.companyName}</span>
                            <span className="flex items-center gap-1"><MapPin size={13} />{job.city.name}</span>
                            <span className="flex items-center gap-1"><Tag size={13} />{job.category.nameEn}</span>
                            {job.employer.contactPhone && <span className="flex items-center gap-1"><Phone size={13} />{job.employer.contactPhone}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${job.salaryMin ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"}`}>
                              {formatSalary(job.salaryMin, job.salaryMax, job.salaryUnit)}
                            </span>
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{job.jobType.replace(/_/g, " ")}</span>
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{job.vacancies} vacancy</span>
                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{job._count.applications} applied</span>
                            <span className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          <a href={`/jobs/${job.id}`} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-[#1a3461] rounded-lg hover:bg-gray-100 transition-colors">
                            <ExternalLink size={16} />
                          </a>
                          <button
                            onClick={() => jobAction(job.id, "feature")}
                            disabled={actioning === job.id + "feature"}
                            className={`p-2 rounded-lg hover:bg-amber-50 transition-colors ${job.isFeatured ? "text-amber-500" : "text-gray-400 hover:text-amber-500"}`}
                            title={job.isFeatured ? "Unfeature" : "Feature"}
                          >
                            {job.isFeatured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                          </button>
                          {jobTab === "PENDING_REVIEW" && (
                            <>
                              <button onClick={() => jobAction(job.id, "reject")} disabled={!!actioning}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                                <XCircle size={15} /> Reject
                              </button>
                              <button onClick={() => jobAction(job.id, "approve")} disabled={!!actioning}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                <CheckCircle size={15} /> Approve
                              </button>
                            </>
                          )}
                          {jobTab === "ACTIVE" && (
                            <button onClick={() => jobAction(job.id, "reject")} disabled={!!actioning}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                              <XCircle size={15} /> Deactivate
                            </button>
                          )}
                          {jobTab === "REJECTED" && (
                            <button onClick={() => jobAction(job.id, "approve")} disabled={!!actioning}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                              <CheckCircle size={15} /> Re-approve
                            </button>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#1a3461] hover:underline"
                      >
                        {expandedJob === job.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {expandedJob === job.id ? "Hide details" : "View full details"}
                      </button>
                    </div>

                    {expandedJob === job.id && (
                      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex flex-col gap-4">
                        <div>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Job Description</p>
                          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {job.requirements.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Requirements</p>
                              <ul className="space-y-0.5">
                                {job.requirements.map((r, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5"><span className="text-gray-400 mt-1">•</span>{r}</li>)}
                              </ul>
                            </div>
                          )}
                          {job.perks.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Perks</p>
                              <ul className="space-y-0.5">
                                {job.perks.map((p, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-1.5"><span className="text-green-500 mt-1">✓</span>{p}</li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                          {job.qualificationRequired && <span><span className="font-semibold">Qualification:</span> {job.qualificationRequired}</span>}
                          <span><span className="font-semibold">Experience:</span> {job.experienceMin === 0 ? "Freshers OK" : `${job.experienceMin}+ yrs`}</span>
                        </div>
                        {job.employer.docUrls.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Employer Documents</p>
                            <div className="flex flex-wrap gap-2">
                              {job.employer.docUrls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3461] border border-[#1a3461]/30 px-3 py-1.5 rounded-lg hover:bg-[#1a3461]/5 transition-colors">
                                  <FileText size={12} /> Doc {i + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                        {job.employer.website && (
                          <a href={job.employer.website} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline w-fit">
                            <Globe size={12} /> {job.employer.website}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── EMPLOYERS SECTION ── */}
        {section === "employers" && (
          <>
            {/* Tab bar + count + bulk actions */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {EMP_STATUS_TABS.map(tab => (
                  <button key={tab} onClick={() => setEmpTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${empTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    {empTab === tab && !empLoading && (
                      <span className="ml-1.5 text-xs bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full font-bold">
                        {employers.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {!empLoading && employers.length > 0 && (
                <div className="flex items-center gap-2 ml-auto">
                  {bulkLoading && <Loader2 size={15} className="animate-spin text-gray-400" />}
                  {empTab === "PENDING" && (
                    <>
                      <button
                        onClick={() => askThenBulkEmp("reject", "Reject All")}
                        disabled={bulkLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={15} /> Reject All ({employers.length})
                      </button>
                      <button
                        onClick={() => askThenBulkEmp("verify", "Verify All")}
                        disabled={bulkLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle size={15} /> Verify All ({employers.length})
                      </button>
                    </>
                  )}
                  {empTab === "VERIFIED" && (
                    <button
                      onClick={() => askThenBulkEmp("suspend", "Suspend All")}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle size={15} /> Suspend All ({employers.length})
                    </button>
                  )}
                  {(empTab === "REJECTED" || empTab === "SUSPENDED") && (
                    <button
                      onClick={() => askThenBulkEmp("restore", "Restore All")}
                      disabled={bulkLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-[#1a3461] rounded-lg hover:bg-[#142a52] transition-colors disabled:opacity-50"
                    >
                      <CheckCircle size={15} /> Restore All ({employers.length})
                    </button>
                  )}
                </div>
              )}
            </div>

            {empLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                <Loader2 size={24} className="animate-spin mr-2" /> Loading...
              </div>
            ) : employers.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No employers here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employers.map(emp => (
                  <div key={emp.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900">{emp.companyName}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              emp.status === "VERIFIED" ? "bg-green-100 text-green-700"
                              : emp.status === "SUSPENDED" ? "bg-red-100 text-red-700"
                              : emp.status === "REJECTED" ? "bg-gray-100 text-gray-600"
                              : "bg-amber-100 text-amber-700"
                            }`}>{emp.status}</span>
                            {emp.docUrls.length > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                                {emp.docUrls.length} doc{emp.docUrls.length !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                            {emp.contactPerson && <span className="flex items-center gap-1"><Building2 size={13} />{emp.contactPerson}</span>}
                            {emp.contactPhone && <span className="flex items-center gap-1"><Phone size={13} />{emp.contactPhone}</span>}
                            {emp.city && <span className="flex items-center gap-1"><MapPin size={13} />{emp.city}</span>}
                            {emp.industry && <span className="flex items-center gap-1"><Tag size={13} />{emp.industry}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-400">
                            <span>Phone: {emp.user.phone ?? "—"}</span>
                            <span>·</span>
                            <span>{emp._count.jobListings} job{emp._count.jobListings !== 1 ? "s" : ""} posted</span>
                            <span>·</span>
                            <span>Joined {new Date(emp.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                          {empTab === "PENDING" && (
                            <>
                              <button onClick={() => empAction(emp.id, "reject")} disabled={!!actioning}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                                <XCircle size={15} /> Reject
                              </button>
                              <button onClick={() => empAction(emp.id, "verify")} disabled={!!actioning}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50">
                                <CheckCircle size={15} /> Verify
                              </button>
                            </>
                          )}
                          {empTab === "VERIFIED" && (
                            <button onClick={() => empAction(emp.id, "suspend")} disabled={!!actioning}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50">
                              <XCircle size={15} /> Suspend
                            </button>
                          )}
                          {(empTab === "REJECTED" || empTab === "SUSPENDED") && (
                            <button onClick={() => empAction(emp.id, "restore")} disabled={!!actioning}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-[#1a3461] rounded-lg hover:bg-[#142a52] transition-colors disabled:opacity-50">
                              <CheckCircle size={15} /> Restore
                            </button>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandedEmp(expandedEmp === emp.id ? null : emp.id)}
                        className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#1a3461] hover:underline"
                      >
                        {expandedEmp === emp.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {expandedEmp === emp.id ? "Hide details" : "View full details"}
                      </button>
                    </div>

                    {expandedEmp === emp.id && (
                      <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 flex flex-col gap-4">
                        {emp.description && (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Company Description</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{emp.description}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-600">
                          {emp.gstCin && <span><span className="font-semibold">GST/CIN:</span> {emp.gstCin}</span>}
                          {emp.website && (
                            <a href={emp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                              <Globe size={12} /> {emp.website}
                            </a>
                          )}
                          {emp.user.email && <span><span className="font-semibold">Email:</span> {emp.user.email}</span>}
                        </div>
                        {emp.docUrls.length > 0 ? (
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                              Uploaded Documents ({emp.docUrls.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {emp.docUrls.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-xs font-semibold text-[#1a3461] border border-[#1a3461]/30 bg-white px-3 py-2 rounded-lg hover:bg-[#1a3461]/5 transition-colors">
                                  <FileText size={13} /> Document {i + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-600 font-medium">⚠ No documents uploaded yet</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
