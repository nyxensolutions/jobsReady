"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { Loader2, CheckCircle } from "lucide-react"
import LogoUploader from "./LogoUploader"

type Initial = {
  companyName: string
  industry: string | null
  contactPerson: string | null
  contactPhone: string | null
  city: string | null
  website: string | null
  description: string | null
  logoUrl: string | null
}

export default function EmployerProfileForm({ initial }: { initial: Initial }) {
  const router = useRouter()
  const [companyName, setCompanyName] = useState(initial.companyName)
  const [industry, setIndustry] = useState(initial.industry ?? "")
  const [contactPerson, setContactPerson] = useState(initial.contactPerson ?? "")
  const [contactPhone, setContactPhone] = useState(initial.contactPhone ?? "")
  const [city, setCity] = useState(initial.city ?? "")
  const [website, setWebsite] = useState(initial.website ?? "")
  const [description, setDescription] = useState(initial.description ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const inputCls = "w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaved(false)
    if (!companyName.trim()) { setError("Company name is required"); return }
    setLoading(true)
    try {
      const res = await fetch("/api/employer/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, industry, contactPerson, contactPhone, city, website, description }),
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

  const companyInitial = companyName.trim().charAt(0).toUpperCase() || "?"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      {/* ── Logo uploader ── */}
      <div className="flex justify-center pb-2 border-b border-gray-100">
        <LogoUploader
          initial={initial.logoUrl}
          companyInitial={companyInitial}
          onUploaded={() => router.refresh()}
        />
      </div>

      <div>
        <label className={labelCls}>Company Name <span className="text-red-500">*</span></label>
        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputCls} placeholder="e.g. Sharma Logistics Pvt. Ltd." />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Industry</label>
          <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputCls} placeholder="e.g. Logistics, Retail" />
        </div>
        <div>
          <label className={labelCls}>City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputCls} placeholder="e.g. Delhi" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Contact Person</label>
          <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className={inputCls} placeholder="Name of HR / owner" />
        </div>
        <div>
          <label className={labelCls}>Contact Phone</label>
          <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputCls} placeholder="10-digit mobile number" />
        </div>
      </div>

      <div>
        <label className={labelCls}>Website <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputCls} placeholder="https://yourcompany.com" />
      </div>

      <div>
        <label className={labelCls}>About Your Company <span className="text-gray-400 text-xs font-normal">(optional)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls + " resize-y"} placeholder="Brief description — what you do, work culture, benefits..." />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {saved && (
        <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 px-4 py-3 rounded-xl">
          <CheckCircle size={16} /> Profile updated successfully!
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#1a3461] text-white font-bold text-sm hover:bg-[#15294f] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
        {loading && <Loader2 size={15} className="animate-spin" />}
        Save Changes
      </button>
    </form>
  )
}
