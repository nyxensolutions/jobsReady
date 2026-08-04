"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  CheckCircle, ChevronRight, Plus, X, Minus, Loader2, MapPin, Briefcase, IndianRupee,
} from "lucide-react"

type Category = { id: string; slug: string; nameEn: string }
type City = { id: string; slug: string; name: string; stateName: string }

type WizardData = {
  // Step 1
  title: string
  categorySlug: string
  citySlug: string
  vacancies: number
  jobType: string
  // Step 2
  salaryMin: string
  salaryMax: string
  salaryUnit: string
  benefits: string[]
  shift: string
  // Step 3
  gender: string
  qualification: string
  experienceMin: string
  experienceMax: string
  freshersOnly: boolean
  skills: string[]
  // Step 4
  description: string
  // Extra
  requirements: string[]
  perks: string[]
  pincode: string
}

const INITIAL: WizardData = {
  title: "", categorySlug: "", citySlug: "", vacancies: 1, jobType: "FULL_TIME",
  salaryMin: "", salaryMax: "", salaryUnit: "monthly", benefits: [], shift: "",
  gender: "Any", qualification: "Any", experienceMin: "0", experienceMax: "",
  freshersOnly: false, skills: [], description: "",
  requirements: [], perks: [], pincode: "",
}

const JOB_TITLE_CHIPS = ["Delivery Boy", "Driver", "Security Guard", "Picker / Packer", "Telecaller", "Data Entry"]
const VACANCY_CHIPS = [1, 2, 5, 10, 25, 50]
const JOB_TYPES: { value: string; label: string }[] = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "GIG", label: "Gig / Daily Wage" },
]
const BENEFIT_CHIPS = ["Meal", "Insurance", "PF", "Medical Benefits"]
const SHIFT_CHIPS = ["Day", "Night", "Rotational", "Flexible"]
const GENDER_CHIPS = ["Any", "Male", "Female"]
const QUAL_CHIPS = [
  { value: "Any", label: "Any" },
  { value: "10th", label: "10th Pass" },
  { value: "12th", label: "12th Pass" },
  { value: "graduate", label: "Graduate" },
]
const EXP_OPTIONS = [
  { value: "0", label: "Fresher" },
  { value: "6m", label: "6 months" },
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "5", label: "5 years" },
  { value: "10", label: "10+ years" },
]

const STEP_LABELS = ["Basic Info", "Job Details", "Candidate Info", "Job Description", "Confirmation"]

// ── Preview Panel ──────────────────────────────────────────────
function PreviewPanel({
  data,
  companyName,
  selectedCity,
  selectedCategory,
}: {
  data: WizardData
  companyName: string
  selectedCity?: City
  selectedCategory?: Category
}) {
  const salary = () => {
    if (data.salaryMin && data.salaryMax) return `₹${Number(data.salaryMin).toLocaleString()} – ₹${Number(data.salaryMax).toLocaleString()}/mo`
    if (data.salaryMin) return `₹${Number(data.salaryMin).toLocaleString()}/mo`
    return "Salary per month"
  }
  const highlights = [
    data.qualification !== "Any" ? `${data.qualification} Pass` : "All Education levels",
    data.gender !== "Any" ? `Only ${data.gender}` : null,
    data.shift ? `${data.shift} Shift` : null,
    data.experienceMin === "0" || data.freshersOnly ? "Freshers OK" : `${data.experienceMin}+ yrs exp`,
    ...data.benefits,
  ].filter(Boolean) as string[]

  return (
    <div className="p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Job Preview</p>
      <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm">
        {/* Title + salary */}
        <p className={`font-bold text-base ${data.title ? "text-gray-900" : "text-gray-300"}`}>
          {data.title || "Job Title"}
        </p>
        <p className={`text-sm mt-0.5 ${data.salaryMin ? "text-gray-500" : "text-gray-300"}`}>{salary()}</p>

        {/* Company / Location / Experience */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Briefcase size={10} />{companyName || "Company"}</span>
          <span className="flex items-center gap-1"><MapPin size={10} />{selectedCity?.name || "Location"}</span>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-700 mb-1.5">Job Highlights</p>
            <div className="flex flex-col gap-1">
              {highlights.map((h) => (
                <div key={h} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle size={11} className="text-green-500 shrink-0" />
                  {h}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-700 mb-1.5">Skills Required</p>
            <div className="flex flex-wrap gap-1">
              {data.skills.map((s) => (
                <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {data.description && (
          <div className="mt-3">
            <p className="text-xs font-bold text-gray-700 mb-1">Job Description</p>
            <p className="text-xs text-gray-500 line-clamp-4 whitespace-pre-line">{data.description}</p>
          </div>
        )}

        {/* Other details */}
        {(data.benefits.length > 0 || data.shift) && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs font-bold text-gray-700 mb-1.5">Other Details</p>
            {data.benefits.length > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Job Benefits</span>
                <span className="text-gray-600">{data.benefits.join(", ")}</span>
              </div>
            )}
            {data.shift && (
              <div className="flex justify-between text-xs mt-0.5">
                <span className="text-gray-400">Shift</span>
                <span className="text-gray-600">{data.shift}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Chip Button ────────────────────────────────────────────────
function Chip({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
        active
          ? "border-[#1a3461] bg-[#1a3461]/5 text-[#1a3461]"
          : "border-gray-300 text-gray-600 hover:border-gray-400 bg-white"
      }`}
    >
      {label}
    </button>
  )
}

// ── Tag Input (add items by typing) ───────────────────────────
function TagInput({
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
    if (v && !items.includes(v)) { onAdd(v); setInput("") }
  }
  return (
    <div className="flex flex-col gap-2">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-sm bg-[#1a3461]/10 text-[#1a3461] px-3 py-1 rounded-full">
              {item}
              <button type="button" onClick={() => onRemove(i)} className="opacity-60 hover:opacity-100">
                <X size={12} />
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
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461]/40 focus:border-[#1a3461]"
        />
        <button
          type="button"
          onClick={add}
          className="px-3 border border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

const label = "block text-sm font-medium text-gray-700 mb-1.5"
const input = "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461]/40 focus:border-[#1a3461]"

// ── Step 1: Basic Info ─────────────────────────────────────────
function Step1({
  data,
  update,
  categories,
  cities,
}: {
  data: WizardData
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
  categories: Category[]
  cities: City[]
}) {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl">
      {/* Job Title */}
      <div>
        <label className={label}>Job Title <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Select or type your job title..."
          className={input}
          autoFocus
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {JOB_TITLE_CHIPS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => update("title", t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                data.title === t
                  ? "border-[#1a3461] bg-[#1a3461]/5 text-[#1a3461]"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className={label}>Job Category <span className="text-red-500">*</span></label>
        <select
          value={data.categorySlug}
          onChange={(e) => update("categorySlug", e.target.value)}
          className={input + " bg-white text-gray-700"}
        >
          <option value="">Select or type your job category...</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.nameEn}</option>
          ))}
        </select>
      </div>

      {/* Vacancy */}
      <div>
        <label className={label}>Vacancy <span className="text-red-500">*</span></label>
        <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1a3461]/40 focus-within:border-[#1a3461] w-48">
          <button
            type="button"
            onClick={() => update("vacancies", Math.max(1, data.vacancies - 1))}
            className="px-3 py-3 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Minus size={16} />
          </button>
          <input
            type="number"
            min={1}
            max={999}
            value={data.vacancies}
            onChange={(e) => update("vacancies", parseInt(e.target.value) || 1)}
            className="flex-1 text-center py-3 text-sm outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => update("vacancies", data.vacancies + 1)}
            className="px-3 py-3 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-2">
          {VACANCY_CHIPS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update("vacancies", n)}
              className={`w-10 h-9 rounded-xl border text-sm font-medium transition-colors ${
                data.vacancies === n
                  ? "border-[#1a3461] bg-[#1a3461]/5 text-[#1a3461]"
                  : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {String(n).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div>
        <label className={label}>What type of job is this? <span className="text-red-500">*</span></label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map((t) => (
            <Chip
              key={t.value}
              label={t.label}
              active={data.jobType === t.value}
              onClick={() => update("jobType", t.value)}
            />
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <label className={label}>Choose City <span className="text-red-500">*</span></label>
        <select
          value={data.citySlug}
          onChange={(e) => update("citySlug", e.target.value)}
          className={input + " bg-white text-gray-700"}
        >
          <option value="">Select or type your city...</option>
          {cities.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}, {c.stateName}</option>
          ))}
        </select>
      </div>
    </div>
  )
}

// ── Step 2: Job Details ────────────────────────────────────────
function Step2({
  data,
  update,
}: {
  data: WizardData
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  function toggleBenefit(b: string) {
    update(
      "benefits",
      data.benefits.includes(b) ? data.benefits.filter((x) => x !== b) : [...data.benefits, b]
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl">
      {/* Salary */}
      <div>
        <label className={label}>Salary per month</label>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1a3461]/40 flex-1">
            <span className="px-3 py-3 text-gray-500 text-sm shrink-0"><IndianRupee size={14} /></span>
            <input
              type="number"
              min={0}
              value={data.salaryMin}
              onChange={(e) => update("salaryMin", e.target.value)}
              placeholder="e.g. 10,000"
              className="flex-1 py-3 text-sm outline-none bg-transparent"
            />
          </div>
          <span className="text-gray-400 text-sm shrink-0">To</span>
          <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1a3461]/40 flex-1">
            <span className="px-3 py-3 text-gray-500 text-sm shrink-0"><IndianRupee size={14} /></span>
            <input
              type="number"
              min={0}
              value={data.salaryMax}
              onChange={(e) => update("salaryMax", e.target.value)}
              placeholder="e.g. 50,000"
              className="flex-1 py-3 text-sm outline-none bg-transparent"
            />
          </div>
        </div>
        {/* Salary breakdown */}
        {(data.salaryMin || data.salaryMax) && (
          <div className="mt-3 border border-gray-200 rounded-xl p-3 text-xs text-gray-500">
            <div className="flex justify-between py-1">
              <span>Fixed Salary</span>
              <span className="font-medium text-gray-700">
                ₹{Number(data.salaryMin || 0).toLocaleString()} – ₹{Number(data.salaryMax || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between py-1 border-t border-gray-100 font-semibold text-gray-700">
              <span>Total Salary</span>
              <span>₹{Number(data.salaryMin || 0).toLocaleString()} – ₹{Number(data.salaryMax || 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Benefits */}
      <div>
        <label className={label}>Job Benefits <span className="text-xs text-gray-400 font-normal">(optional)</span></label>
        <div className="flex flex-wrap gap-2">
          {BENEFIT_CHIPS.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => toggleBenefit(b)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                data.benefits.includes(b)
                  ? "border-[#1a3461] bg-[#1a3461]/5 text-[#1a3461]"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              {data.benefits.includes(b) ? <CheckCircle size={13} /> : <Plus size={13} />}
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Shifts */}
      <div>
        <label className={label}>Shifts</label>
        <div className="flex flex-wrap gap-2">
          {SHIFT_CHIPS.map((s) => (
            <Chip
              key={s}
              label={s}
              active={data.shift === s}
              onClick={() => update("shift", data.shift === s ? "" : s)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Candidate Info ─────────────────────────────────────
function Step3({
  data,
  update,
}: {
  data: WizardData
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl">
      {/* Gender */}
      <div>
        <label className={label}>Gender</label>
        <div className="flex flex-wrap gap-2">
          {GENDER_CHIPS.map((g) => (
            <Chip key={g} label={g} active={data.gender === g} onClick={() => update("gender", g)} />
          ))}
        </div>
      </div>

      {/* Qualification */}
      <div>
        <label className={label}>Qualification</label>
        <div className="flex flex-wrap gap-2">
          {QUAL_CHIPS.map((q) => (
            <Chip key={q.value} label={q.label} active={data.qualification === q.value} onClick={() => update("qualification", q.value)} />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <label className={label}>Required Experience</label>
        <div className="flex items-center gap-3">
          <select
            value={data.experienceMin}
            onChange={(e) => update("experienceMin", e.target.value)}
            className={input + " bg-white text-gray-700 flex-1"}
          >
            <option value="">Min exp.</option>
            {EXP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="text-gray-400 text-sm shrink-0">to</span>
          <select
            value={data.experienceMax}
            onChange={(e) => update("experienceMax", e.target.value)}
            className={input + " bg-white text-gray-700 flex-1"}
          >
            <option value="">Max exp.</option>
            {EXP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 mt-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={data.freshersOnly}
            onChange={(e) => update("freshersOnly", e.target.checked)}
            className="rounded"
          />
          Only freshers should apply/call
        </label>
      </div>

      {/* Skills */}
      <div>
        <label className={label}>Skills <span className="text-xs text-gray-400 font-normal">(optional)</span></label>
        <TagInput
          items={data.skills}
          onAdd={(v) => update("skills", [...data.skills, v])}
          onRemove={(i) => update("skills", data.skills.filter((_, idx) => idx !== i))}
          placeholder="+ Add a skill (e.g. Two-Wheeler Driving)"
        />
      </div>
    </div>
  )
}

// ── Step 4: Description ────────────────────────────────────────
const TEMPLATE = (title: string, salaryMin: string, salaryMax: string) =>
  `We are looking for a ${title || "candidate"} to join our team.\n\nKey Responsibilities:\n• ${title ? "Perform " + title.toLowerCase() + " duties efficiently" : "Perform duties as assigned"}\n• Maintain quality and timely delivery\n• Follow company guidelines and policies\n\nJob Requirements:\n• ${salaryMin && salaryMax ? `Salary ₹${salaryMin} – ₹${salaryMax}/month` : "Competitive salary"}\n• Good communication skills\n• Honest and punctual`

function Step4({
  data,
  update,
}: {
  data: WizardData
  update: <K extends keyof WizardData>(k: K, v: WizardData[K]) => void
}) {
  const [showTemplate, setShowTemplate] = useState(true)
  const template = TEMPLATE(data.title, data.salaryMin, data.salaryMax)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-xl">
      {/* Suggested template */}
      {showTemplate && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <span className="text-sm font-medium text-gray-700">Suggested Template</span>
            <button
              type="button"
              onClick={() => { update("description", template); setShowTemplate(false) }}
              className="text-xs font-bold text-[#1a3461] border border-[#1a3461]/30 px-3 py-1 rounded-lg hover:bg-[#1a3461]/5 transition-colors"
            >
              Apply
            </button>
          </div>
          <div className="px-4 py-3 text-xs text-gray-500 whitespace-pre-line max-h-28 overflow-y-auto">{template}</div>
        </div>
      )}

      {/* Description textarea */}
      <div>
        <label className={label}>Job Description <span className="text-red-500">*</span></label>
        <textarea
          value={data.description}
          onChange={(e) => update("description", e.target.value)}
          rows={10}
          placeholder="Start writing your job description here or apply the suggested template above..."
          className={input + " resize-y font-mono text-xs leading-relaxed"}
        />
        <p className="text-xs text-gray-400 mt-1">{data.description.length} characters</p>
      </div>
    </div>
  )
}

// ── Step 5: Confirmation ───────────────────────────────────────
function Step5({
  data,
  selectedCity,
  selectedCategory,
  onEdit,
  companyName,
  contactPhone,
}: {
  data: WizardData
  selectedCity?: City
  selectedCategory?: Category
  onEdit: (step: number) => void
  companyName: string
  contactPhone: string
}) {
  const JOB_TYPE_LABELS: Record<string, string> = {
    FULL_TIME: "Full-Time", PART_TIME: "Part-Time", CONTRACT: "Contract", GIG: "Gig / Daily Wage",
  }

  return (
    <div className="flex flex-col gap-4 p-6 max-w-xl">
      {/* Basic Info */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="font-semibold text-gray-800 text-sm">Basic Info</span>
          <button onClick={() => onEdit(1)} className="text-xs text-[#1a3461] font-medium flex items-center gap-1 hover:underline">
            ✏ Edit
          </button>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gray-400 text-xs">Job Title</span><p className="font-medium text-gray-800">{data.title || "—"}</p></div>
          <div><span className="text-gray-400 text-xs">Number of Vacancies</span><p className="font-medium text-gray-800">{data.vacancies}</p></div>
          <div><span className="text-gray-400 text-xs">City</span><p className="font-medium text-gray-800">{selectedCity?.name || "—"}</p></div>
          <div><span className="text-gray-400 text-xs">Job Type</span><p className="font-medium text-gray-800">{JOB_TYPE_LABELS[data.jobType] || data.jobType}</p></div>
          <div><span className="text-gray-400 text-xs">Communication</span><p className="font-medium text-gray-800">{contactPhone || "—"}</p></div>
        </div>
      </div>

      {/* Job Details */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="font-semibold text-gray-800 text-sm">Job Details</span>
          <button onClick={() => onEdit(2)} className="text-xs text-[#1a3461] font-medium flex items-center gap-1 hover:underline">
            ✏ Edit
          </button>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-gray-400 text-xs">Salary</span>
            <p className="font-medium text-gray-800">
              {data.salaryMin && data.salaryMax
                ? `₹${Number(data.salaryMin).toLocaleString()} – ₹${Number(data.salaryMax).toLocaleString()}`
                : data.salaryMin ? `From ₹${Number(data.salaryMin).toLocaleString()}` : "Not specified"}
            </p>
          </div>
          <div><span className="text-gray-400 text-xs">Job Benefits</span><p className="font-medium text-gray-800">{data.benefits.join(", ") || "—"}</p></div>
          <div><span className="text-gray-400 text-xs">Shift Type</span><p className="font-medium text-gray-800">{data.shift || "—"}</p></div>
        </div>
      </div>

      {/* Candidate Details */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
          <span className="font-semibold text-gray-800 text-sm">Candidate Details</span>
          <button onClick={() => onEdit(3)} className="text-xs text-[#1a3461] font-medium flex items-center gap-1 hover:underline">
            ✏ Edit
          </button>
        </div>
        <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div><span className="text-gray-400 text-xs">Gender</span><p className="font-medium text-gray-800">{data.gender === "Any" ? "Any" : `Only ${data.gender}`}</p></div>
          <div><span className="text-gray-400 text-xs">Qualification</span><p className="font-medium text-gray-800">{data.qualification === "Any" ? "Any" : data.qualification + " Pass"}</p></div>
          <div>
            <span className="text-gray-400 text-xs">Experience</span>
            <p className="font-medium text-gray-800">
              {data.freshersOnly ? "Freshers only" : data.experienceMin && data.experienceMax ? `${data.experienceMin} – ${data.experienceMax} yrs` : data.experienceMin ? `${data.experienceMin}+ yrs` : "Any"}
            </p>
          </div>
          <div><span className="text-gray-400 text-xs">Skills</span><p className="font-medium text-gray-800">{data.skills.join(", ") || "—"}</p></div>
          <div><span className="text-gray-400 text-xs">Category</span><p className="font-medium text-gray-800">{selectedCategory?.nameEn || "—"}</p></div>
        </div>
      </div>
    </div>
  )
}

// ── Main Wizard ────────────────────────────────────────────────
export default function PostJobWizard({
  categories,
  cities,
  companyName,
  contactPhone,
}: {
  categories: Category[]
  cities: City[]
  companyName: string
  contactPhone: string
}) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submittedJobId, setSubmittedJobId] = useState<string | null>(null)

  const selectedCity = cities.find((c) => c.slug === data.citySlug)
  const selectedCategory = categories.find((c) => c.slug === data.categorySlug)

  function update<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function validateStep(s: number): string {
    if (s === 1) {
      if (!data.title.trim()) return "Please enter a job title."
      if (!data.categorySlug) return "Please select a job category."
      if (!data.citySlug) return "Please select a city."
    }
    if (s === 4) {
      if (!data.description.trim()) return "Please write a job description."
    }
    return ""
  }

  function goNext() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError("")
    setStep((s) => Math.min(s + 1, 5))
    window.scrollTo(0, 0)
  }

  function goBack() {
    setError("")
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo(0, 0)
  }

  async function handleSubmit() {
    const err = validateStep(step)
    if (err) { setError(err); return }
    setError("")
    setLoading(true)

    const requirements = [
      data.gender !== "Any" ? `${data.gender} candidates preferred` : null,
      data.freshersOnly ? "Freshers only" : null,
      ...data.skills,
      ...data.requirements,
    ].filter(Boolean) as string[]

    const perks = [
      ...data.benefits,
      data.shift ? `${data.shift} Shift` : null,
      ...data.perks,
    ].filter(Boolean) as string[]

    try {
      const res = await fetch("/api/employer/post-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title.trim(),
          categorySlug: data.categorySlug,
          citySlug: data.citySlug,
          jobType: data.jobType,
          salaryMin: data.salaryMin || null,
          salaryMax: data.salaryMax || null,
          salaryUnit: data.salaryUnit,
          vacancies: data.vacancies,
          experienceMin: data.experienceMin || "0",
          qualificationRequired: data.qualification !== "Any" ? data.qualification : null,
          description: data.description.trim(),
          requirements,
          perks,
          pincode: data.pincode,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error ?? "Failed to post job")
      setSubmittedJobId(result.jobId)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (submittedJobId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Job submitted for review!</h2>
          <p className="text-gray-500 text-sm mb-7 max-w-xs mx-auto">
            Our team will review your posting and it will go live within a few hours.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/employer/dashboard")}
              className="w-full py-3 bg-[#1a3461] text-white font-semibold rounded-xl text-sm hover:bg-[#142a52] transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => { setSubmittedJobId(null); setData(INITIAL); setStep(1) }}
              className="w-full py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Post Another Job
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Step indicator */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto">
          {STEP_LABELS.map((label, i) => {
            const s = i + 1
            const isActive = s === step
            const isDone = s < step
            return (
              <button
                key={s}
                type="button"
                onClick={() => s < step && setStep(s)}
                className={`flex-1 min-w-[120px] flex flex-col items-center py-3 px-2 text-xs font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-[#1a3461] text-[#1a3461]"
                    : isDone
                    ? "border-green-500 text-green-600 cursor-pointer"
                    : "border-transparent text-gray-400"
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mb-0.5 ${
                  isActive ? "bg-[#1a3461] text-white" : isDone ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                  {isDone ? <CheckCircle size={14} /> : s}
                </span>
                <span className="hidden sm:block">{label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1">
        {/* Form */}
        <div className="flex-1 overflow-y-auto pb-28 md:pb-20">
          {step === 1 && <Step1 data={data} update={update} categories={categories} cities={cities} />}
          {step === 2 && <Step2 data={data} update={update} />}
          {step === 3 && <Step3 data={data} update={update} />}
          {step === 4 && <Step4 data={data} update={update} />}
          {step === 5 && (
            <Step5
              data={data}
              selectedCity={selectedCity}
              selectedCategory={selectedCategory}
              onEdit={(s) => setStep(s)}
              companyName={companyName}
              contactPhone={contactPhone}
            />
          )}

          {error && (
            <div className="mx-6 mt-2 mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 max-w-xl">
              {error}
            </div>
          )}
        </div>

        {/* Preview panel - desktop */}
        <div className="hidden lg:block w-80 xl:w-96 bg-white border-l border-gray-200 overflow-y-auto sticky top-[57px] h-[calc(100vh-57px)]">
          <PreviewPanel
            data={data}
            companyName={companyName}
            selectedCity={selectedCity}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>

      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3 z-10">
        {step > 1 ? (
          <button
            onClick={goBack}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            onClick={goNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a3461] text-white rounded-xl text-sm font-bold hover:bg-[#142a52] transition-colors"
          >
            Save & Continue
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1a3461] text-white rounded-xl text-sm font-bold hover:bg-[#142a52] transition-colors disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Post this job
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
