"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Camera, Loader2, X } from "lucide-react"

type Props = {
  initial: string | null
  companyInitial: string
  onUploaded?: (url: string) => void
}

export default function LogoUploader({ initial, companyInitial, onUploaded }: Props) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initial)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""  // reset so the same file can be re-picked

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG, WebP)")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be under 2 MB")
      return
    }

    setError(null)
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("logo", file)
      const res = await fetch("/api/employer/logo", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")
      setLogoUrl(data.logoUrl)
      onUploaded?.(data.logoUrl)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative group">
        {/* Logo circle */}
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a3461] to-[#2a4a7f] flex items-center justify-center shadow-md cursor-pointer border-2 border-white ring-2 ring-gray-100 hover:ring-[#1a3461]/30 transition-all"
        >
          {logoUrl ? (
            <Image src={logoUrl} alt="Company logo" fill className="object-cover" sizes="96px" />
          ) : (
            <span className="text-white font-black text-4xl select-none">{companyInitial}</span>
          )}
        </div>

        {/* Camera overlay on hover */}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center focus:opacity-100"
          aria-label="Upload company logo"
        >
          {uploading
            ? <Loader2 size={22} className="text-white animate-spin" />
            : <Camera size={22} className="text-white" />}
        </button>

        {/* Remove button — only shown when a logo exists */}
        {logoUrl && !uploading && (
          <button
            type="button"
            onClick={async (e) => {
              e.stopPropagation()
              // Optimistically clear — no separate delete API needed;
              // they can re-upload. Just clear from DB via PATCH profile.
              setLogoUrl(null)
              onUploaded?.("")
              await fetch("/api/employer/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logoUrl: "" }),
              })
            }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors z-10"
            title="Remove logo"
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />

      <div className="text-center">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="text-xs font-semibold text-[#1a3461] hover:underline disabled:opacity-50"
        >
          {uploading ? "Uploading…" : logoUrl ? "Change Logo" : "Upload Logo"}
        </button>
        <p className="text-[11px] text-gray-400 mt-0.5">JPG, PNG or WebP · max 2 MB</p>
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center max-w-[200px]">{error}</p>
      )}
    </div>
  )
}
