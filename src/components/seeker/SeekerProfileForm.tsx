"use client"

import { useState, useRef } from "react"
import { useRouter } from "@/i18n/navigation"
import { Loader2, CheckCircle, Plus, X, Camera, FileText, Trash2 } from "lucide-react"
import Image from "next/image"

const JOB_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "GIG", label: "Gig / Daily wage" },
  { value: "WALK_IN", label: "Walk-in Interview" },
]

type Initial = {
  name: string
  city: string
  bio: string
  skills: string[]
  preferredJobTypes: string[]
  experienceYears: number
  isOpenToWork: boolean
  photoUrl: string | null
  resumeUrl: string | null
} | null

export default function SeekerProfileForm({
  initial,
  cities,
}: {
  initial: Initial
  cities: string[]
}) {
  const router = useRouter()
  const [name, setName] = useState(initial?.name ?? "")
  const [city, setCity] = useState(initial?.city ?? "")
  const [bio, setBio] = useState(initial?.bio ?? "")
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? [])
  const [skillInput, setSkillInput] = useState("")
  const [preferredJobTypes, setPreferredJobTypes] = useState<string[]>(initial?.preferredJobTypes ?? [])
  const [experienceYears, setExperienceYears] = useState(String(initial?.experienceYears ?? 0))
  const [isOpenToWork, setIsOpenToWork] = useState(initial?.isOpenToWork ?? true)
  const [photoUrl, setPhotoUrl] = useState<string | null>(initial?.photoUrl ?? null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photoUrl ?? null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [resumeUrl, setResumeUrl] = useState<string | null>(initial?.resumeUrl ?? null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeError, setResumeError] = useState("")
  const resumeInputRef = useRef<HTMLInputElement>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeError("")
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowed.includes(file.type)) { setResumeError("Only PDF or Word files allowed"); return }
    if (file.size > 5 * 1024 * 1024) { setResumeError("File must be under 5 MB"); return }
    setResumeUploading(true)
    try {
      const fd = new FormData()
      fd.append("resume", file)
      const res = await fetch("/api/seeker/resume", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Upload failed")
      setResumeUrl(json.resumeUrl)
    } catch (err: any) {
      setResumeError(err.message)
    } finally {
      setResumeUploading(false)
    }
  }

  async function handleDeleteAccount() {
    if (!deleteConfirm) { setDeleteConfirm(true); return }
    setDeleting(true)
    try {
      await fetch("/api/user/delete", { method: "DELETE" })
      router.push("/")
    } finally {
      setDeleting(false)
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError("")
    if (!file.type.startsWith("image/")) { setPhotoError("Only image files are allowed"); return }
    if (file.size > 2 * 1024 * 1024) { setPhotoError("Photo must be under 2 MB"); return }

    setPhotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      const res = await fetch("/api/seeker/photo", { method: "POST", body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Upload failed")
      setPhotoUrl(json.photoUrl)
    } catch (err: any) {
      setPhotoError(err.message)
      setPhotoPreview(initial?.photoUrl ?? null)
    } finally {
      setPhotoUploading(false)
    }
  }

  function addSkill() {
    const v = skillInput.trim()
    if (v && !skills.includes(v)) {
      setSkills((s) => [...s, v])
      setSkillInput("")
    }
  }

  function toggleJobType(val: string) {
    setPreferredJobTypes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaved(false)
    if (!name.trim()) { setError("Name is required"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/seeker/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, city, bio, skills, preferredJobTypes, experienceYears, isOpenToWork }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
      setSaved(true)
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-3">
        <div
          className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
          onClick={() => photoInputRef.current?.click()}
        >
          {photoPreview ? (
            <Image src={photoPreview} alt="Profile photo" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-1 text-gray-400">
              <Camera size={24} />
              <span className="text-[10px] font-medium">Add photo</span>
            </div>
          )}
          {photoUploading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <Loader2 size={20} className="animate-spin text-blue-600" />
            </div>
          )}
        </div>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="text-xs text-blue-600 font-medium hover:underline"
        >
          {photoPreview ? "Change photo" : "Upload photo"}
        </button>
        {photoError && <p className="text-xs text-red-500">{photoError}</p>}
      </div>

      {/* Name */}
      <div>
        <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ravi Kumar"
          className={inputCls}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label className={labelCls}>City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className={inputCls + " bg-white text-gray-700"}>
            <option value="">Select city</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Experience */}
        <div>
          <label className={labelCls}>Work Experience</label>
          <select value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} className={inputCls + " bg-white text-gray-700"}>
            <option value="0">Fresher (0 years)</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="5">5+ years</option>
            <option value="10">10+ years</option>
          </select>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className={labelCls}>About Yourself <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          placeholder="Brief intro — e.g. 3 years experience as delivery executive, own a bike..."
          className={inputCls + " resize-y"}
        />
      </div>

      {/* Skills */}
      <div>
        <label className={labelCls}>Skills <span className="text-gray-400 text-xs font-normal">(add one at a time)</span></label>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">
                {s}
                <button type="button" onClick={() => setSkills((p) => p.filter((x) => x !== s))}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill() } }}
            placeholder="e.g. Driving, MS Excel, Hindi"
            className={inputCls}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Preferred job types */}
      <div>
        <label className={labelCls}>Preferred Job Types <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
        <div className="flex flex-wrap gap-2">
          {JOB_TYPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => toggleJobType(value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                preferredJobTypes.includes(value)
                  ? "bg-blue-700 text-white border-blue-700"
                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Open to work toggle */}
      <div className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${isOpenToWork ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
        <div>
          <p className="text-sm font-semibold text-gray-800">Open to work</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {isOpenToWork ? "Employers can find and contact you" : "Hidden from employer search"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsOpenToWork((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors ${isOpenToWork ? "bg-green-500" : "bg-gray-300"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isOpenToWork ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {/* Resume upload */}
      <div>
        <label className={labelCls}>Resume <span className="text-gray-400 text-xs font-normal">(PDF or Word, max 5 MB)</span></label>
        {resumeUrl ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <FileText size={18} className="text-green-600 shrink-0" />
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sm text-green-700 font-medium hover:underline flex-1 truncate">View uploaded resume</a>
            <button type="button" onClick={() => resumeInputRef.current?.click()} className="text-xs text-blue-600 hover:underline shrink-0">Replace</button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => resumeInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {resumeUploading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            {resumeUploading ? "Uploading..." : "Upload Resume"}
          </button>
        )}
        <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeChange} />
        {resumeError && <p className="text-xs text-red-500 mt-1">{resumeError}</p>}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {saved && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl">
          <CheckCircle size={16} />
          Profile saved successfully!
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-blue-700 text-white font-bold text-sm hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        Save Profile
      </button>

      {/* Account deletion */}
      <div className="border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={deleting}
          className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl border transition-colors ${
            deleteConfirm ? "bg-red-600 text-white border-red-600" : "text-red-500 border-red-200 hover:bg-red-50"
          }`}
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {deleteConfirm ? "Are you sure? Click to confirm" : "Delete my account"}
        </button>
        {deleteConfirm && (
          <p className="text-xs text-red-400 mt-1 ml-1">This will permanently delete your account and all data.</p>
        )}
      </div>
    </form>
  )
}
