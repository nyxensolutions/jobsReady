import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { supabaseStorage } from "@/lib/supabase/storage"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Employers only" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("logo") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `employers/${session.uid}/logo.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabaseStorage.storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error("[logo upload] storage error:", uploadError.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseStorage.storage.from("avatars").getPublicUrl(path)

  // Add a cache-busting timestamp so the browser reloads the image after re-upload
  const logoUrl = `${publicUrl}?t=${Date.now()}`

  await prisma.employerProfile.update({
    where: { userId: session.uid },
    data: { logoUrl },
  })

  return NextResponse.json({ logoUrl })
}
