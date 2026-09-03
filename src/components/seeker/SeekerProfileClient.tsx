"use client"

import { useState, useRef } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"
import {
  Camera, FileText, Loader2, CheckCircle, X, Plus,
  Pencil, MapPin, Phone, Briefcase, Trash2
} from "lucide-react"

type Profile = {
  name: string
  city: string
  bio: string
  skills: string[]
  preferredJobTypes: string[]
  experienceYears: number
  isOpenToWork: boolean
  openToRelocate: boolean
  preferredCities: string[]
  languages: string[]
  photoUrl: string | null
  resumeUrl: string | null
}

type Props = {
  initial: Profile | null
  phone: string | null
  cities: string[]
}

function maskPhone(phone: string | null) {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "").slice(-10)
  if (digits.length < 6) return phone
  return digits.slice(0, 3) + "*".repeat(4) + digits.slice(-3)
}

export default function SeekerProfileClient({ initial, phone, cities }: Props) {
  const router = useRouter()
  const t = useTranslations("seeker.profile")
  const tc = useTranslations("common")
  const tt = useTranslations("jobs.types")

  const JOB_TYPES = [
    { value: "FULL_TIME",  label: (() => { try { return tt("FULL_TIME") } catch { return "Full Time" } })() },
    { value: "PART_TIME",  label: (() => { try { return tt("PART_TIME") } catch { return "Part Time" } })() },
    { value: "CONTRACT",   label: (() => { try { return tt("CONTRACT") } catch { return "Contract" } })() },
    { value: "GIG",        label: (() => { try { return tt("GIG") } catch { return "Gig / Daily wage" } })() },
    { value: "WALK_IN",    label: (() => { try { return tt("WALK_IN" as any) } catch { return "Walk-in Interview" } })() },
  ]

  const COMMON_LANGUAGES = [
    "Hindi", "English", "Telugu", "Tamil", "Kannada", "Malayalam",
    "Bengali", "Marathi", "Gujarati", "Punjabi", "Odia", "Urdu",
  ]

  const isPhonePlaceholder = !initial?.name || /^\+?\d+$/.test(initial.name)
  const displayName = isPhonePlaceholder ? "" : initial!.name

  // Photo
  const [photoPreview, setPhotoPreview] = useState<string | null>(initial?.photoUrl ?? null)
  const [photoUploading, setPhotoUploading] = useState(false)
  const [photoError, setPhotoError] = useState("")
  const photoInputRef = useRef<HTMLInputElement>(null)

  // Resume
  const [resumeUrl, setResumeUrl] = useState<string | null>(initial?.resumeUrl ?? null)
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeError, setResumeError] = useState("")
  const resumeInputRef = useRef<HTMLInputElement>(null)

  // Section edit states
  const [editBasic, setEditBasic] = useState(false)
  const [editSkills, setEditSkills] = useState(false)
  const [editPrefs, setEditPrefs] = useState(false)

  // Basic info form
  const [name, setName] = useState(displayName)
  const [city, setCity] = useState(initial?.city ?? "")
  const [bio, setBio] = useState(initial?.bio ?? "")
  const [experienceYears, setExperienceYears] = useState(String(initial?.experienceYears ?? 0))
  const [basicLoading, setBasicLoading] = useState(false)
  const [basicSaved, setBasicSaved] = useState(false)

  // Skills form
  const [skills, setSkills] = useState<string[]>(initial?.skills ?? [])
  const [skillInput, setSkillInput] = useState("")
  const [skillsLoading, setSkillsLoading] = useState(false)

  // Preferences form
  const [preferredJobTypes, setPreferredJobTypes] = useState<string[]>(initial?.preferredJobTypes ?? [])
  const [isOpenToWork, setIsOpenToWork] = useState(initial?.isOpenToWork ?? true)
  const [prefsLoading, setPrefsLoading] = useState(false)

  // Location preference form
  const [editLocation, setEditLocation] = useState(false)
  const [openToRelocate, setOpenToRelocate] = useState(initial?.openToRelocate ?? true)
  const [preferredCities, setPreferredCities] = useState<string[]>(initial?.preferredCities ?? [])
  const [locationLoading, setLocationLoading] = useState(false)

  // Languages form
  const [editLanguages, setEditLanguages] = useState(false)
  const [languages, setLanguages] = useState<string[]>(initial?.languages ?? [])
  const [langInput, setLangInput] = useState("")
  const [languagesLoading, setLanguagesLoading] = useState(false)

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function saveSection(patch: Record<string, unknown>) {
    const res = await fetch("/api/seeker/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name || displayName,
        city, bio, skills, preferredJobTypes, experienceYears,
        isOpenToWork, openToRelocate, preferredCities, languages,
        ...patch,
      }),
    })
    if (!res.ok) throw new Error((await res.json()).error ?? "Save failed")
    router.refresh()
  }

  async function handleSaveBasic() {
    if (!name.trim()) return
    setBasicLoading(true)
    try {
      await saveSection({ name, city, bio, experienceYears })
      setBasicSaved(true)
      setEditBasic(false)
      setTimeout(() => setBasicSaved(false), 3000)
    } finally {
      setBasicLoading(false)
    }
  }

  async function handleSaveSkills() {
    setSkillsLoading(true)
    try {
      await saveSection({ skills })
      setEditSkills(false)
    } finally {
      setSkillsLoading(false)
    }
  }

  async function handleSavePrefs() {
    setPrefsLoading(true)
    try {
      await saveSection({ preferredJobTypes, isOpenToWork })
      setEditPrefs(false)
    } finally {
      setPrefsLoading(false)
    }
  }

  async function handleSaveLocation() {
    setLocationLoading(true)
    try {
      await saveSection({ openToRelocate, preferredCities })
      setEditLocation(false)
    } finally {
      setLocationLoading(false)
    }
  }

  async function handleSaveLanguages() {
    setLanguagesLoading(true)
    try {
      await saveSection({ languages })
      setEditLanguages(false)
    } finally {
      setLanguagesLoading(false)
    }
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError("")
    if (!file.type.startsWith("image/")) { setPhotoError(t("photoError")); return }
    if (file.size > 2 * 1024 * 1024) { setPhotoError(t("photoSizeError")); return }
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      const res = await fetch("/api/seeker/photo", { method: "POST", body: fd })
      if (!res.ok) {
        if (res.status === 413) throw new Error("File is too large (max 2MB)")
        let errStr = "Upload failed"
        try { const json = await res.json(); errStr = json.error ?? errStr } catch(e) {}
        throw new Error(errStr)
      }
      const json = await res.json()
      setPhotoPreview(json.photoUrl)
    } catch (err: any) {
      setPhotoError(err.message)
      setPhotoPreview(initial?.photoUrl ?? null)
    } finally {
      setPhotoUploading(false)
    }
  }

  async function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setResumeError("")
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    if (!allowed.includes(file.type)) { setResumeError(t("resumeTypeError")); return }
    if (file.size > 5 * 1024 * 1024) { setResumeError(t("resumeSizeError")); return }
    setResumeUploading(true)
    try {
      const fd = new FormData()
      fd.append("resume", file)
      const res = await fetch("/api/seeker/resume", { method: "POST", body: fd })
      if (!res.ok) {
        if (res.status === 413) throw new Error("File is too large (max 5MB)")
        let errStr = "Upload failed"
        try { const json = await res.json(); errStr = json.error ?? errStr } catch(e) {}
        throw new Error(errStr)
      }
      const json = await res.json()
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
      window.location.href = "/"
    } finally {
      setDeleting(false)
    }
  }

  // Completeness
  const completeness = [
    { label: t("completenessName"),   done: !!displayName || !!name },
    { label: t("completenessCity"),   done: !!city },
    { label: t("completenessSkills"), done: skills.length > 0 },
    { label: t("completenessResume"), done: !!resumeUrl },
  ]
  const score = completeness.filter(c => c.done).length

  const expLabel = (val: string) => {
    const n = Number(val)
    if (n === 0) return t("fresher")
    return n === 1 ? t("expYear", { n }) : t("expYears", { n })
  }

  const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1a3461]/30 focus:border-[#1a3461] bg-white"

  return (
    <div className="min-h-screen bg-gray-100 pb-24">

      {/* Profile header card */}
      <div className="bg-[#1a3461]">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-start gap-4">
            {/* Photo */}
            <div className="relative shrink-0">
              <div
                className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 overflow-hidden cursor-pointer"
                onClick={() => photoInputRef.current?.click()}
              >
                {photoPreview ? (
                  <Image src={photoPreview} alt={t("title")} fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/60">
                    <Camera size={24} />
                  </div>
                )}
                {photoUploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 size={16} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md"
              >
                <Plus size={12} className="text-[#1a3461]" />
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Name + details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold text-lg leading-tight">
                {name || displayName || t("addYourName")}
              </h1>
              {city && (
                <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5">
                  <MapPin size={12} /> {city}
                </p>
              )}
              {phone && (
                <p className="text-white/60 text-sm flex items-center gap-1 mt-0.5">
                  <Phone size={12} /> {maskPhone(phone)}
                </p>
              )}
              {isOpenToWork && (
                <span className="mt-2 inline-block text-xs font-semibold bg-green-500 text-white px-2.5 py-0.5 rounded-full">
                  {t("openToWorkBadge")}
                </span>
              )}
            </div>

            <button onClick={() => setEditBasic(true)} className="shrink-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
              <Pencil size={14} className="text-white" />
            </button>
          </div>
          <p className="text-white/50 text-[10px] mt-2">Max 2MB, JPG/PNG</p>
          {photoError && <p className="text-red-300 text-xs mt-1">{photoError}</p>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-3">

        {/* Profile completeness */}
        {score < 4 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-800 mb-2">{t("hiringChances")}</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a3461] rounded-full transition-all" style={{ width: `${score * 25}%` }} />
              </div>
              <span className="text-xs font-bold text-[#1a3461]">{score * 25}%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {completeness.filter(c => !c.done).map(c => (
                <span key={c.label} className="inline-flex items-center gap-1 text-xs border border-dashed border-gray-300 text-gray-500 px-2.5 py-1 rounded-full">
                  <Plus size={10} /> {c.label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Basic info section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">{t("basicDetails")}</h2>
            {!editBasic && (
              <button onClick={() => setEditBasic(true)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                <Pencil size={14} />
              </button>
            )}
          </div>

          {editBasic ? (
            <div className="p-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">{t("fullNameRequired")}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => {
                    // Only allow letters and spaces
                    const val = e.target.value
                    if (val === "" || /^[a-zA-Z\s]+$/.test(val)) {
                      setName(val)
                    }
                  }} 
                  maxLength={50}
                  placeholder="e.g. Ravi Kumar" 
                  className={inputCls} 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t("city")}</label>
                  <select value={city} onChange={e => setCity(e.target.value)} className={inputCls}>
                    <option value="">{t("selectCity")}</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{t("experience")}</label>
                  <select value={experienceYears} onChange={e => setExperienceYears(e.target.value)} className={inputCls}>
                    <option value="0">{t("fresher")}</option>
                    <option value="1">{t("expYear", { n: 1 })}</option>
                    <option value="2">{t("expYears", { n: 2 })}</option>
                    <option value="3">{t("expYears", { n: 3 })}</option>
                    <option value="5">{t("expYears", { n: 5 })}+</option>
                    <option value="10">{t("expYears", { n: 10 })}+</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  {t("aboutYourself")} <span className="text-gray-400 font-normal">({t("optional")})</span>
                </label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder={t("aboutPlaceholder")}
                  className={inputCls + " resize-none"} />
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={handleSaveBasic} disabled={basicLoading || !name.trim()}
                  className="flex-1 py-2 rounded-lg bg-[#1a3461] text-white text-sm font-semibold hover:bg-[#142a52] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                  {basicLoading && <Loader2 size={13} className="animate-spin" />}
                  {tc("save")}
                </button>
                <button onClick={() => {
                  setEditBasic(false)
                  setName(displayName)
                  setCity(initial?.city ?? "")
                  setBio(initial?.bio ?? "")
                  setExperienceYears(String(initial?.experienceYears ?? 0))
                }} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  {tc("cancel")}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 flex flex-col gap-2.5">
              <Row label={t("nameRow")} value={name || displayName || <span className="text-gray-400 italic text-xs">{t("notAdded")}</span>} />
              <Row label={t("city")} value={city || <span className="text-gray-400 italic text-xs">{t("notAdded")}</span>} />
              <Row label={t("experience")} value={expLabel(experienceYears)} />
              {bio && <Row label={t("aboutRow")} value={bio} />}
              {basicSaved && (
                <div className="flex items-center gap-1.5 text-green-700 text-xs">
                  <CheckCircle size={13} /> {t("savedConfirm")}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Resume section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">{t("resume")}</h2>
          </div>
          <div className="p-4">
            {resumeUrl ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-green-700 hover:underline">
                    {t("viewUploadedResume")}
                  </a>
                  <p className="text-xs text-gray-400 mt-0.5">{t("pdfOrWord")} (Max 5MB)</p>
                </div>
                <button onClick={() => resumeInputRef.current?.click()}
                  className="text-xs font-semibold text-[#1a3461] border border-[#1a3461]/30 px-3 py-1.5 rounded-lg hover:bg-[#1a3461]/5 transition-colors">
                  {t("replace")}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button onClick={() => resumeInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-[#1a3461] hover:text-[#1a3461] transition-colors">
                  {resumeUploading ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  {resumeUploading ? t("uploading") : t("uploadResumePlaceholder")}
                </button>
                <p className="text-center text-xs text-gray-400">PDF or Word document (Max 5MB)</p>
              </div>
            )}
            <input ref={resumeInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeChange} />
            {resumeError && <p className="text-xs text-red-500 mt-2">{resumeError}</p>}
          </div>
        </div>

        {/* Skills section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">{t("skills")}</h2>
            {!editSkills && (
              <button onClick={() => setEditSkills(true)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                <Pencil size={14} />
              </button>
            )}
          </div>
          <div className="p-4">
            {editSkills ? (
              <div className="flex flex-col gap-3">
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(s => (
                      <span key={s} className="inline-flex items-center gap-1 text-sm bg-[#eef2ff] text-[#1a3461] border border-[#1a3461]/20 px-2.5 py-1 rounded-full">
                        {s}
                        <button type="button" onClick={() => setSkills(p => p.filter(x => x !== s))}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = skillInput.trim(); if (v && !skills.includes(v)) { setSkills(p => [...p, v]); setSkillInput("") } } }}
                    placeholder={t("skillsPlaceholder")}
                    className={inputCls} />
                  <button type="button"
                    onClick={() => { const v = skillInput.trim(); if (v && !skills.includes(v)) { setSkills(p => [...p, v]); setSkillInput("") } }}
                    className="px-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    <Plus size={15} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveSkills} disabled={skillsLoading}
                    className="flex-1 py-2 rounded-lg bg-[#1a3461] text-white text-sm font-semibold hover:bg-[#142a52] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                    {skillsLoading && <Loader2 size={13} className="animate-spin" />}
                    {tc("save")}
                  </button>
                  <button onClick={() => {
                    setEditSkills(false)
                    setSkills(initial?.skills ?? [])
                    setSkillInput("")
                  }} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    {tc("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => (
                    <span key={s} className="text-sm bg-[#eef2ff] text-[#1a3461] border border-[#1a3461]/20 px-2.5 py-1 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <button onClick={() => setEditSkills(true)} className="text-sm text-[#1a3461] font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={14} /> {t("addSkills")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Job Preferences section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">{t("jobPreferences")}</h2>
            {!editPrefs && (
              <button onClick={() => setEditPrefs(true)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                <Pencil size={14} />
              </button>
            )}
          </div>
          <div className="p-4">
            {editPrefs ? (
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">{t("preferredJobTypesLabel")}</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map(({ value, label }) => (
                      <button key={value} type="button"
                        onClick={() => setPreferredJobTypes(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value])}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          preferredJobTypes.includes(value)
                            ? "bg-[#1a3461] text-white border-[#1a3461]"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3461]"
                        }`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${isOpenToWork ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t("openToWorkToggle")}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{isOpenToWork ? t("visibleToEmployers") : t("hiddenFromEmployers")}</p>
                  </div>
                  <button type="button" onClick={() => setIsOpenToWork(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isOpenToWork ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isOpenToWork ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSavePrefs} disabled={prefsLoading}
                    className="flex-1 py-2 rounded-lg bg-[#1a3461] text-white text-sm font-semibold hover:bg-[#142a52] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                    {prefsLoading && <Loader2 size={13} className="animate-spin" />}
                    {tc("save")}
                  </button>
                  <button onClick={() => {
                    setEditPrefs(false)
                    setPreferredJobTypes(initial?.preferredJobTypes ?? [])
                    setIsOpenToWork(initial?.isOpenToWork ?? true)
                  }} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    {tc("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {preferredJobTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {preferredJobTypes.map(v => (
                      <span key={v} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                        {JOB_TYPES.find(j => j.value === v)?.label ?? v}
                      </span>
                    ))}
                  </div>
                ) : (
                  <button onClick={() => setEditPrefs(true)} className="text-sm text-[#1a3461] font-semibold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> {t("addJobPrefs")}
                  </button>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isOpenToWork ? "bg-green-500" : "bg-gray-300"}`} />
                  <span className="text-xs text-gray-500">{isOpenToWork ? t("openToWorkStatus") : t("notLooking")}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location Preferences section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">{t("locationPreferences")}</h2>
            {!editLocation && (
              <button onClick={() => setEditLocation(true)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                <Pencil size={14} />
              </button>
            )}
          </div>
          <div className="p-4">
            {editLocation ? (
              <div className="flex flex-col gap-4">
                <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${openToRelocate ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{t("openToAnyLocationLabel")}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{openToRelocate ? t("availableAllCities") : t("specificCitiesOnly")}</p>
                  </div>
                  <button type="button" onClick={() => setOpenToRelocate(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${openToRelocate ? "bg-green-500" : "bg-gray-300"}`}>
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${openToRelocate ? "translate-x-5" : ""}`} />
                  </button>
                </div>

                {!openToRelocate && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">{t("preferredCities")}</p>
                    {preferredCities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {preferredCities.map(c => (
                          <span key={c} className="inline-flex items-center gap-1 text-xs bg-[#eef2ff] text-[#1a3461] border border-[#1a3461]/20 px-2.5 py-1 rounded-full">
                            {c}
                            <button type="button" onClick={() => setPreferredCities(p => p.filter(x => x !== c))}>
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <select onChange={e => { const v = e.target.value; if (v && !preferredCities.includes(v)) setPreferredCities(p => [...p, v]); e.target.value = "" }}
                      className={inputCls}>
                      <option value="">{t("addCityPlaceholder")}</option>
                      {cities.filter(c => !preferredCities.includes(c)).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={handleSaveLocation} disabled={locationLoading}
                    className="flex-1 py-2 rounded-lg bg-[#1a3461] text-white text-sm font-semibold hover:bg-[#142a52] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                    {locationLoading && <Loader2 size={13} className="animate-spin" />}
                    {tc("save")}
                  </button>
                  <button onClick={() => {
                    setEditLocation(false)
                    setOpenToRelocate(initial?.openToRelocate ?? true)
                    setPreferredCities(initial?.preferredCities ?? [])
                  }} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    {tc("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${openToRelocate ? "bg-green-500" : "bg-amber-400"}`} />
                  <span className="text-sm text-gray-700">
                    {openToRelocate ? t("openToAnyLocationLabel") : t("specificCitiesStatus")}
                  </span>
                </div>
                {!openToRelocate && preferredCities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {preferredCities.map(c => (
                      <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                )}
                {!openToRelocate && preferredCities.length === 0 && (
                  <button onClick={() => setEditLocation(true)} className="text-sm text-[#1a3461] font-semibold flex items-center gap-1 hover:underline">
                    <Plus size={14} /> {t("addPreferredCities")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Languages section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">{t("languagesKnown")}</h2>
            {!editLanguages && (
              <button onClick={() => setEditLanguages(true)} className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors">
                <Pencil size={14} />
              </button>
            )}
          </div>
          <div className="p-4">
            {editLanguages ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LANGUAGES.map(lang => (
                    <button key={lang} type="button"
                      onClick={() => setLanguages(prev => prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        languages.includes(lang)
                          ? "bg-[#1a3461] text-white border-[#1a3461]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[#1a3461]"
                      }`}>
                      {lang}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={langInput} onChange={e => setLangInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); const v = langInput.trim(); if (v && !languages.includes(v)) { setLanguages(p => [...p, v]); setLangInput("") } } }}
                    placeholder={t("addLanguagePlaceholder")}
                    className={inputCls} />
                  <button type="button"
                    onClick={() => { const v = langInput.trim(); if (v && !languages.includes(v)) { setLanguages(p => [...p, v]); setLangInput("") } }}
                    className="px-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    <Plus size={15} />
                  </button>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveLanguages} disabled={languagesLoading}
                    className="flex-1 py-2 rounded-lg bg-[#1a3461] text-white text-sm font-semibold hover:bg-[#142a52] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5">
                    {languagesLoading && <Loader2 size={13} className="animate-spin" />}
                    {tc("save")}
                  </button>
                  <button onClick={() => {
                    setEditLanguages(false)
                    setLanguages(initial?.languages ?? [])
                    setLangInput("")
                  }} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                    {tc("cancel")}
                  </button>
                </div>
              </div>
            ) : (
              languages.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {languages.map(lang => (
                    <span key={lang} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              ) : (
                <button onClick={() => setEditLanguages(true)} className="text-sm text-[#1a3461] font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={14} /> {t("addLanguages")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Account */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <button onClick={handleDeleteAccount} disabled={deleting}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
              deleteConfirm ? "bg-red-600 text-white border-red-600" : "text-red-500 border-red-200 hover:bg-red-50"
            }`}>
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {deleteConfirm ? t("confirmDelete") : t("deactivateAccount")}
          </button>
          {deleteConfirm && <p className="text-xs text-red-400 mt-1.5 ml-1">{t("permanentDeleteMsg")}</p>}
        </div>

      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  )
}
