"use client"
import { useState, useEffect } from "react"
import { X, Loader2, CheckCircle, Phone, PhoneOff } from "lucide-react"
import { areasForCity } from "@/lib/areas"

type Job = {
  id: string
  title: string
  description: string
  salaryMin: number | null
  salaryMax: number | null
  salaryUnit: string
  jobType: string
  status: string
  vacancies: number
  experienceMin: number
  qualificationRequired: string | null
  requirements: string[]
  perks: string[]
  pincode: string | null
  area: string | null
  incentives: string | null
  workingDaysPerWeek: number | null
  shiftType: string | null
  callToHrEnabled: boolean
  callToHrPhone: string | null
  isFeatured: boolean
  category: { nameEn: string; slug: string }
  city: { name: string; slug: string }
  employer: { companyName: string; contactPhone: string | null }
}

type Category = { slug: string; nameEn: string }
type City = { slug: string; name: string; stateName?: string }

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "GIG", "WALK_IN"]
const JOB_STATUSES = ["PENDING_REVIEW", "ACTIVE", "REJECTED", "CLOSED"]
const SHIFT_TYPES = ["Day", "Night", "Rotational", "Flexible"]

export default function AdminJobEditModal({
  job,
  onClose,
  onSaved,
}: {
  job: Job
  onClose: () => void
  onSaved: () => void
}) {
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    title: job.title,
    categorySlug: job.category.slug,
    citySlug: job.city.slug,
    area: job.area ?? "",
    jobType: job.jobType,
    salaryMin: job.salaryMin?.toString() ?? "",
    salaryMax: job.salaryMax?.toString() ?? "",
    salaryUnit: job.salaryUnit,
    vacancies: job.vacancies.toString(),
    experienceMin: job.experienceMin.toString(),
    qualificationRequired: job.qualificationRequired ?? "",
    description: job.description,
    requirements: job.requirements.join("\n"),
    perks: job.perks.join("\n"),
    pincode: job.pincode ?? "",
    incentives: job.incentives ?? "",
    workingDaysPerWeek: job.workingDaysPerWeek?.toString() ?? "",
    shiftType: job.shiftType ?? "",
    callToHrEnabled: job.callToHrEnabled,
    callToHrPhone: job.callToHrPhone ?? job.employer.contactPhone ?? "",
    status: job.status,
  })

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch("/api/cities").then(r => r.json()),
    ]).then(([cats, citiesData]) => {
      setCategories(Array.isArray(cats) ? cats : [])
      setCities(Array.isArray(citiesData) ? citiesData : [])
      setLoading(false)
    })
  }, [])

  const areas = areasForCity(form.citySlug)

  function set(field: string, value: string | boolean) {
    setForm(f => field === "citySlug" ? { ...f, citySlug: value as string, area: "" } : { ...f, [field]: value })
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")

    const res = await fetch(`/api/admin/jobs/${job.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        requirements: form.requirements.split("\n").map(s => s.trim()).filter(Boolean),
        perks: form.perks.split("\n").map(s => s.trim()).filter(Boolean),
      }),
    })

    setSaving(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Failed to save changes")
      return
    }
    setSaved(true)
    setTimeout(() => { onSaved() }, 800)
  }

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a3461] focus:ring-1 focus:ring-[#1a3461]/20"
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1"
  const sectionCls = "border border-gray-200 rounded-xl p-4 space-y-3"

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-6 px-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Edit Job</h2>
            <p className="text-xs text-gray-500 mt-0.5">{job.employer.companyName} · {job.city.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="px-6 py-5 space-y-5">

            {/* Status + Featured */}
            <div className={sectionCls}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Admin Controls</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Status</label>
                  <select value={form.status} onChange={e => set("status", e.target.value)} className={inputCls}>
                    {JOB_STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s === "PENDING_REVIEW" ? "Pending Review" : s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Job Type</label>
                  <select value={form.jobType} onChange={e => set("jobType", e.target.value)} className={inputCls}>
                    {JOB_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Core fields */}
            <div className={sectionCls}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Job Details</p>
              <div>
                <label className={labelCls}>Job Title *</label>
                <input value={form.title} onChange={e => set("title", e.target.value)} required className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Category *</label>
                  <select value={form.categorySlug} onChange={e => set("categorySlug", e.target.value)} required className={inputCls}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.nameEn}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>City *</label>
                  <select value={form.citySlug} onChange={e => set("citySlug", e.target.value)} required className={inputCls}>
                    <option value="">Select city</option>
                    {cities.map(c => <option key={c.slug} value={c.slug}>{c.name}{c.stateName ? `, ${c.stateName}` : ""}</option>)}
                  </select>
                </div>
              </div>
              {areas.length > 0 && (
                <div>
                  <label className={labelCls}>Area (optional)</label>
                  <select value={form.area} onChange={e => set("area", e.target.value)} className={inputCls}>
                    <option value="">No specific area</option>
                    {areas.map(a => <option key={a.slug} value={a.slug}>{a.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelCls}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={e => set("description", e.target.value)}
                  required
                  rows={5}
                  className={inputCls + " resize-y"}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Requirements (one per line)</label>
                  <textarea
                    value={form.requirements}
                    onChange={e => set("requirements", e.target.value)}
                    rows={4}
                    placeholder="Own bike&#10;Valid driving licence"
                    className={inputCls + " resize-y"}
                  />
                </div>
                <div>
                  <label className={labelCls}>Perks (one per line)</label>
                  <textarea
                    value={form.perks}
                    onChange={e => set("perks", e.target.value)}
                    rows={4}
                    placeholder="PF & ESI&#10;Weekly payout"
                    className={inputCls + " resize-y"}
                  />
                </div>
              </div>
            </div>

            {/* Salary + Logistics */}
            <div className={sectionCls}>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Salary & Requirements</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Salary Min (₹)</label>
                  <input type="number" value={form.salaryMin} onChange={e => set("salaryMin", e.target.value)} placeholder="8000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Salary Max (₹)</label>
                  <input type="number" value={form.salaryMax} onChange={e => set("salaryMax", e.target.value)} placeholder="15000" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Unit</label>
                  <select value={form.salaryUnit} onChange={e => set("salaryUnit", e.target.value)} className={inputCls}>
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Vacancies</label>
                  <input type="number" min="1" value={form.vacancies} onChange={e => set("vacancies", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Experience (yrs)</label>
                  <input type="number" min="0" value={form.experienceMin} onChange={e => set("experienceMin", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Qualification</label>
                  <input value={form.qualificationRequired} onChange={e => set("qualificationRequired", e.target.value)} placeholder="10th pass" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Working Days/Week</label>
                  <input type="number" min="1" max="7" value={form.workingDaysPerWeek} onChange={e => set("workingDaysPerWeek", e.target.value)} placeholder="6" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Shift Type</label>
                  <select value={form.shiftType} onChange={e => set("shiftType", e.target.value)} className={inputCls}>
                    <option value="">Not specified</option>
                    {SHIFT_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Pincode</label>
                  <input value={form.pincode} onChange={e => set("pincode", e.target.value)} placeholder="110001" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Incentives</label>
                <input value={form.incentives} onChange={e => set("incentives", e.target.value)} placeholder="₹2,000/month performance bonus" className={inputCls} />
              </div>
            </div>

            {/* Call HR */}
            <div className={sectionCls}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Call HR Button</p>
                  <p className="text-xs text-gray-400 mt-0.5">Candidates see a "Call HR" button on this job listing</p>
                </div>
                <button
                  type="button"
                  onClick={() => set("callToHrEnabled", !form.callToHrEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    form.callToHrEnabled
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {form.callToHrEnabled ? <Phone size={14} /> : <PhoneOff size={14} />}
                  {form.callToHrEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>
              {form.callToHrEnabled && (
                <div>
                  <label className={labelCls}>HR Phone Number *</label>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#1a3461] focus-within:ring-1 focus-within:ring-[#1a3461]/20">
                    <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">+91</span>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={form.callToHrPhone.replace(/^\+91/, "")}
                      onChange={e => set("callToHrPhone", e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
                      required={form.callToHrEnabled}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">This number will be visible to job seekers on this listing</p>
                </div>
              )}
            </div>

            {/* Error + Save */}
            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3 pt-1 pb-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || saved}
                className="flex-1 py-2.5 bg-[#1a3461] text-white rounded-xl text-sm font-semibold hover:bg-[#142a52] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saved ? (
                  <><CheckCircle size={15} /> Saved!</>
                ) : saving ? (
                  <><Loader2 size={15} className="animate-spin" /> Saving...</>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
