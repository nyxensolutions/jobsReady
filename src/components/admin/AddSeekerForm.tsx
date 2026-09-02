"use client"
import { useState } from "react"
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react"

export default function AddSeekerForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number")
      setLoading(false)
      return
    }

    const payload = {
      role: "SEEKER",
      phone,
      name: formData.get("name"),
      city: formData.get("city"),
      experienceMin: formData.get("experienceMin"),
      skills: formData.get("skills"),
    }

    try {
      const res = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create seeker")

      setSuccess(true)
      e.currentTarget.reset()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Register New Job Seeker</h2>
      <p className="text-sm text-gray-500 mb-6">Creates a job seeker profile. They can immediately log in using their phone number.</p>

      {success && (
        <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl flex items-start gap-3 border border-green-200">
          <CheckCircle className="shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-sm">Seeker Created Successfully</p>
            <p className="text-sm opacity-90 mt-1">The job seeker can now log in via OTP.</p>
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

      <form onSubmit={handleSubmit} className="max-w-xl flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number (10 digits) *</label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              +91
            </span>
            <input required type="text" name="phone" maxLength={10} className="flex-1 block w-full min-w-0 rounded-none rounded-r-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]" placeholder="9876543210" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
          <input required type="text" name="name" className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]" placeholder="Rahul Kumar" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
          <input type="text" name="city" className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]" placeholder="e.g. Delhi" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (Years)</label>
          <input type="number" min="0" step="1" name="experienceMin" className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]" placeholder="e.g. 2" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Skills (Comma separated)</label>
          <input type="text" name="skills" className="block w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a3461] focus:ring-[#1a3461]" placeholder="e.g. Driving, Delivery, Cooking" />
        </div>

        <button disabled={loading} type="submit" className="mt-2 flex w-full justify-center items-center gap-2 rounded-xl bg-[#1a3461] px-4 py-3 text-sm font-bold text-white hover:bg-[#142a52] disabled:opacity-70 transition-colors">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Register Seeker
        </button>
      </form>
    </div>
  )
}
