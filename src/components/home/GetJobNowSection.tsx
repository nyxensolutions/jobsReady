"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Phone, ArrowRight, CheckCircle } from "lucide-react"

const QUICK_JOBS = ["Delivery Executive", "BPO Executive", "Telecaller", "Driver", "Security Guard", "Sales Executive", "Cook", "Data Entry", "Helper", "Factory Worker", "Warehouse", "Nurse"]

export default function GetJobNowSection() {
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")

  function handleGetJob(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit mobile number")
      return
    }
    setError("")
    router.push(`/login?phone=${phone}&role=seeker`)
  }

  return (
    <section className="bg-[#EBF3FF] py-10 sm:py-14 border-y border-[#d0e6ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">

          {/* Left: CTA */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-[#c8dff7] text-[#1a3461] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              100% Free — No registration fee
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1a3461] leading-tight mb-2">
              Get a Job Now — It's Free!
            </h2>
            <p className="text-slate-500 text-sm sm:text-base mb-6">
              Enter your mobile number and we'll find jobs near you instantly.
            </p>

            <form onSubmit={handleGetJob} className="flex flex-col sm:flex-row gap-3 max-w-md">
              <div className="flex-1 relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError("") }}
                  placeholder="Enter mobile number"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1a3461] border border-[#c8dff7] bg-white shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a3461] hover:bg-[#142a52] text-white font-bold rounded-xl transition-colors shrink-0 text-sm shadow-sm"
              >
                Get Job Now <ArrowRight size={15} />
              </button>
            </form>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5">
              {["Free registration", "OTP login", "Jobs in your city", "Direct call to employer"].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-slate-600 text-xs">
                  <CheckCircle size={13} className="text-green-500" /> {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right: popular job quick-links */}
          <div>
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Popular job types</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_JOBS.map((job) => (
                <button
                  key={job}
                  onClick={() => router.push(`/jobs?q=${encodeURIComponent(job)}`)}
                  className="bg-white hover:bg-[#1a3461] hover:text-white text-[#1a3461] text-sm font-medium px-4 py-2 rounded-full transition-colors border border-[#c8dff7] shadow-sm"
                >
                  {job}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
