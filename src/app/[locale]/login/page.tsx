"use client"

import { useState, useRef, Suspense } from "react"
import { useTranslations } from "next-intl"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Phone, ArrowRight, Loader2, ShieldCheck, Users } from "lucide-react"
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  ConfirmationResult,
} from "firebase/auth"
import { auth } from "@/lib/firebase/client"

type Step = "role" | "phone" | "otp" | "employer"
type Role = "seeker" | "employer"

async function createSession(idToken: string, role: "SEEKER" | "EMPLOYER") {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, role }),
  })
  if (!res.ok) throw new Error((await res.json()).error ?? "Session error")
  return res.json() as Promise<{ role: string; requiresProfile: boolean }>
}

function LoginPageContent() {
  const t = useTranslations("auth")
  const searchParams = useSearchParams()
  const prefilledPhone = searchParams.get("phone") ?? ""
  const prefilledRole = searchParams.get("role") as Role | null
  const nextUrl = searchParams.get("next") ?? ""

  const [role, setRole] = useState<Role | null>(prefilledRole)
  const [step, setStep] = useState<Step>(
    prefilledRole ? (prefilledRole === "seeker" ? "phone" : "employer") : "role"
  )
  const [phone, setPhone] = useState(prefilledPhone)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const confirmRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  function selectRole(r: Role) {
    setRole(r)
    setError("")
    setStep(r === "seeker" ? "phone" : "employer")
  }

  function selectEmployerPhone() {
    setRole("employer")
    setError("")
    setStep("phone")
  }

  function getRedirect(roleStr: string, requiresProfile: boolean) {
    if (requiresProfile) return "/employer/register"
    if (nextUrl) return nextUrl
    return roleStr === "EMPLOYER" ? "/employer/dashboard" : "/seeker/dashboard"
  }

  function ensureRecaptcha() {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      })
    }
    return recaptchaRef.current
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
      const verifier = ensureRecaptcha()
      const result = await signInWithPhoneNumber(auth, `+91${phone}`, verifier)
      confirmRef.current = result
      setStep("otp")
    } catch (err: any) {
      recaptchaRef.current?.clear()
      recaptchaRef.current = null
      setError(
        err.message?.includes("invalid-phone-number")
          ? "Invalid phone number"
          : err.message?.includes("too-many-requests")
          ? "Too many attempts. Try again later."
          : "Failed to send OTP. Try again."
      )
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (otp.length !== 6) { setError("Enter the 6-digit OTP"); return }
    if (!confirmRef.current) { setError("Session expired. Request a new OTP."); return }
    setLoading(true)
    try {
      const result = await confirmRef.current.confirm(otp)
      const idToken = await result.user.getIdToken()
      // Create session with the right role (employer or seeker)
      const sessionRole = role === "employer" ? "EMPLOYER" : "SEEKER"
      const data = await createSession(idToken, sessionRole)
      window.location.href = getRedirect(data.role, data.requiresProfile)
    } catch (err: any) {
      setError(
        err.message?.includes("invalid-verification-code")
          ? "Incorrect OTP. Please try again."
          : "Verification failed. Try again."
      )
    } finally {
      setLoading(false)
    }
  }

  async function googleSignIn() {
    setError("")
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()
      const data = await createSession(idToken, "EMPLOYER")
      window.location.href = getRedirect(data.role, data.requiresProfile)
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") { setLoading(false); return }
      setError("Google sign-in failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div id="recaptcha-container" />

      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {/* Logo */}
          <div className="text-center mb-7">
            <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center">
              <Image src="/logo-full.png" alt="Job Ready" width={48} height={48} className="object-contain" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Job Ready</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
          </div>

          {/* Step: Choose role */}
          {step === "role" && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => selectRole("seeker")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors shrink-0">
                  <Users size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{t("iAmSeeker")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Login with mobile OTP</div>
                </div>
                <ArrowRight size={15} className="text-gray-400 group-hover:text-orange-500" />
              </button>

              <button
                onClick={() => selectRole("employer")}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-[#1a3461] hover:bg-[#1a3461]/5 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#1a3461] flex items-center justify-center group-hover:bg-[#1a3461] group-hover:text-white transition-colors shrink-0">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{t("iAmEmployer")}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Phone OTP or Google</div>
                </div>
                <ArrowRight size={15} className="text-gray-400 group-hover:text-[#1a3461]" />
              </button>
            </div>
          )}

          {/* Step: Phone */}
          {step === "phone" && (
            <form onSubmit={sendOtp} className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setStep(role === "employer" ? "employer" : "role")}
                className="text-sm text-gray-500 hover:text-gray-700 text-left flex items-center gap-1"
              >
                ← Back
              </button>
              {role === "employer" && (
                <div className="bg-[#1a3461]/5 rounded-xl px-3 py-2 text-xs text-[#1a3461] font-medium">
                  Employer · Phone OTP login
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("phoneLabel")}</label>
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#1a3461] focus-within:border-transparent">
                  <span className="px-3 py-3 bg-gray-50 text-gray-500 text-sm border-r border-gray-300 shrink-0">+91</span>
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
                className="w-full py-3 rounded-xl bg-[#1a3461] text-white font-semibold text-sm hover:bg-[#142a52] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {t("sendOtp")}
              </button>
            </form>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <form onSubmit={verifyOtp} className="flex flex-col gap-4">
              <div className="text-center mb-1">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck size={24} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  {t("otpSent", { phone: `+91 ${phone}` })}
                </p>
                <p className="text-xs text-gray-400 mt-1">Check your SMS · Valid for a few minutes</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("otpLabel")}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="• • • • • •"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-[0.5em] outline-none focus:ring-2 focus:ring-[#1a3461] focus:border-transparent"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#1a3461] text-white font-semibold text-sm hover:bg-[#142a52] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {t("verifyOtp")}
              </button>
              <button
                type="button"
                onClick={() => { setOtp(""); setStep("phone"); confirmRef.current = null }}
                className="text-sm text-gray-500 hover:text-gray-700 text-center"
              >
                {t("resendOtp")} →
              </button>
            </form>
          )}

          {/* Step: Employer sign in */}
          {step === "employer" && (
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setStep("role")}
                className="text-sm text-gray-500 hover:text-gray-700 text-left"
              >
                ← Back
              </button>
              <div className="text-center py-1">
                <p className="text-sm font-semibold text-gray-800 mb-1">Sign in as Employer</p>
                <p className="text-xs text-gray-400">Post jobs and find candidates</p>
              </div>

              {/* Phone OTP option */}
              <button
                onClick={selectEmployerPhone}
                className="w-full py-3 rounded-xl border-2 border-gray-200 hover:border-[#1a3461] hover:bg-[#1a3461]/5 text-gray-700 font-semibold text-sm transition-all flex items-center justify-center gap-3"
              >
                <Phone size={17} className="text-[#1a3461]" />
                Enter your mobile number
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google option */}
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                onClick={googleSignIn}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                )}
                Continue with Google
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          Looking for a job?{" "}
          <Link href="/login" className="text-[#1a3461] font-medium hover:underline">
            Job seeker login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-gray-400" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
}
