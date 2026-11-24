"use client"

import { useEffect, useRef, useState } from "react"
import {
  RecaptchaVerifier,
  linkWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { Phone, ShieldCheck, AlertCircle, Loader2 } from "lucide-react"

/**
 * Attaches a mobile number to the account the user is already signed in to.
 *
 * Only shown to accounts with no phone on file. Those accounts signed up with
 * Google, which is their single credential — and signing in by phone instead
 * would mint a different Firebase uid, so it would hand them a new empty
 * account rather than their own. The number has to join the existing uid, and
 * linkWithPhoneNumber is the only thing that does that.
 *
 * Deliberately not part of the sign-up flow: this is for accounts that already
 * exist, and it must never be the step that creates one.
 */

type Stage = "loading" | "form" | "otp" | "finish" | "done"

export default function LinkPhoneCard({
  title = "Add your mobile number",
  blurb = "Right now Google is the only way into this account. Adding your mobile number gives you a second way to sign in — it stays the same account, with everything already on it.",
}: {
  title?: string
  blurb?: string
}) {
  const [stage, setStage] = useState<Stage>("loading")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      const providers = user?.providerData.map((p) => p.providerId) ?? []
      // Firebase already holds a phone for this uid but the database does not,
      // so an earlier attempt linked and then failed to commit. Re-linking
      // would be refused as provider-already-linked, leaving the user stuck on
      // a card they cannot clear; the only thing still missing is the write.
      setStage(providers.includes("phone") ? "finish" : "form")
    })
    return () => unsub()
  }, [])

  /** Fresh verifier per attempt — a cleared one cannot be reused. */
  function ensureRecaptcha() {
    if (!recaptchaRef.current) {
      recaptchaRef.current = new RecaptchaVerifier(auth, "link-phone-recaptcha", {
        size: "invisible",
      })
    }
    return recaptchaRef.current
  }

  function resetRecaptcha() {
    recaptchaRef.current?.clear()
    recaptchaRef.current = null
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number")
      return
    }

    const user = auth.currentUser
    if (!user) {
      setError("Your session has expired. Please sign in again, then add your number.")
      return
    }

    setBusy(true)
    try {
      // Ask the server whether the number is free before spending an OTP on
      // it. Linking first and failing the database write afterwards would pin
      // the number to this account inside Firebase and lock out whoever
      // actually owns it.
      const res = await fetch("/api/auth/link-phone/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      if (!res.ok) {
        setError((await res.json().catch(() => ({}))).error ?? "Could not use that number.")
        return
      }

      confirmRef.current = await linkWithPhoneNumber(user, `+91${phone}`, ensureRecaptcha())
      setStage("otp")
    } catch (err: unknown) {
      resetRecaptcha()
      setError(linkError(err))
    } finally {
      setBusy(false)
    }
  }

  async function confirmOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP")
      return
    }
    if (!confirmRef.current) {
      setError("That code has expired. Please request a new one.")
      return
    }

    setBusy(true)
    try {
      await confirmRef.current.confirm(otp)
      await commit()
    } catch (err: unknown) {
      setError(linkError(err))
    } finally {
      setBusy(false)
    }
  }

  /** Writes the now-linked number into Postgres. */
  async function commit() {
    const res = await fetch("/api/auth/link-phone", { method: "POST" })
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save your number.")
      return
    }
    setStage("done")
  }

  async function finishPending() {
    setError(null)
    setBusy(true)
    try {
      await commit()
    } finally {
      setBusy(false)
    }
  }

  if (stage === "loading") return null

  if (stage === "done") {
    return (
      <div className="bg-white rounded-xl border border-emerald-200 p-4">
        <div className="flex items-start gap-2.5 text-sm text-emerald-800">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Your mobile number is now on this account.</p>
            <p className="text-emerald-700/80 text-xs mt-0.5">
              You can sign in with it or with Google — both reach this same account.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-1.5 text-emerald-700 underline hover:no-underline text-xs"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-amber-300 p-4">
      <div className="flex items-start gap-2.5">
        <Phone size={16} className="shrink-0 mt-0.5 text-amber-700" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{blurb}</p>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 mt-3">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {stage === "finish" && (
            <button
              onClick={finishPending}
              disabled={busy}
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1a3461] text-white font-semibold text-sm hover:bg-[#142a52] disabled:opacity-60"
            >
              {busy && <Loader2 size={14} className="animate-spin" />} Finish adding my number
            </button>
          )}

          {stage === "form" && (
            <form onSubmit={sendOtp} className="mt-3 flex flex-col sm:flex-row gap-2">
              <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden flex-1">
                <span className="px-2.5 py-2 text-sm text-gray-500 bg-gray-50 border-r border-gray-200">
                  +91
                </span>
                <input
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  autoComplete="tel-national"
                  className="w-full px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={busy || phone.length !== 10}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1a3461] text-white font-semibold text-sm hover:bg-[#142a52] disabled:opacity-60"
              >
                {busy && <Loader2 size={14} className="animate-spin" />} Send OTP
              </button>
            </form>
          )}

          {stage === "otp" && (
            <form onSubmit={confirmOtp} className="mt-3 flex flex-col sm:flex-row gap-2">
              <input
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit OTP"
                autoComplete="one-time-code"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm tracking-widest focus:outline-none focus:border-[#1a3461]"
              />
              <button
                type="submit"
                disabled={busy || otp.length !== 6}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#1a3461] text-white font-semibold text-sm hover:bg-[#142a52] disabled:opacity-60"
              >
                {busy && <Loader2 size={14} className="animate-spin" />} Confirm
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Invisible reCAPTCHA. Its own id, because the login page mounts one
          under "recaptcha-container" and two verifiers sharing a container
          break each other. */}
      <div id="link-phone-recaptcha" />
    </div>
  )
}

function linkError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? ""
  switch (code) {
    case "auth/credential-already-in-use":
    case "auth/account-exists-with-different-credential":
      return "That mobile number already has its own account. Use a different number."
    case "auth/provider-already-linked":
      return "This account already has a mobile number."
    // Firebase refuses to attach a credential to a session that has been open
    // a while, guarding against someone using an unattended browser.
    case "auth/requires-recent-login":
      return "For your security, please sign out and sign in again, then add your number."
    case "auth/invalid-phone-number":
      return "Invalid phone number. Check and try again."
    case "auth/invalid-verification-code":
      return "Incorrect OTP. Please try again."
    case "auth/code-expired":
      return "That code has expired. Please request a new one."
    case "auth/too-many-requests":
      return "Too many attempts. Please wait about an hour and try again."
    default:
      return "Could not add your mobile number. Please try again."
  }
}
