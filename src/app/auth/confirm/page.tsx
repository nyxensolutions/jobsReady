"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

function AuthConfirmContent() {
  const searchParams = useSearchParams()
  const [error, setError] = useState("")

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (!hash) {
      setError("No session data in URL.")
      return
    }

    const params = new URLSearchParams(hash)
    const access_token = params.get("access_token")
    const refresh_token = params.get("refresh_token")

    if (!access_token || !refresh_token) {
      setError("Invalid or expired sign-in link.")
      return
    }

    const supabase = createClient()
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error: err }) => {
      if (err) {
        setError(err.message)
        return
      }
      const next = searchParams.get("next") ?? "/"
      window.location.replace(next)
    })
  }, [searchParams])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-sm w-full text-center">
          <p className="text-red-500 text-sm font-medium mb-4">{error}</p>
          <a href="/login" className="text-blue-700 text-sm hover:underline">
            Back to login →
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={28} className="animate-spin text-blue-600" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 size={28} className="animate-spin text-blue-600" />
        </div>
      }
    >
      <AuthConfirmContent />
    </Suspense>
  )
}
