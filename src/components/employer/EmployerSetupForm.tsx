"use client"

import { useState } from "react"
import { Loader2, Building2, CheckCircle } from "lucide-react"

const HIRING_FOR = [
  { value: "own", label: "Your own company" },
  { value: "client", label: "Your client's company" },
  { value: "both", label: "Both" },
]

const INDUSTRIES = [
  "Logistics & Delivery", "Security Services", "Retail & FMCG",
  "Hospitality & Food", "Construction", "Manufacturing",
  "Healthcare", "IT & Technology", "Education", "Other",
]

export default function EmployerSetupForm({ cities }: { cities: string[] }) {
  const [contactPerson, setContactPerson] = useState("")
  const [hiringFor, setHiringFor] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [city, setCity] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [industry, setIndustry] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!contactPerson.trim()) { setError("Please enter your full name."); return }
    if (!hiringFor) { setError("Please select who you are hiring for."); return }
    if (!companyName.trim()) { setError("Please enter your company name."); return }
    if (!city) { setError("Please select your city."); return }
    if (!contactPhone) { setError("Please enter your contact number."); return }
    if (!/^[6-9]\d{9}$/.test(contactPhone)) { setError("Enter a valid 10-digit mobile number."); return }

    setLoading(true)
    try {
      const res = await fetch("/api/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactPerson: contactPerson.trim(),
          contactPhone,
          city,
          industry: industry || "Other",
          hiringFor,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Registration failed")
      setDone(true)
      setTimeout(() => { window.location.href = "/employer/dashboard" }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile created!</h2>
          <p className="text-sm text-gray-500">Taking you to your dashboard…</p>
          <Loader2 size={22} className="animate-spin text-[#1a3461] mx-auto mt-5" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#1a3461] rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={22} className="text-white" />
          </div>
          <p className="text-xs text-[#1a3461] font-semibold tracking-wide uppercase mb-1">Almost there!</p>
          <h1 className="text-2xl font-bold text-gray-900">Create your basic profile</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Your First and Last Name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Hiring for */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Are you hiring for: <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {HIRING_FOR.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHiringFor(opt.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    hiringFor === opt.value
                      ? "border-[#1a3461] bg-[#1a3461]/5 text-[#1a3461]"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">
              Company details
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company Name *"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent"
            />
          </div>

          {/* City */}
          <div>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent bg-white text-gray-700"
            >
              <option value="">City in which company is located *</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent bg-white text-gray-700"
            >
              <option value="">Industry (optional)</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Contact Phone */}
          <div>
            <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1a3461] focus-within:border-transparent">
              <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300 shrink-0">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="Contact mobile number *"
                className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#1a3461] text-white font-bold text-sm hover:bg-[#142a52] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Next →
          </button>
        </form>
      </div>
    </div>
  )
}
