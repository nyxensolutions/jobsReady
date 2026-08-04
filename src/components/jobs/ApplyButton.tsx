"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle } from "lucide-react"

type Props = {
  jobId: string
  contactPhone?: string | null
  locale: string
}

export default function ApplyButton({ jobId, contactPhone, locale }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "duplicate" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleApply() {
    setStatus("loading")
    setErrorMsg("")
    try {
      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      const data = await res.json()

      if (res.status === 401) {
        // Not logged in — redirect to login then come back
        router.push(`/${locale}/login?next=/jobs/${jobId}`)
        return
      }
      if (res.status === 409 || data.code === "DUPLICATE") {
        setStatus("duplicate")
        return
      }
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong")
        setStatus("error")
        return
      }
      router.push(`/${locale}/jobs/${jobId}/applied`)
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  if (status === "done" || status === "duplicate") {
    return (
      <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
        <CheckCircle size={16} />
        {status === "done" ? "Application submitted!" : "Already applied"}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleApply}
        disabled={status === "loading"}
        className="w-full py-3 bg-[#1a3461] hover:bg-[#142a52] text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {status === "loading" && <Loader2 size={15} className="animate-spin" />}
        Apply Now — Free
      </button>

      {status === "error" && (
        <p className="text-red-500 text-xs text-center">{errorMsg}</p>
      )}
    </div>
  )
}
