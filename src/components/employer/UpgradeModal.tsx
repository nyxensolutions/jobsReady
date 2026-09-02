"use client"

import { X, Mail, Briefcase } from "lucide-react"
import Image from "next/image"

interface Props {
  message: string
  onClose: () => void
}

export default function UpgradeModal({ message, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Branded header */}
        <div className="bg-gradient-to-br from-[#1a3461] to-[#243f7a] px-6 pt-8 pb-10 flex flex-col items-center text-center">
          <Image
            src="/logo-full.png"
            alt="Jobs24India"
            width={160}
            height={40}
            className="mb-5 brightness-0 invert"
          />
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-white">
            Job Posting Limit Reached
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6 -mt-4 bg-white rounded-t-3xl relative flex flex-col gap-5">
          <p className="text-sm text-gray-600 leading-relaxed text-center">
            {message}
          </p>

          {/* Contact card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#1a3461] flex items-center justify-center shrink-0">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Contact our team
              </p>
              <a
                href="mailto:support@jobs24india.com"
                className="text-[#1a3461] font-bold text-sm hover:underline"
              >
                support@jobs24india.com
              </a>
            </div>
          </div>

          {/* Actions */}
          <a
            href="mailto:support@jobs24india.com?subject=Request%20to%20Post%20More%20Jobs&body=Hi%20Jobs24India%20Team%2C%0A%0AI%27ve%20reached%20the%20job%20posting%20limit%20on%20my%20free%20plan%20and%20would%20like%20to%20post%20more%20jobs.%0A%0APlease%20let%20me%20know%20the%20available%20options.%0A%0AThank%20you."
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1a3461] hover:bg-[#243f7a] text-white font-bold rounded-xl text-sm transition-colors shadow-sm"
          >
            <Mail size={15} />
            Email Us
          </a>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center pb-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
