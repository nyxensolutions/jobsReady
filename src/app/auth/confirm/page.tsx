"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// This page is no longer used — Firebase handles all auth callbacks client-side.
// Redirect any old links to login.
export default function AuthConfirmPage() {
  useEffect(() => { window.location.replace("/login") }, [])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 size={28} className="animate-spin text-blue-600" />
    </div>
  )
}
