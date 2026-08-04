import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import SeekerProfileClient from "@/components/seeker/SeekerProfileClient"

export default async function SeekerProfilePage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.uid } })
  if (!dbUser || dbUser.role !== "SEEKER") redirect("/login")

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: session.uid } })

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { name: true },
  })

  return (
    <SeekerProfileClient
      initial={profile ? {
        name: profile.name,
        city: profile.city ?? "",
        bio: profile.bio ?? "",
        skills: profile.skills,
        preferredJobTypes: profile.preferredJobTypes,
        experienceYears: profile.experienceYears,
        isOpenToWork: profile.isOpenToWork,
        photoUrl: profile.photoUrl ?? null,
        resumeUrl: profile.resumeUrl ?? null,
      } : null}
      phone={dbUser.phone}
      cities={cities.map(c => c.name)}
    />
  )
}
