"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">Something went wrong</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          We hit an unexpected error. Our team has been notified. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1a3461] hover:bg-[#142a52] text-white font-bold rounded-xl transition-colors text-sm"
          >
            <RefreshCw size={15} /> Try Again
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl transition-colors text-sm"
          >
            <Home size={15} /> Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
