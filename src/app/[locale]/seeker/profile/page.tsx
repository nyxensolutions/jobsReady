import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import SeekerProfileClient from "@/components/seeker/SeekerProfileClient"

export default async function SeekerProfilePage() {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, profile, cities] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.seekerProfile.findUnique({ where: { userId: session.uid } }),
    prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { name: true } }),
  ])
  if (!dbUser || dbUser.role !== "SEEKER") redirect("/login")

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
        openToRelocate: profile.openToRelocate,
        preferredCities: profile.preferredCities,
        languages: profile.languages,
        photoUrl: profile.photoUrl ?? null,
        resumeUrl: profile.resumeUrl ?? null,
      } : null}
      phone={dbUser.phone}
      cities={cities.map(c => c.name)}
    />
  )
}
