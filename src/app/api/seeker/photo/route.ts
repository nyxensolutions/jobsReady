import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { supabaseStorage } from "@/lib/supabase/storage"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "SEEKER") {
    return NextResponse.json({ error: "Not a seeker account" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("photo") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
  }

  if (file.size > 2 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const path = `seekers/${session.uid}/photo.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabaseStorage.storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error("[photo upload] storage error:", uploadError.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseStorage.storage.from("avatars").getPublicUrl(path)

  const existing = await prisma.seekerProfile.findUnique({ where: { userId: session.uid }, select: { name: true } })
  await prisma.seekerProfile.upsert({
    where: { userId: session.uid },
    create: { userId: session.uid, name: existing?.name ?? "", photoUrl: publicUrl },
    update: { photoUrl: publicUrl },
  })

  return NextResponse.json({ photoUrl: publicUrl })
}
