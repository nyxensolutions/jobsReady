"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { Phone, Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react"

type Step = "role" | "phone" | "otp" | "email"
type Role = "seeker" | "employer"

export default function LoginPage() {
  const t = useTranslations("auth")
  const [role, setRole] = useState<Role | null>(null)
  const [step, setStep] = useState<Step>("role")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function selectRole(r: Role) {
    setRole(r)
    setStep(r === "seeker" ? "phone" : "email")
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      setStep("otp")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Invalid OTP")
      window.location.href = "/seeker/dashboard"
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function employerLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/employer-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed")
      // Redirect to check email page
      window.location.href = `/employer/check-email?email=${encodeURIComponent(email)}`
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
              JR
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t("loginTitle")}</h1>
          </div>

          {/* Step: Choose role */}
          {step === "role" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => selectRole("seeker")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t("iAmSeeker")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Login with mobile OTP</div>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => selectRole("employer")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{t("iAmEmployer")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Login with email</div>
                </div>
                <ArrowRight size={16} className="ml-auto text-gray-400 group-hover:text-blue-600" />
              </button>
            </div>
          )}

          {/* Step: Phone */}
          {step === "phone" && (
            <form onSubmit={sendOtp} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setStep("role")}
                className="text-sm text-blue-600 hover:underline text-left mb-2"
              >
                ← Back
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("phoneLabel")}
                </label>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder={t("phonePlaceholder")}
                    className="flex-1 px-3 py-3 text-sm text-gray-900 outline-none bg-transparent"
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {t("sendOtp")}
              </button>
            </form>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-4">
              <div className="text-center mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  {t("otpSent", { phone: `+91 ${phone}` })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("otpLabel")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder={t("otpPlaceholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-[1em] outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {t("verifyOtp")}
              </button>
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-sm text-blue-600 hover:underline text-center"
              >
                {t("resendOtp")}
              </button>
            </form>
          )}

          {/* Step: Employer email */}
          {step === "email" && (
            <form onSubmit={employerLogin} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setStep("role")}
                className="text-sm text-blue-600 hover:underline text-left mb-2"
              >
                ← Back
              </button>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t("emailLabel")}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Continue with Email
              </button>
              <p className="text-xs text-gray-500 text-center">
                We'll send you a magic link to sign in.
              </p>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          New employer?{" "}
          <Link href="/employer/register" className="text-blue-600 font-medium hover:underline">
            Register your company
          </Link>
        </p>
      </div>
    </div>
  )
}
