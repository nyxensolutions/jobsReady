import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "@/lib/admin"
import { supabaseStorage } from "@/lib/supabase/storage"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  if (!await assertAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get("logo") as File | null
  const userId = formData.get("userId") as string | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `employers/${userId}/logo.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabaseStorage.storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error("[admin/upload-logo] storage error:", uploadError.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseStorage.storage.from("avatars").getPublicUrl(path)
  const logoUrl = `${publicUrl}?t=${Date.now()}`

  await prisma.employerProfile.update({
    where: { userId },
    data: { logoUrl },
  })

  return NextResponse.json({ logoUrl })
}
