"use client"

import { useEffect, useState } from "react"
import { EmailAuthProvider, linkWithCredential } from "firebase/auth"
import { auth } from "@/lib/firebase/client"
import { meetsPasswordPolicy, PASSWORD_RULE } from "@/lib/passwordPolicy"
import { Mail, Phone, KeyRound, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"

interface Props {
  currentEmail: string | null
  emailVerified: boolean
}

type Stage = "loading" | "list" | "otp" | "done"

const PROVIDER_LABELS: Record<string, string> = {
  phone: "Mobile number",
  "google.com": "Google",
  password: "Email & password",
}

export default function EmployerSignInMethods({ currentEmail, emailVerified }: Props) {
  const [stage, setStage] = useState<Stage>("loading")
  const [providers, setProviders] = useState<string[]>([])
  const [email, setEmail] = useState(currentEmail ?? "")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // providerData is the authoritative list of credentials on this account —
  // the ID token only names the one used for the current sign-in.
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setProviders(user?.providerData.map((p) => p.providerId) ?? [])
      setStage("list")
    })
    return () => unsub()
  }, [])

  const hasPassword = providers.includes("password")
  // A verified address is already proved, so linking a password to that same
  // address needs no second round of OTP. The field is fixed in that case so
  // the employer cannot quietly point the account at an unproved mailbox.
  const emailLocked = Boolean(currentEmail && emailVerified)

  async function addPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const addr = (emailLocked ? currentEmail! : email).trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) {
      setError("Enter a valid email address")
      return
    }
    if (!meetsPasswordPolicy(password)) {
      setError(PASSWORD_RULE)
      return
    }

    setBusy(true)
    try {
      // Claim the address in Postgres first. If it belongs to another account
      // this fails before anything changes in Firebase, which keeps a retry
      // clean. The reverse order can strand a password credential against an
      // address the database will never accept.
      if (!emailLocked) {
        const res = await fetch("/api/employer/verify-email/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: addr }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setError(data.error ?? "Could not send the verification code. Please try again.")
          setBusy(false)
          return
        }
      }

      const user = auth.currentUser
      if (!user) {
        setError("Your session expired. Please sign in again.")
        setBusy(false)
        return
      }
      await linkWithCredential(user, EmailAuthProvider.credential(addr, password))

      setPassword("")
      if (emailLocked) {
        setStage("done")
      } else {
        setStage("otp")
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? ""
      setError(
        code === "auth/email-already-in-use" || code === "auth/credential-already-in-use"
          ? "That email address already has its own account. Use a different address."
          : code === "auth/provider-already-linked"
            ? "This account already has a password."
            : // Firebase refuses to attach a credential to a session that has
              // been open a while, as a precaution against someone using an
              // unattended browser.
              code === "auth/requires-recent-login"
              ? "For your security, please sign out and sign in again, then add your password."
              : code === "auth/weak-password" || code === "auth/password-does-not-meet-requirements"
                ? PASSWORD_RULE
                : "Could not add the password. Please try again."
      )
    } finally {
      setBusy(false)
    }
  }

  /** Mails a code to the address already on the account. */
  async function sendCode() {
    setError(null)
    setBusy(true)
    try {
      const res = await fetch("/api/employer/verify-email/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Could not send the code. Please try again.")
        return
      }
      setEmail(data.email ?? currentEmail ?? "")
      setStage("otp")
    } finally {
      setBusy(false)
    }
  }

  async function confirmOtp(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const res = await fetch("/api/employer/verify-email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: otp.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Could not verify that code.")
        return
      }
      setStage("done")
    } finally {
      setBusy(false)
    }
  }

  if (stage === "loading") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <RefreshCw size={14} className="animate-spin" /> Loading sign-in methods…
      </div>
    )
  }

  if (stage === "done") {
    return (
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
        <CheckCircle size={16} className="shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">You can now sign in with your email and password.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-1 text-emerald-700 underline hover:no-underline"
          >
            Refresh to see your updated sign-in methods
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        {providers.map((p) => (
          <div key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
            {p === "phone" ? (
              <Phone size={15} className="text-[#1a3461]" />
            ) : p === "password" ? (
              <KeyRound size={15} className="text-[#1a3461]" />
            ) : (
              <Mail size={15} className="text-[#1a3461]" />
            )}
            <span>{PROVIDER_LABELS[p] ?? p}</span>
            <CheckCircle size={14} className="text-emerald-600" />
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {stage === "otp" && (
        <form onSubmit={confirmOtp} className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code we sent to{" "}
            <span className="font-semibold text-gray-800">{email.trim().toLowerCase()}</span>.
            Until this address is confirmed you cannot post jobs or unlock candidate contacts.
          </p>
          <input
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit code"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm tracking-widest focus:outline-none focus:border-[#1a3461]"
          />
          <button
            type="submit"
            disabled={busy || otp.trim().length !== 6}
            className="w-full py-2.5 rounded-xl bg-[#1a3461] text-white font-semibold text-sm hover:bg-[#142a52] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <RefreshCw size={14} className="animate-spin" />} Confirm email
          </button>
        </form>
      )}

      {stage === "list" && hasPassword && !emailVerified && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p>
            Your email address is not confirmed yet. Until it is, this account cannot post jobs or
            unlock candidate contacts.
          </p>
          {/* Without this the warning is a dead end: an account can reach this
              state without a code ever having been sent, and nothing else on
              the page can send one. */}
          <button
            onClick={sendCode}
            disabled={busy}
            className="mt-2 inline-flex items-center gap-1.5 font-semibold text-amber-900 underline hover:no-underline disabled:opacity-60"
          >
            {busy && <RefreshCw size={13} className="animate-spin" />}
            Send me a verification code
          </button>
        </div>
      )}

      {stage === "list" && !hasPassword && (
        <form onSubmit={addPassword} className="flex flex-col gap-3 border-t border-gray-100 pt-5">
          <div>
            <p className="text-sm font-semibold text-gray-800">Add a password</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Sign in without waiting for an OTP. Your existing sign-in methods keep working.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
            <input
              type="email"
              value={emailLocked ? currentEmail! : email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailLocked}
              placeholder="you@company.com"
              autoComplete="email"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a3461] disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8+ characters, with a number and symbol"
              autoComplete="new-password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#1a3461]"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-xl bg-[#1a3461] text-white font-semibold text-sm hover:bg-[#142a52] disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <RefreshCw size={14} className="animate-spin" />} Add password
          </button>
        </form>
      )}
    </div>
  )
}
