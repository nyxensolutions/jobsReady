"use client"

import { useRouter } from "@/i18n/navigation"
import { X, Zap, ArrowRight } from "lucide-react"
import { useLocale } from "next-intl"

interface Props {
  message: string
  onClose: () => void
}

export default function UpgradeModal({ message, onClose }: Props) {
  const router = useRouter()
  const locale = useLocale()

  function goToPlans() {
    onClose()
    router.push(`/${locale}/employer/plans`)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto">
          <Zap size={24} className="text-orange-500" fill="currentColor" />
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Upgrade your plan</h2>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <button
          onClick={goToPlans}
          className="flex items-center justify-center gap-2 w-full py-3 bg-[#1a3461] hover:bg-[#243f7a] text-white font-bold rounded-xl text-sm transition-colors"
        >
          View Plans
          <ArrowRight size={15} />
        </button>
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
