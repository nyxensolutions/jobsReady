"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, ChevronRight, Loader2, Upload, FileText, Shield } from "lucide-react"

const DOC_TYPES = [
  { key: "gst", label: "Company GST Certificate" },
  { key: "pan", label: "Company PAN Card" },
  { key: "fssai", label: "FSSAI License" },
  { key: "incorporation", label: "Company Incorporation Certificate" },
  { key: "shop", label: "Shop & Establishment Certificate" },
  { key: "msme", label: "MSME Registration Certificate" },
  { key: "trade", label: "Trade License" },
  { key: "udyam", label: "Udyam Registration" },
]

export default function VerifyDocsClient({ uploadedDocs }: { uploadedDocs: string[] }) {
  const router = useRouter()
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [uploaded, setUploaded] = useState<string[]>([])
  const [showMore, setShowMore] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const hasUploaded = uploadedDocs.length > 0 || uploaded.length > 0
  const visibleDocs = showMore ? DOC_TYPES : DOC_TYPES.slice(0, 6)

  function handleSelectDoc(key: string) {
    setSelectedDoc(key)
    setError("")
    fileRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedDoc) return
    setError("")
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("doc", file)
      fd.append("docType", selectedDoc)
      const res = await fetch("/api/employer/upload-doc", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setUploaded((prev) => [...prev, selectedDoc])
      setSelectedDoc(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  if (hasUploaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={30} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Document submitted!</h2>
          <p className="text-sm text-gray-500 mb-7">
            Our team will review and verify your company within 24–48 hours. You'll be notified when verified.
          </p>
          <button
            onClick={() => router.push("/employer/dashboard")}
            className="w-full py-3 bg-[#1a3461] text-white font-semibold rounded-xl text-sm hover:bg-[#142a52] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between">
        <div />
        <Link
          href="/employer/dashboard"
          className="text-sm font-semibold text-[#1a3461] hover:underline"
        >
          Verify Later
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Hero card */}
        <div className="bg-[#eef3ff] rounded-2xl p-6 text-center mb-6">
          <p className="text-xs text-[#1a3461] font-semibold tracking-wide uppercase mb-2">Last step to post your job</p>
          <h1 className="text-xl font-bold text-gray-900 mb-4">
            Upload any 1 company document<br />to verify and earn a badge on your job
          </h1>
          {/* Badge icon */}
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-16 h-20 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center">
                <FileText size={24} className="text-gray-400" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1a3461] rounded-full flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold text-[#1a3461]">
            <Shield size={16} />
            Verified Badge gets 80% more candidates!
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-3">(Note: DO NOT upload your personal documents)</p>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Error */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Doc list */}
        <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 overflow-hidden mb-4">
          {visibleDocs.map((doc) => {
            const isUploaded = uploaded.includes(doc.key)
            return (
              <button
                key={doc.key}
                type="button"
                onClick={() => !isUploaded && handleSelectDoc(doc.key)}
                disabled={uploading}
                className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors text-left ${isUploaded ? "opacity-60" : ""}`}
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  {isUploaded ? (
                    <CheckCircle size={20} className="text-green-500" />
                  ) : uploading && selectedDoc === doc.key ? (
                    <Loader2 size={18} className="animate-spin text-[#1a3461]" />
                  ) : (
                    <Upload size={18} className="text-gray-400" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-gray-700">{doc.label}</span>
                {!isUploaded && <ChevronRight size={16} className="text-gray-400 shrink-0" />}
                {isUploaded && <span className="text-xs text-green-600 font-semibold shrink-0">Uploaded</span>}
              </button>
            )
          })}
        </div>

        {/* Show more */}
        {!showMore && (
          <button
            onClick={() => setShowMore(true)}
            className="w-full text-center text-sm font-semibold text-[#1a3461] hover:underline py-2"
          >
            + View more document options
          </button>
        )}

        {/* Help */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Need help?{" "}
          <a href="tel:18002035244" className="text-[#1a3461] font-semibold hover:underline">
            Reach us at 1800-203-5244
          </a>
        </p>
      </div>
    </div>
  )
}
