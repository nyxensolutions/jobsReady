"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function EmployerJobActions({
  jobId,
  canClose,
  canRepost,
}: {
  jobId: string
  canClose: boolean
  canRepost: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<"close" | "repost" | null>(null)

  async function doAction(action: "close" | "repost") {
    if (!confirm(action === "close" ? "Close this job? Candidates will no longer be able to apply." : "Repost this job for review?")) return
    setLoading(action)
    try {
      const res = await fetch(`/api/employer/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) router.refresh()
    } catch {
      // silently fail — page will refresh on next nav
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {canClose && (
        <button
          onClick={() => doAction("close")}
          disabled={loading !== null}
          className="text-xs font-medium text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {loading === "close" && <Loader2 size={11} className="animate-spin" />}
          Close Job
        </button>
      )}
      {canRepost && (
        <button
          onClick={() => doAction("repost")}
          disabled={loading !== null}
          className="text-xs font-medium text-green-700 border border-green-300 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 flex items-center gap-1"
        >
          {loading === "repost" && <Loader2 size={11} className="animate-spin" />}
          Repost
        </button>
      )}
    </>
  )
}
