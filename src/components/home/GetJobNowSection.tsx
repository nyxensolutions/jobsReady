"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Phone, ArrowRight, CheckCircle } from "lucide-react"

export default function GetJobNowSection() {
  const t = useTranslations("home.getJob")
  const router = useRouter()
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")

  function handleGetJob(e: React.FormEvent) {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError(t("invalidPhone"))
      return
    }
    setError("")
    router.push(`/login?phone=${phone}&role=seeker`)
  }

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
    t("benefit4"),
  ]

  return (
    <section className="bg-[#EBF3FF] py-10 sm:py-14 border-y border-[#d0e6ff]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">

          {/* Left: CTA — now uses the bigger heading style */}
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white border border-[#c8dff7] text-[#1a3461] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {t("freeBadge")}
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#1a3461] leading-[1.15] mb-4">
              {t("title")}
            </h2>
            <p className="text-slate-500 text-base sm:text-lg mb-8 max-w-lg leading-relaxed">
              {t("subtitle")}
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
                  placeholder={t("phonePlaceholder")}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-gray-900 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1a3461] border border-[#c8dff7] bg-white shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1a3461] hover:bg-[#142a52] text-white font-bold rounded-xl transition-colors shrink-0 text-sm shadow-sm"
              >
                {t("button")} <ArrowRight size={15} />
              </button>
            </form>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-5">
              {benefits.map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-slate-600 text-xs">
                  <CheckCircle size={13} className="text-green-500" /> {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right: hero image (stays on top where it originally was) */}
          <div className="hidden lg:flex justify-center items-center relative">
            <div className="relative w-full max-w-md aspect-[4/3]">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <Image
                  src="/images/hero-seeker.jpg"
                  alt="Blue-collar workers finding jobs in India"
                  width={560}
                  height={420}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-8 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">💼</div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">50,000+</p>
                  <p className="text-[10px] text-gray-400 font-medium">Active Jobs</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">🏢</div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">5,000+</p>
                  <p className="text-[10px] text-gray-400 font-medium">Companies Hiring</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
