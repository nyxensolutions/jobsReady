"use client"
import { useEffect, useState } from "react"
import { Briefcase, Loader2, CheckCircle } from "lucide-react"

type EmployerProfile = {
  id: string
  userId: string
  companyName: string
  city: string | null
}

type Category = { slug: string; nameEn: string }
type City = { slug: string; name: string }

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "GIG", "WALK_IN"]

const EMPTY_FORM = {
  employerUserId: "",
  title: "",
  categorySlug: "",
  citySlug: "",
  jobType: "FULL_TIME",
  description: "",
  salaryMin: "",
  salaryMax: "",
  salaryUnit: "monthly",
  vacancies: "1",
  experienceMin: "0",
  qualificationRequired: "",
  requirements: "",
  perks: "",
  status: "ACTIVE",
}

export default function PostJobForm() {
  const [employers, setEmployers] = useState<EmployerProfile[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/employers?status=VERIFIED").then(r => r.json()),
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/cities").then(r => r.json()),
    ]).then(([empData, catData, cityData]) => {
      setEmployers(Array.isArray(empData) ? empData : [])
      setCategories(Array.isArray(catData) ? catData : [])
      setCities(Array.isArray(cityData) ? cityData : [])
      setLoading(false)
    })
  }, [])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    const requirements = form.requirements.split("\n").map(s => s.trim()).filter(Boolean)
    const perks = form.perks.split("\n").map(s => s.trim()).filter(Boolean)

    const res = await fetch("/api/admin/post-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, requirements, perks }),
    })
    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      const emp = employers.find(e => e.userId === form.employerUserId)
      setSuccess(`Job posted for ${emp?.companyName ?? "employer"}! ID: ${data.jobId}`)
      setForm(f => ({
        ...EMPTY_FORM,
        employerUserId: f.employerUserId, // keep employer selected for back-to-back posting
        citySlug: f.citySlug,
        categorySlug: f.categorySlug,
        jobType: f.jobType,
      }))
    } else {
      setError(data.error ?? "Failed to post job")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" /> Loading...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
      <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Briefcase size={18} /> Post Job on Behalf of Employer
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Only verified employers appear below. Job is posted as Active and visible immediately.
      </p>

      {success && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5 text-sm font-semibold">
          <CheckCircle size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Employer */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employer *</label>
          <select
            value={form.employerUserId}
            onChange={e => set("employerUserId", e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 bg-white"
          >
            <option value="">Select verified employer...</option>
            {employers.map(emp => (
              <option key={emp.userId} value={emp.userId}>
                {emp.companyName}{emp.city ? ` — ${emp.city}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Title *</label>
          <input
            value={form.title}
            onChange={e => set("title", e.target.value)}
            required
            placeholder="e.g. Sales Executive"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30"
          />
        </div>

        {/* Category + City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category *</label>
            <select
              value={form.categorySlug}
              onChange={e => set("categorySlug", e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 bg-white"
            >
              <option value="">Select...</option>
              {categories.map(c => (
                <option key={c.slug} value={c.slug}>{c.nameEn}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
            <select
              value={form.citySlug}
              onChange={e => set("citySlug", e.target.value)}
              required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 bg-white"
            >
              <option value="">Select...</option>
              {cities.map(c => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Job Type *</label>
          <select
            value={form.jobType}
            onChange={e => set("jobType", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 bg-white"
          >
            {JOB_TYPES.map(t => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>

        {/* Salary */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salary Min</label>
            <input
              type="number"
              value={form.salaryMin}
              onChange={e => set("salaryMin", e.target.value)}
              placeholder="15000"
              min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salary Max</label>
            <input
              type="number"
              value={form.salaryMax}
              onChange={e => set("salaryMax", e.target.value)}
              placeholder="25000"
              min="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Per</label>
            <select
              value={form.salaryUnit}
              onChange={e => set("salaryUnit", e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 bg-white"
            >
              <option value="monthly">Month</option>
              <option value="daily">Day</option>
            </select>
          </div>
        </div>

        {/* Vacancies + Experience */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vacancies</label>
            <input
              type="number"
              value={form.vacancies}
              onChange={e => set("vacancies", e.target.value)}
              min="1"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Experience (yrs)</label>
            <input
              type="number"
              value={form.experienceMin}
              onChange={e => set("experienceMin", e.target.value)}
              min="0"
              step="0.5"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30"
            />
          </div>
        </div>

        {/* Qualification */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Qualification Required</label>
          <input
            value={form.qualificationRequired}
            onChange={e => set("qualificationRequired", e.target.value)}
            placeholder="e.g. 10th Pass, Graduate"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
          <textarea
            value={form.description}
            onChange={e => set("description", e.target.value)}
            required
            rows={5}
            placeholder="Job responsibilities, role details..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 resize-none"
          />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Requirements <span className="font-normal text-gray-400 text-xs">(one per line)</span>
          </label>
          <textarea
            value={form.requirements}
            onChange={e => set("requirements", e.target.value)}
            rows={3}
            placeholder={"Must have bike\nFluent in Hindi\n1 year experience"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 resize-none"
          />
        </div>

        {/* Perks */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Perks <span className="font-normal text-gray-400 text-xs">(one per line)</span>
          </label>
          <textarea
            value={form.perks}
            onChange={e => set("perks", e.target.value)}
            rows={3}
            placeholder={"PF + ESIC\nWeekly off\nIncentives on target"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 resize-none"
          />
        </div>

        {/* Post as */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Post as</label>
          <select
            value={form.status}
            onChange={e => set("status", e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3461]/30 bg-white"
          >
            <option value="ACTIVE">Active — visible immediately</option>
            <option value="PENDING_REVIEW">Pending Review</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-[#1a3461] text-white rounded-xl text-sm font-bold hover:bg-[#142a52] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting
            ? <><Loader2 size={16} className="animate-spin" /> Posting...</>
            : <><Briefcase size={16} /> Post Job</>}
        </button>
      </form>
    </div>
  )
}
