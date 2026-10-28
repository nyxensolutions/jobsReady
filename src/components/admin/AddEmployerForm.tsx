"use client"
import { useRef, useState } from "react"
import { Loader2, CheckCircle, AlertTriangle, Upload } from "lucide-react"

export default function AddEmployerForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  function removeLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ""
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number")
      setLoading(false)
      return
    }

    const email = (formData.get("email") as string)?.trim() || undefined

    const payload = {
      role: "EMPLOYER",
      phone,
      email,
      companyName: formData.get("companyName"),
      contactPerson: formData.get("contactPerson"),
      city: formData.get("city"),
      industry: formData.get("industry"),
    }

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create employer")

      const uid: string = data.uid

      // Upload logo if provided (best-effort — employer is already created)
      if (logoFile && uid) {
        const fd = new FormData()
        fd.append("logo", logoFile)
        fd.append("userId", uid)
        const logoRes = await fetch("/api/admin/upload-logo", { method: "POST", body: fd })
        if (!logoRes.ok) {
          const logoErr = await logoRes.json()
          console.error("[AddEmployerForm] logo upload failed:", logoErr.error)
        }
      }

      const notes: string[] = []
      if (email) notes.push("Welcome email sent.")
      if (logoFile) notes.push("Logo uploaded.")
      setSuccess(`Employer created successfully. ${notes.join(" ")}`.trim())
      formRef.current?.reset()
      removeLogo()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Register New Employer</h2>
      <p className="text-sm text-gray-500 mb-6">
        Creates an employer account and pre-approves them. They can immediately log in using their phone number.
      </p>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3 border border-green-200">
          <CheckCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-sm">Employer Created Successfully</p>
            <p className="text-sm opacity-90 mt-1">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-200">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-sm">Creation Failed</p>
            <p className="text-sm opacity-90 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-5">

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number (10 digits) *</label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              +91
            </span>
            <input
              required
              type="text"
              name="phone"
              maxLength={10}
              className="flex-1 block w-full min-w-0 rounded-none rounded-r-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]"
              placeholder="9876543210"
            />
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
          <input
            required
            type="text"
            name="companyName"
            className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]"
            placeholder="Acme Corp"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Person</label>
          <input
            type="text"
            name="contactPerson"
            className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]"
            placeholder="John Doe"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email{" "}
            <span className="font-normal text-gray-400">(optional — welcome email will be sent)</span>
          </label>
          <input
            type="email"
            name="email"
            className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]"
            placeholder="contact@acmecorp.com"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
          <input
            type="text"
            name="city"
            className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]"
            placeholder="e.g. Mumbai"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Industry</label>
          <input
            type="text"
            name="industry"
            className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]"
            placeholder="e.g. Retail, IT, Manufacturing"
          />
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Company Logo{" "}
            <span className="font-normal text-gray-400">(optional — JPG/PNG, max 2 MB)</span>
          </label>
          <div className="flex items-center gap-3">
            {logoPreview && (
              <img
                src={logoPreview}
                alt="logo preview"
                className="w-14 h-14 rounded-xl object-contain border border-gray-200 bg-gray-50 shrink-0"
              />
            )}
            <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-[#1a3461] hover:text-[#1a3461] transition-colors">
              <Upload size={14} />
              {logoFile ? logoFile.name : "Choose image"}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
            {logoFile && (
              <button
                type="button"
                onClick={removeLogo}
                className="text-xs text-red-500 hover:underline shrink-0"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-[#1a3461] px-4 py-3 text-sm font-bold text-white hover:bg-[#142a52] disabled:opacity-70 transition-colors"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Register Employer
        </button>
      </form>
    </div>
  )
}
