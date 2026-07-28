import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "SEEKER") return NextResponse.json({ error: "Not a seeker account" }, { status: 403 })

  const formData = await req.formData()
  const file = formData.get("resume") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
  if (!allowed.includes(file.type)) return NextResponse.json({ error: "Only PDF or Word files allowed" }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "File must be under 5 MB" }, { status: 400 })

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf"
  const path = `seekers/${user.id}/resume.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error("[resume upload]", uploadError.message)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)

  const existing = await prisma.seekerProfile.findUnique({ where: { userId: user.id }, select: { name: true } })
  await prisma.seekerProfile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, name: existing?.name ?? "", resumeUrl: publicUrl },
    update: { resumeUrl: publicUrl },
  })

  return NextResponse.json({ resumeUrl: publicUrl })
}
