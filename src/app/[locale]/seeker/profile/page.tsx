import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import SeekerProfileForm from "@/components/seeker/SeekerProfileForm"

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
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="mb-7">
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Keep your profile updated to get more interview calls</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <SeekerProfileForm
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
            cities={cities.map((c) => c.name)}
          />
        </div>
      </div>
    </div>
  )
}
