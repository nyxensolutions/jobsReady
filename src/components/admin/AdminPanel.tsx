"use client"
import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Star, StarOff, ExternalLink, Phone, Building2, MapPin, Tag, Users } from "lucide-react"

type Job = {
  id: string
  title: string
  salaryMin: number
  salaryMax: number | null
  jobType: string
  status: string
  isFeatured: boolean
  createdAt: string
  employer: { companyName: string; contactPerson: string; contactPhone: string; status: string }
  category: { nameEn: string }
  city: { name: string }
  _count: { applications: number }
}

const JOB_STATUS_TABS = ["PENDING_REVIEW", "ACTIVE", "REJECTED"]
const EMP_STATUS_TABS = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED"]

type Employer = {
  id: string
  companyName: string
  contactPerson: string | null
  contactPhone: string | null
  city: string | null
  industry: string | null
  status: string
  createdAt: string
  user: { phone: string | null; email: string | null }
  _count: { jobListings: number }
}

export default function AdminPanel() {
  const [section, setSection] = useState<"jobs" | "employers">("jobs")

  // Jobs state
  const [jobs, setJobs] = useState<Job[]>([])
  const [jobTab, setJobTab] = useState("PENDING_REVIEW")
  const [jobLoading, setJobLoading] = useState(false)
  const [actioning, setActioning] = useState<string | null>(null)

  // Employers state
  const [employers, setEmployers] = useState<Employer[]>([])
  const [empTab, setEmpTab] = useState("PENDING")
  const [empLoading, setEmpLoading] = useState(false)

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

  async function jobAction(jobId: string, act: string) {
    setActioning(jobId + act)
    await fetch(`/api/admin/jobs/${jobId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: act }) })
    setActioning(null)
    fetchJobs(jobTab)
  }

  async function empAction(empId: string, act: string) {
    setActioning(empId + act)
    await fetch(`/api/admin/employers/${empId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: act }) })
    setActioning(null)
    fetchEmployers(empTab)
  }

  const formatSalary = (min: number, max: number | null) =>
    max ? `₹${(min / 1000).toFixed(0)}K–₹${(max / 1000).toFixed(0)}K/mo` : `₹${(min / 1000).toFixed(0)}K+/mo`

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
              {JOB_STATUS_TABS.map(tab => (
                <button key={tab} onClick={() => setJobTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${jobTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab === "PENDING_REVIEW" ? "Pending" : tab === "ACTIVE" ? "Active" : "Rejected"}
                </button>
              ))}
            </div>

            {jobLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <CheckCircle size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nothing here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5">
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
                          <span className="flex items-center gap-1"><Phone size={13} />{job.employer.contactPhone}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{job.jobType.replace("_", " ")}</span>
                          <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">{job._count.applications} applied</span>
                          <span className="text-xs text-gray-500">{new Date(job.createdAt).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
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
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── EMPLOYERS SECTION ── */}
        {section === "employers" && (
          <>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-5">
              {EMP_STATUS_TABS.map(tab => (
                <button key={tab} onClick={() => setEmpTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${empTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {empLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>
            ) : employers.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Users size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">No employers here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employers.map(emp => (
                  <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-5">
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
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
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
