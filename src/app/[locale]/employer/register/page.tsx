"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Loader2, Building2, Upload, CheckCircle } from "lucide-react"

type FormState = {
  companyName: string
  email: string
  contactPerson: string
  contactPhone: string
  industry: string
  city: string
  gstCin: string
  website: string
}

const INDUSTRIES = [
  "Logistics & Delivery",
  "Security Services",
  "Retail & FMCG",
  "Hospitality & Food",
  "Construction",
  "Manufacturing",
  "Healthcare",
  "IT & Technology",
  "Education",
  "Other",
]

export default function EmployerRegisterPage() {
  const t = useTranslations("employer.register")
  const [form, setForm] = useState<FormState>({
    companyName: "",
    email: "",
    contactPerson: "",
    contactPhone: "",
    industry: "",
    city: "",
    gstCin: "",
    website: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  function update(key: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.companyName || !form.email || !form.contactPerson || !form.contactPhone || !form.industry || !form.city) {
      setError("Please fill in all required fields.")
      return
    }
    if (!/^[6-9]\d{9}$/.test(form.contactPhone)) {
      setError("Enter a valid 10-digit mobile number.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/employer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Registration failed")
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Upload size={28} className="text-blue-700" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-1">
            We sent a sign-in link to
          </p>
          <p className="font-semibold text-gray-800 text-sm mb-5">{form.email}</p>
          <p className="text-xs text-gray-400 mb-7 leading-relaxed">
            Click the link in the email to access your employer dashboard and post your first job. The link expires in 24 hours.
          </p>
          <Link
            href={`/login?role=employer`}
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-700 text-white font-semibold rounded-xl text-sm hover:bg-blue-800 transition-colors"
          >
            Didn't get the email? Sign in here
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 text-sm mt-2">
            Post jobs, find candidates, hire faster.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 flex flex-col gap-5">
          {/* Company name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("companyName")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="e.g. Zomato India Pvt Ltd"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Contact person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("contactPerson")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => update("contactPerson", e.target.value)}
                placeholder="HR Manager name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Contact phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.contactPhone}
                  onChange={(e) => update("contactPhone", e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit number"
                  className="flex-1 px-3 py-3 text-sm outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Work email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Work Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="hr@yourcompany.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("industry")} <span className="text-red-500">*</span>
              </label>
              <select
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 bg-white"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="e.g. Hyderabad"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* GST / CIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t("gstCin")} <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={form.gstCin}
                onChange={(e) => update("gstCin", e.target.value.toUpperCase())}
                placeholder="GST or CIN number"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Website <span className="text-gray-400 font-normal text-xs">(optional)</span>
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Doc upload hint */}
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 flex items-start gap-3">
            <Upload size={18} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-700">{t("uploadDocs")}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("docsHint")} · Coming soon</p>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Register Company
          </button>

          <p className="text-center text-xs text-gray-400">
            Already registered?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
