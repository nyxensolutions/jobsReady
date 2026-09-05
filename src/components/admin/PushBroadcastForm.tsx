"use client"
import { useEffect, useState } from "react"
import { Loader2, CheckCircle, AlertTriangle, Send, Smartphone, Users, Building2 } from "lucide-react"

type Audience = "SEEKER" | "EMPLOYER"

type Reach = Record<Audience, { users: number; devices: number }>

type SendResult = {
  notified: number
  devices: number
  sent: number
  failed: number
  warning?: string
}

const MAX_TITLE = 80
const MAX_BODY = 240

const AUDIENCES: { key: Audience; label: string; blurb: string; Icon: typeof Users }[] = [
  { key: "SEEKER", label: "Job Seekers", blurb: "Everyone using the app to look for work.", Icon: Users },
  { key: "EMPLOYER", label: "Employers", blurb: "Everyone posting jobs and hiring.", Icon: Building2 },
]

type Draft = { title: string; body: string }

const EMPTY_DRAFT: Draft = { title: "", body: "" }

/**
 * Seekers and employers get their own composer rather than one form with an
 * audience dropdown: the two messages are almost never the same, and keeping
 * both drafts alive means switching tabs to compare doesn't discard either.
 */
export default function PushBroadcastForm() {
  const [audience, setAudience] = useState<Audience>("SEEKER")
  const [drafts, setDrafts] = useState<Record<Audience, Draft>>({
    SEEKER: { ...EMPTY_DRAFT },
    EMPLOYER: { ...EMPTY_DRAFT },
  })
  const [reach, setReach] = useState<Reach | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [error, setError] = useState("")

  const draft = drafts[audience]
  const canSend = draft.title.trim().length > 0 && draft.body.trim().length > 0

  function loadReach() {
    fetch("/api/admin/push/broadcast")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setReach(d))
      .catch(() => {})
  }

  useEffect(loadReach, [])

  function clearFeedback() {
    setResult(null)
    setError("")
    setConfirming(false)
  }

  function update(field: keyof Draft, value: string) {
    setDrafts((prev) => ({ ...prev, [audience]: { ...prev[audience], [field]: value } }))
    clearFeedback()
  }

  function switchTo(next: Audience) {
    setAudience(next)
    clearFeedback()
  }

  async function send() {
    setSending(true)
    setError("")
    setResult(null)
    try {
      const res = await fetch("/api/admin/push/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audience, title: draft.title.trim(), body: draft.body.trim() }),
      })
      const data = await res.json()
      // 207 means the notifications were saved but push delivery failed — a
      // partial success the admin still needs to see, not an error.
      if (!res.ok && res.status !== 207) throw new Error(data.error || "Failed to send broadcast")
      setResult(data)
      setDrafts((prev) => ({ ...prev, [audience]: { ...EMPTY_DRAFT } }))
      loadReach() // dead tokens may have been pruned during the send
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send broadcast")
    } finally {
      setSending(false)
      setConfirming(false)
    }
  }

  const current = AUDIENCES.find((a) => a.key === audience)!
  const currentReach = reach?.[audience]

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Send a Push Notification</h2>
      <p className="text-sm text-gray-500 mb-6">
        Goes to every mobile device signed in as this audience, and is saved to their in-app
        notifications so it is still there if push was switched off. This cannot be undone or recalled.
      </p>

      {/* Audience switcher — each side keeps its own draft */}
      <div className="flex gap-1 bg-gray-200 rounded-xl p-1 w-fit mb-5">
        {AUDIENCES.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTo(key)}
            className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
              audience === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={14} /> {label}
            {audience !== key && drafts[key].title.trim() && (
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" title="Unsent draft" />
            )}
          </button>
        ))}
      </div>

      <div className="mb-5 flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <Smartphone className="shrink-0 mt-0.5 text-gray-400" size={18} />
        <div className="text-sm">
          <p className="font-semibold text-gray-900">{current.label}</p>
          <p className="text-gray-500 mt-0.5">{current.blurb}</p>
          {currentReach ? (
            <p className="text-gray-700 mt-2">
              <strong>{currentReach.devices.toLocaleString()}</strong>{" "}
              {currentReach.devices === 1 ? "device" : "devices"} will get the push ·{" "}
              <strong>{currentReach.users.toLocaleString()}</strong>{" "}
              {currentReach.users === 1 ? "account" : "accounts"} will see it in the app
            </p>
          ) : (
            <p className="text-gray-400 mt-2">Counting recipients…</p>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
            result.warning
              ? "bg-amber-50 text-amber-800 border-amber-200"
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {result.warning ? (
            <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          ) : (
            <CheckCircle className="shrink-0 mt-0.5" size={18} />
          )}
          <div>
            <p className="font-semibold text-sm">
              {result.warning ? "Saved, but not delivered" : "Broadcast sent"}
            </p>
            <p className="text-sm opacity-90 mt-1">
              {result.warning ??
                `Delivered to ${result.sent} of ${result.devices} devices${
                  result.failed > 0 ? ` (${result.failed} failed)` : ""
                }. Saved to ${result.notified} in-app inboxes.`}
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-200">
          <AlertTriangle className="shrink-0 mt-0.5" size={18} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="push-title" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Title
        </label>
        <input
          id="push-title"
          value={draft.title}
          maxLength={MAX_TITLE}
          onChange={(e) => update("title", e.target.value)}
          placeholder={audience === "SEEKER" ? "New jobs near you" : "Reach more candidates"}
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <p className="text-xs text-gray-400 mt-1">
          {draft.title.length}/{MAX_TITLE}
        </p>
      </div>

      <div className="mb-5">
        <label htmlFor="push-body" className="block text-sm font-semibold text-gray-700 mb-1.5">
          Message
        </label>
        <textarea
          id="push-body"
          value={draft.body}
          maxLength={MAX_BODY}
          rows={3}
          onChange={(e) => update("body", e.target.value)}
          placeholder={
            audience === "SEEKER"
              ? "Fresh openings in your city — open the app to apply."
              : "Post a job free and start getting applications today."
          }
          className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 resize-y focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        />
        <p className="text-xs text-gray-400 mt-1">
          {draft.body.length}/{MAX_BODY}
        </p>
      </div>

      {canSend && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Preview</p>
          <div className="max-w-sm bg-gray-900 text-white rounded-2xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">Jobs24India</p>
            <p className="text-sm font-semibold break-words">{draft.title}</p>
            <p className="text-sm text-gray-300 mt-0.5 break-words">{draft.body}</p>
          </div>
        </div>
      )}

      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-900 font-medium flex-1 min-w-[15rem]">
            Send to {currentReach ? currentReach.devices.toLocaleString() : "all"}{" "}
            {current.label.toLowerCase()} devices? This cannot be undone.
          </p>
          <button
            type="button"
            onClick={send}
            disabled={sending}
            className="px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-60 flex items-center gap-2"
          >
            {sending ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
            {sending ? "Sending…" : "Yes, send it"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={sending}
            className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-white disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          disabled={!canSend}
          className="px-5 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send size={15} /> Send to {current.label}
        </button>
      )}
    </div>
  )
}
