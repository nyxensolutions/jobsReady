"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Plus, X, Loader2, CheckCircle } from "lucide-react"

type Category = { id: string; slug: string; nameEn: string }
type City = { id: string; slug: string; name: string; stateName: string }

export type JobFormData = {
  title: string
  categorySlug: string
  citySlug: string
  jobType: string
  salaryMin: string
  salaryMax: string
  salaryUnit: string
  vacancies: string
  experienceMin: string
  qualificationRequired: string
  description: string
  requirements: string[]
  perks: string[]
  pincode: string
}

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "GIG", label: "Gig / Daily wage" },
  { value: "WALK_IN", label: "Walk-in Interview" },
]

const SALARY_UNITS = [
  { value: "monthly", label: "per month" },
  { value: "daily", label: "per day" },
]

const QUALIFICATIONS = [
  { value: "", label: "Any qualification" },
  { value: "below10", label: "Below 10th" },
  { value: "10th", label: "10th Pass" },
  { value: "12th", label: "12th Pass" },
  { value: "diploma", label: "Diploma" },
  { value: "graduate", label: "Graduate" },
  { value: "postgraduate", label: "Post Graduate" },
]

function TagList({
  items,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[]
  onAdd: (v: string) => void
  onRemove: (i: number) => void
  placeholder: string
}) {
  const [input, setInput] = useState("")

  function add() {
    const v = input.trim()
    if (v && !items.includes(v)) {
      onAdd(v)
      setInput("")
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
              {item}
              <button type="button" onClick={() => onRemove(i)} className="text-gray-400 hover:text-gray-600">
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add() } }}
          placeholder={placeholder}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button type="button" onClick={add} className="px-3 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export default function PostJobForm({
  categories,
  cities,
  initialData,
  editJobId,
}: {
  categories: Category[]
  cities: City[]
  initialData?: Partial<JobFormData>
  editJobId?: string
}) {
  const router = useRouter()
  const isEdit = !!editJobId
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState<string | null>(null)

  const [title, setTitle] = useState(initialData?.title ?? "")
  const [categorySlug, setCategorySlug] = useState(initialData?.categorySlug ?? "")
  const [citySlug, setCitySlug] = useState(initialData?.citySlug ?? "")
  const [jobType, setJobType] = useState(initialData?.jobType ?? "FULL_TIME")
  const [salaryMin, setSalaryMin] = useState(initialData?.salaryMin ?? "")
  const [salaryMax, setSalaryMax] = useState(initialData?.salaryMax ?? "")
  const [salaryUnit, setSalaryUnit] = useState(initialData?.salaryUnit ?? "monthly")
  const [vacancies, setVacancies] = useState(initialData?.vacancies ?? "1")
  const [experienceMin, setExperienceMin] = useState(initialData?.experienceMin ?? "0")
  const [qualificationRequired, setQualificationRequired] = useState(initialData?.qualificationRequired ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [requirements, setRequirements] = useState<string[]>(initialData?.requirements ?? [])
  const [perks, setPerks] = useState<string[]>(initialData?.perks ?? [])
  const [pincode, setPincode] = useState(initialData?.pincode ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!title.trim() || !categorySlug || !citySlug || !jobType || !description.trim()) {
      setError("Please fill in all required fields.")
      return
    }

    setLoading(true)
    try {
      const url = isEdit ? `/api/employer/jobs/${editJobId}` : "/api/employer/post-job"
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, categorySlug, citySlug, jobType,
          salaryMin: salaryMin || null,
          salaryMax: salaryMax || null,
          salaryUnit, vacancies, experienceMin,
          qualificationRequired: qualificationRequired || null,
          description, requirements, perks, pincode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to save job")
      setDone(data.jobId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isEdit ? "Job updated successfully!" : "Job submitted for review!"}
        </h2>
        <p className="text-gray-500 text-sm mb-7 max-w-sm">
          {isEdit
            ? "Your changes are under review. The job will go live again once approved by our team."
            : "Our team will review your job posting and it will go live within a few hours."}
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => router.push("/employer/dashboard")}
            className="px-5 py-2.5 bg-blue-700 text-white font-semibold rounded-xl text-sm hover:bg-blue-800 transition-colors"
          >
            Go to Dashboard
          </button>
          {!isEdit && (
            <button
              onClick={() => {
                setDone(null)
                setTitle(""); setCategorySlug(""); setCitySlug(""); setDescription("")
                setRequirements([]); setPerks([])
              }}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Post Another
            </button>
          )}
        </div>
      </div>
    )
  }

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Title */}
      <div>
        <label className={labelCls}>Job Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Delivery Executive, Security Guard"
          className={inputCls}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Category */}
        <div>
          <label className={labelCls}>Category <span className="text-red-500">*</span></label>
          <select value={categorySlug} onChange={(e) => setCategorySlug(e.target.value)} className={inputCls + " bg-white text-gray-700"}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.slug} value={c.slug}>{c.nameEn}</option>)}
          </select>
        </div>

        {/* City */}
        <div>
          <label className={labelCls}>City <span className="text-red-500">*</span></label>
          <select value={citySlug} onChange={(e) => setCitySlug(e.target.value)} className={inputCls + " bg-white text-gray-700"}>
            <option value="">Select city</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}, {c.stateName}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Job Type */}
        <div>
          <label className={labelCls}>Job Type <span className="text-red-500">*</span></label>
          <select value={jobType} onChange={(e) => setJobType(e.target.value)} className={inputCls + " bg-white text-gray-700"}>
            {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Vacancies */}
        <div>
          <label className={labelCls}>Number of Vacancies <span className="text-red-500">*</span></label>
          <input
            type="number" min="1" max="999"
            value={vacancies}
            onChange={(e) => setVacancies(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className={labelCls}>Salary Range <span className="text-gray-400 font-normal text-xs">(recommended)</span></label>
        <div className="flex items-center gap-2">
          <input type="number" min="0" value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} placeholder="Min (e.g. 12000)" className={inputCls} />
          <span className="text-gray-400 text-sm shrink-0">to</span>
          <input type="number" min="0" value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} placeholder="Max (e.g. 20000)" className={inputCls} />
          <select value={salaryUnit} onChange={(e) => setSalaryUnit(e.target.value)} className="px-3 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 shrink-0">
            {SALARY_UNITS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Experience */}
        <div>
          <label className={labelCls}>Minimum Experience</label>
          <select value={experienceMin} onChange={(e) => setExperienceMin(e.target.value)} className={inputCls + " bg-white text-gray-700"}>
            <option value="0">Freshers OK (0 years)</option>
            <option value="1">1+ years</option>
            <option value="2">2+ years</option>
            <option value="3">3+ years</option>
            <option value="5">5+ years</option>
          </select>
        </div>

        {/* Qualification */}
        <div>
          <label className={labelCls}>Minimum Qualification</label>
          <select value={qualificationRequired} onChange={(e) => setQualificationRequired(e.target.value)} className={inputCls + " bg-white text-gray-700"}>
            {QUALIFICATIONS.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
          </select>
        </div>
      </div>

      {/* Pincode */}
      <div>
        <label className={labelCls}>Area Pincode <span className="text-gray-400 font-normal text-xs">(optional — helps candidates find jobs near them)</span></label>
        <input
          type="text"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="e.g. 110001"
          className={inputCls}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Job Description <span className="text-red-500">*</span></label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe the role, responsibilities, and what a typical day looks like..."
          className={inputCls + " resize-y"}
        />
      </div>

      {/* Requirements */}
      <div>
        <label className={labelCls}>Requirements <span className="text-gray-400 font-normal text-xs">(press Enter or + to add)</span></label>
        <TagList
          items={requirements}
          onAdd={(v) => setRequirements((p) => [...p, v])}
          onRemove={(i) => setRequirements((p) => p.filter((_, idx) => idx !== i))}
          placeholder="e.g. Valid driving licence"
        />
      </div>

      {/* Perks */}
      <div>
        <label className={labelCls}>Perks & Benefits <span className="text-gray-400 font-normal text-xs">(press Enter or + to add)</span></label>
        <TagList
          items={perks}
          onAdd={(v) => setPerks((p) => [...p, v])}
          onRemove={(i) => setPerks((p) => p.filter((_, idx) => idx !== i))}
          placeholder="e.g. Weekly salary payout"
        />
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {isEdit ? "Save Changes" : "Submit for Review"}
      </button>

      {!isEdit && (
        <p className="text-center text-xs text-gray-400">
          Jobs are reviewed by our team and typically go live within a few hours.
        </p>
      )}
    </form>
  )
}
