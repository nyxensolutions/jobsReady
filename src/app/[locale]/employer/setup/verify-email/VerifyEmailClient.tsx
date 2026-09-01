"use client"

import { useState } from "react"
import { Mail, CheckCircle, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { Link } from "@/i18n/navigation"

interface Props {
  currentEmail: string | null
  errorParam: string | null
}

type State = "idle" | "form" | "sent" | "loading"

export default function VerifyEmailClient({ currentEmail, errorParam }: Props) {
  const [state, setState] = useState<State>(
    errorParam ? "idle" : currentEmail ? "idle" : "form"
  )
  const [emailInput, setEmailInput] = useState("")
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const errorMessage =
    errorParam === "expired"
      ? "That verification link has expired. Please request a new one."
      : errorParam === "invalid"
      ? "That verification link is invalid. Please request a new one."
      : null

  async function handleSend(emailOverride?: string) {
    setState("loading")
    setApiError(null)
    const emailToSend = emailOverride ?? (currentEmail ?? emailInput.trim())

    const res = await fetch("/api/employer/verify-email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailToSend !== currentEmail ? { email: emailToSend } : {}),
    })
    const data = await res.json()
    if (!res.ok) {
      setApiError(data.error ?? "Something went wrong. Please try again.")
      setState(currentEmail ? "idle" : "form")
      return
    }
    setSentTo(data.email)
    setState("sent")
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-16 px-4 pb-16">
      <div className="w-full max-w-md">

        {/* Back link */}
        <Link
          href="/employer/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-[#1a3461] to-[#243f7a] px-8 py-7">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Mail size={22} className="text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Verify your email</h1>
            <p className="text-blue-200/70 text-sm mt-1">
              Confirm your email address to complete account setup
            </p>
          </div>

          <div className="px-8 py-7">

            {/* Expired / invalid error from link click */}
            {errorMessage && state === "idle" && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {errorMessage}
              </div>
            )}

            {/* API error */}
            {apiError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {apiError}
              </div>
            )}

            {/* ── SENT state ── */}
            {state === "sent" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={30} className="text-emerald-600" />
                </div>
                <h2 className="font-bold text-slate-800 text-lg mb-2">Check your inbox</h2>
                <p className="text-slate-500 text-sm mb-1">We sent a verification link to</p>
                <p className="font-semibold text-slate-800 text-sm mb-6">{sentTo}</p>
                <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                  Click the link in the email to verify your address. The link expires in 24 hours.<br />
                  Don&apos;t see it? Check your spam folder.
                </p>
                <button
                  onClick={() => handleSend(sentTo!)}
                  className="inline-flex items-center gap-2 text-sm text-[#1a3461] font-semibold hover:underline"
                >
                  <RefreshCw size={13} /> Resend email
                </button>
              </div>
            )}

            {/* ── IDLE: has email, just need to send ── */}
            {(state === "idle" || state === "loading") && currentEmail && (
              <div>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  We&apos;ll send a verification link to your registered email address.
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
                  <p className="text-xs text-slate-400 mb-0.5">Email address</p>
                  <p className="font-semibold text-slate-800 text-sm">{currentEmail}</p>
                </div>
                <button
                  onClick={() => handleSend()}
                  disabled={state === "loading"}
                  className="w-full py-3 bg-[#1a3461] hover:bg-[#142a52] disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {state === "loading" ? (
                    <><RefreshCw size={14} className="animate-spin" /> Sending…</>
                  ) : (
                    <><Mail size={14} /> Send Verification Email</>
                  )}
                </button>
                <button
                  onClick={() => setState("form")}
                  className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Use a different email address
                </button>
              </div>
            )}

            {/* ── FORM: no email or user wants to change ── */}
            {(state === "form" || (state === "loading" && !currentEmail)) && (
              <div>
                <p className="text-slate-600 text-sm mb-5 leading-relaxed">
                  Enter your email address to receive a verification link.
                </p>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1a3461]/30 focus:border-[#1a3461] transition-all"
                    onKeyDown={e => { if (e.key === "Enter" && emailInput.includes("@")) handleSend(emailInput) }}
                  />
                </div>
                <button
                  onClick={() => handleSend(emailInput)}
                  disabled={!emailInput.includes("@") || state === "loading"}
                  className="w-full py-3 bg-[#1a3461] hover:bg-[#142a52] disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {state === "loading" ? (
                    <><RefreshCw size={14} className="animate-spin" /> Sending…</>
                  ) : (
                    <><Mail size={14} /> Send Verification Email</>
                  )}
                </button>
                {currentEmail && (
                  <button
                    onClick={() => setState("idle")}
                    className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
