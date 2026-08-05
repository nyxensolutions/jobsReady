"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

type Props = {
  jobId: string
  initialSaved?: boolean
  locale?: string
  compact?: boolean
}

export default function SaveJobButton({ jobId, initialSaved = false, locale = "en", compact = false }: Props) {
  const router = useRouter()
  const t = useTranslations("jobs")
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch("/api/seeker/saved-jobs", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      })
      if (res.status === 401) {
        router.push(`/${locale}/login?next=/jobs/${jobId}`)
        return
      }
      if (res.ok) setSaved((s) => !s)
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <button
        onClick={toggle}
        disabled={loading}
        title={saved ? t("removeFromSaved") : t("saveJob")}
        className={`p-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
          saved
            ? "border-[#1a3461] bg-[#eef2ff] text-[#1a3461]"
            : "border-gray-200 text-gray-400 hover:border-[#1a3461] hover:text-[#1a3461]"
        }`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
      </button>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors disabled:opacity-50 ${
        saved
          ? "border-[#1a3461] bg-[#eef2ff] text-[#1a3461]"
          : "border-gray-200 text-gray-600 hover:border-[#1a3461] hover:text-[#1a3461]"
      }`}
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
      {saved ? t("savedJob") : t("saveJob")}
    </button>
  )
}
