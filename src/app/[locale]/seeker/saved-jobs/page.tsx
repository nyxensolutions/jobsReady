"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark, MapPin, Phone, ChevronRight } from "lucide-react"

interface SavedJob {
  id: string
  createdAt: string
  job: {
    id: string
    title: string
    salaryMin: number
    salaryMax: number | null
    status: string
    employer: { companyName: string; contactPhone: string | null }
    city: { name: string }
    category: { slug: string; nameEn: string }
  }
}

function formatSalary(min: number, max: number | null) {
  return max ? `₹${(min / 1000).toFixed(0)}K–₹${(max / 1000).toFixed(0)}K/mo` : `₹${(min / 1000).toFixed(0)}K+/mo`
}

export default function SavedJobsPage() {
  const [saved, setSaved] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/seeker/saved-jobs")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setSaved(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function unsave(jobId: string) {
    await fetch("/api/seeker/saved-jobs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) })
    setSaved(prev => prev.filter(s => s.job.id !== jobId))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Bookmark size={20} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-sm text-gray-500">{loading ? "Loading..." : `${saved.length} job${saved.length !== 1 ? "s" : ""} saved`}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="font-semibold text-gray-500">No saved jobs yet</p>
            <p className="text-sm text-gray-400 mt-1">Tap the bookmark icon on any job to save it</p>
            <Link href="/jobs" className="mt-6 inline-block bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-orange-600 transition-colors">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map(({ id, job, createdAt }) => (
              <div key={id} className="bg-white rounded-xl border border-gray-200 hover:border-[#1a3461]/30 hover:shadow-sm transition-all">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <Link href={`/jobs/${job.id}`}>
                        <h3 className="font-bold text-[#1a3461] text-sm hover:underline truncate">{job.title}</h3>
                      </Link>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{job.employer.companyName}</p>
                      <p className="text-sm font-bold text-green-600 mt-1.5">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin size={11} />{job.city.name}</span>
                        <span>Saved {new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => unsave(job.id)}
                      className="p-2 rounded-full text-orange-400 hover:text-gray-400 hover:bg-gray-100 transition-colors"
                      title="Remove from saved"
                    >
                      <Bookmark size={16} fill="currentColor" />
                    </button>
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <Link href={`/jobs/${job.id}`} className="flex-1 flex items-center justify-center gap-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors">
                    Apply Now <ChevronRight size={13} />
                  </Link>
                  {job.employer.contactPhone && (
                    <a href={`tel:${job.employer.contactPhone}`} className="flex items-center gap-1.5 px-4 py-2 border border-green-500 text-green-700 text-xs font-bold rounded-lg hover:bg-green-50 transition-colors">
                      <Phone size={13} /> Call HR
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
