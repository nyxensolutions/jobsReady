"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, X } from "lucide-react"

export default function WithdrawButton({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleWithdraw() {
    if (!confirmed) { setConfirmed(true); return }
    setLoading(true)
    try {
      await fetch(`/api/seeker/applications/${applicationId}`, { method: "DELETE" })
      router.refresh()
    } finally {
      setLoading(false)
      setConfirmed(false)
    }
  }

  return (
    <button
      onClick={handleWithdraw}
      disabled={loading}
      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
        confirmed
          ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
          : "text-gray-400 border-gray-200 hover:border-red-300 hover:text-red-500"
      }`}
      title={confirmed ? "Click again to confirm" : "Withdraw application"}
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
      {confirmed ? "Confirm?" : "Withdraw"}
    </button>
  )
}
