"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Briefcase, Star, X, ChevronLeft, ChevronRight, Send, Check, Loader2 } from "lucide-react"
import Link from "next/link"

type Candidate = {
  id: string
  name: string
  city: string | null
  stateCode: string | null
  experienceYears: number
  skills: string[]
  preferredCategories: string[]
  preferredJobTypes: string[]
  languages: string[]
  openToRelocate: boolean
  preferredCities: string[]
  bio: string | null
  photoUrl: string | null
  updatedAt: string
}

type Job = { id: string; title: string; city: { name: string } }
type Category = { slug: string; nameEn: string }
type City = { name: string; slug: string }

const EXP_OPTIONS = [
  { value: "", label: "Any experience" },
  { value: "0", label: "Freshers" },
  { value: "1", label: "1+ years" },
  { value: "2", label: "2+ years" },
  { value: "3", label: "3+ years" },
  { value: "5", label: "5+ years" },
]

const CAT_LABELS: Record<string, string> = {
  delivery: "Delivery", driver: "Driver", sales: "Sales", security: "Security",
  housekeeping: "Housekeeping", cook: "Cook", construction: "Construction",
  factory: "Factory", retail: "Retail", fieldWork: "Field Work", it: "IT", healthcare: "Healthcare",
}

function Avatar({ name, photoUrl }: { name: string; photoUrl: string | null }) {
  if (photoUrl) {
    return <img src={photoUrl} alt={name} className="w-12 h-12 rounded-full object-cover shrink-0" />
  }
  return (
    <div className="w-12 h-12 rounded-full bg-[#1a3461] text-white font-bold text-lg flex items-center justify-center shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function InviteModal({
  candidate,
  jobs,
  onClose,
}: {
  candidate: Candidate
  jobs: Job[]
  onClose: () => void
}) {
  const [selectedJobId, setSelectedJobId] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle")

  async function sendInvite() {
    if (!selectedJobId) return
    setStatus("sending")
    try {
      const res = await fetch("/api/employer/candidates/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seekerProfileId: candidate.id, jobId: selectedJobId }),
      })
      setStatus(res.ok ? "sent" : "error")
    } catch {
      setStatus("error")
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900">Invite to Apply</h3>
            <p className="text-sm text-gray-500 mt-0.5">Send {candidate.name.split(" ")[0]} a job invite</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
            <X size={20} />
          </button>
        </div>

        {status === "sent" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <Check size={24} className="text-green-600" />
            </div>
            <p className="font-semibold text-gray-900">Invite sent!</p>
            <p className="text-sm text-gray-500 mt-1">{candidate.name.split(" ")[0]} will see it in their notifications.</p>
            <button onClick={onClose} className="mt-5 text-sm font-medium text-[#1a3461] hover:underline">Close</button>
          </div>
        ) : (
          <>
            {jobs.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm mb-3">You have no active job listings to invite for.</p>
                <Link href="/employer/post-job" className="text-sm font-semibold text-[#1a3461] hover:underline">
                  Post a job first →
                </Link>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700 mb-2">Choose a job to invite them for:</p>
                <div className="flex flex-col gap-2 mb-5 max-h-60 overflow-y-auto">
                  {jobs.map((job) => (
                    <label
                      key={job.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedJobId === job.id
                          ? "border-[#1a3461] bg-[#eef2ff]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="job"
                        value={job.id}
                        checked={selectedJobId === job.id}
                        onChange={() => setSelectedJobId(job.id)}
                        className="accent-[#1a3461]"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                        <p className="text-xs text-gray-400">{job.city.name}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-600 mb-3">Something went wrong. Please try again.</p>
                )}

                <button
                  onClick={sendInvite}
                  disabled={!selectedJobId || status === "sending"}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#1a3461] text-white font-bold text-sm rounded-xl hover:bg-[#142a52] transition-colors disabled:opacity-50"
                >
                  {status === "sending" ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                  Send Invite
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CandidateCard({ candidate, jobs }: { candidate: Candidate; jobs: Job[] }) {
  const [inviteOpen, setInviteOpen] = useState(false)

  const expLabel = candidate.experienceYears === 0
    ? "Fresher"
    : `${candidate.experienceYears}+ yr${candidate.experienceYears > 1 ? "s" : ""} exp`

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 hover:shadow-md hover:border-[#1a3461]/20 transition-all p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar name={candidate.name} photoUrl={candidate.photoUrl} />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{candidate.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {candidate.city && (
                <span className="flex items-center gap-0.5 text-xs text-gray-500">
                  <MapPin size={10} /> {candidate.city}
                </span>
              )}
              <span className="flex items-center gap-0.5 text-xs text-gray-500">
                <Briefcase size={10} /> {expLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {candidate.bio && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{candidate.bio}</p>
        )}

        {/* Skills */}
        {candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 5).map((skill) => (
              <span key={skill} className="text-xs bg-[#EBF3FF] text-[#1a3461] px-2.5 py-1 rounded-full font-medium">
                {skill}
              </span>
            ))}
            {candidate.skills.length > 5 && (
              <span className="text-xs text-gray-400 px-2 py-1">+{candidate.skills.length - 5} more</span>
            )}
          </div>
        )}

        {/* Languages */}
        {candidate.languages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-400">Languages:</span>
            {candidate.languages.map((lang) => (
              <span key={lang} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Location preference */}
        {!candidate.openToRelocate && candidate.preferredCities.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin size={10} /> Prefers:</span>
            {candidate.preferredCities.slice(0, 3).map(c => (
              <span key={c} className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{c}</span>
            ))}
          </div>
        )}

        {/* Preferred categories */}
        {candidate.preferredCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-gray-400 flex items-center gap-1"><Star size={10} /> Looking for:</span>
            {candidate.preferredCategories.slice(0, 3).map((cat) => (
              <span key={cat} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                {CAT_LABELS[cat] ?? cat}
              </span>
            ))}
          </div>
        )}

        {/* Action */}
        <button
          onClick={() => setInviteOpen(true)}
          className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-600 hover:shadow-md active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all"
        >
          <Send size={14} /> Invite to Apply
        </button>
      </div>

      {inviteOpen && (
        <InviteModal candidate={candidate} jobs={jobs} onClose={() => setInviteOpen(false)} />
      )}
    </>
  )
}

export default function CandidateSearchClient({
  initialCandidates,
  initialTotal,
  initialPage,
  activeJobs,
  categories,
  cities,
  filters,
  companyName,
}: {
  initialCandidates: Candidate[]
  initialTotal: number
  initialPage: number
  activeJobs: Job[]
  categories: Category[]
  cities: City[]
  filters: { city?: string; category?: string; keyword?: string; minExp?: string; language?: string }
  companyName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [city, setCity] = useState(filters.city ?? "")
  const [category, setCategory] = useState(filters.category ?? "")
  const [keyword, setKeyword] = useState(filters.keyword ?? "")
  const [minExp, setMinExp] = useState(filters.minExp ?? "")
  const [language, setLanguage] = useState(filters.language ?? "")

  function buildParams() {
    const params = new URLSearchParams()
    if (city) params.set("city", city)
    if (category) params.set("category", category)
    if (keyword) params.set("q", keyword)
    if (minExp) params.set("minExp", minExp)
    if (language) params.set("language", language)
    return params
  }

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault()
    startTransition(() => router.push(`/employer/candidates?${buildParams().toString()}`))
  }

  function clearFilters() {
    setCity(""); setCategory(""); setKeyword(""); setMinExp(""); setLanguage("")
    startTransition(() => router.push("/employer/candidates"))
  }

  function goToPage(p: number) {
    const params = buildParams()
    params.set("page", p.toString())
    startTransition(() => router.push(`/employer/candidates?${params.toString()}`))
  }

  const hasActiveFilters = !!(city || category || keyword || minExp || language)
  const totalPages = Math.ceil(initialTotal / 24)

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461] bg-white"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Find Candidates</h1>
              <p className="text-sm text-gray-500 mt-0.5">Search job seekers and invite them to apply — {companyName}</p>
            </div>
            <Link
              href="/employer/dashboard"
              className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search filters */}
        <form onSubmit={applyFilters} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Keyword */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search skill or keyword"
                className={inputCls + " pl-9"}
              />
            </div>

            {/* City */}
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls + " pl-9"}>
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c.slug} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              <option value="">All job types</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.nameEn}</option>
              ))}
            </select>

            {/* Experience */}
            <select value={minExp} onChange={(e) => setMinExp(e.target.value)} className={inputCls}>
              {EXP_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Language */}
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
              <option value="">Any language</option>
              {["Hindi", "English", "Telugu", "Tamil", "Kannada", "Malayalam", "Bengali", "Marathi", "Gujarati", "Punjabi", "Odia", "Urdu"].map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 mt-3">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#1a3461] text-white text-sm font-bold rounded-xl hover:bg-[#142a52] transition-colors disabled:opacity-60"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Search
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X size={13} /> Clear filters
              </button>
            )}
          </div>
        </form>

        {/* Results summary */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {initialTotal === 0
              ? "No candidates found"
              : `${initialTotal} candidate${initialTotal !== 1 ? "s" : ""} found`}
            {hasActiveFilters && " with current filters"}
          </p>
          {activeJobs.length === 0 && (
            <Link href="/employer/post-job" className="text-xs font-semibold text-orange-600 hover:underline">
              Post a job to invite candidates →
            </Link>
          )}
        </div>

        {/* Candidate grid */}
        {initialCandidates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-semibold text-gray-700">No candidates match your filters</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting the city or removing filters</p>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-4 text-sm font-medium text-[#1a3461] hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {initialCandidates.map((c) => (
              <CandidateCard key={c.id} candidate={c} jobs={activeJobs} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => goToPage(initialPage - 1)}
              disabled={initialPage <= 1 || isPending}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-gray-600 px-3">
              Page {initialPage} of {totalPages}
            </span>
            <button
              onClick={() => goToPage(initialPage + 1)}
              disabled={initialPage >= totalPages || isPending}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Info box for employers with no active jobs */}
        {activeJobs.length === 0 && initialCandidates.length > 0 && (
          <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-3">
            <Send size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Post a job to invite candidates</p>
              <p className="text-xs text-amber-700 mt-0.5">
                You can see candidate profiles, but to invite them you need at least one active job listing.{" "}
                <Link href="/employer/post-job" className="font-bold hover:underline">Post a job →</Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
