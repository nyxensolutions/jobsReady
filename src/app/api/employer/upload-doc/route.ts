import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "@/lib/firebase/session"
import { supabaseStorage } from "@/lib/supabase/storage"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Employer account required" }, { status: 403 })
  }

  const employer = await prisma.employerProfile.findUnique({ where: { userId: session.uid } })
  if (!employer) return NextResponse.json({ error: "Profile not found" }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get("doc") as File | null
  const docType = formData.get("docType") as string | null

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (!docType) return NextResponse.json({ error: "Document type required" }, { status: 400 })

  const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ error: "Only PDF or image files allowed" }, { status: 400 })
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 })
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf"
  const path = `employers/${session.uid}/docs/${docType.replace(/\s+/g, "_")}_${Date.now()}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: uploadError } = await supabaseStorage.storage
    .from("avatars")
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error("[employer doc upload]", uploadError.message)
    return NextResponse.json({ error: "Upload failed: " + uploadError.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabaseStorage.storage.from("avatars").getPublicUrl(path)

  const existing = employer.docUrls ?? []
  await prisma.employerProfile.update({
    where: { userId: session.uid },
    data: { docUrls: [...existing, publicUrl] },
  })

  return NextResponse.json({ docUrl: publicUrl, docType })
}
