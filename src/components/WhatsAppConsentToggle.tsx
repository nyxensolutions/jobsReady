"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

/**
 * Consent to WhatsApp marketing messages.
 *
 * Saves on its own, immediately, rather than riding along with a larger form:
 * consent should not be something a user grants as a side effect of saving
 * their address. Never pre-ticked, and reversible in one tap.
 *
 * Optimistic, with a rollback. Showing the switch stuck in the old position
 * while a request is in flight reads as "it didn't work" and invites a second
 * tap, which would toggle it straight back.
 */
export default function WhatsAppConsentToggle({
  initial,
  label,
  hint,
}: {
  initial: boolean
  label: string
  hint: string
}) {
  const [optIn, setOptIn] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle() {
    const next = !optIn
    setOptIn(next)
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/notifications/whatsapp-consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optIn: next }),
      })
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not save")
    } catch (err) {
      setOptIn(!next)
      setError(err instanceof Error ? err.message : "Could not save")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div
        className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${
          optIn ? "border-green-300 bg-green-50" : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="pr-3">
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
        </div>
        <button
          type="button"
          onClick={toggle}
          disabled={saving}
          aria-pressed={optIn}
          aria-label={label}
          className={`relative shrink-0 w-10 h-5 rounded-full transition-colors disabled:opacity-60 ${
            optIn ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          {saving ? (
            <Loader2 size={11} className="animate-spin absolute top-1 left-1 text-white" />
          ) : (
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                optIn ? "translate-x-5" : ""
              }`}
            />
          )}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600 mt-1.5">{error}</p> : null}
    </div>
  )
}
