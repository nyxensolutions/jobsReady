import { redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"
import SeekerProfileClient from "@/components/seeker/SeekerProfileClient"

/** Category names are columns, not translation keys, so pick by locale here. */
const CATEGORY_NAME_FIELD: Record<string, "nameEn" | "nameHi" | "nameTe" | "nameTa" | "nameKn" | "nameBn" | "namePa"> = {
  hi: "nameHi", te: "nameTe", ta: "nameTa", kn: "nameKn", bn: "nameBn", pa: "namePa",
}

export default async function SeekerProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await getServerSession()
  if (!session) redirect("/login")

  const [dbUser, profile, cities, categories] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.seekerProfile.findUnique({ where: { userId: session.uid } }),
    prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { name: true } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, nameEn: true, nameHi: true, nameTe: true, nameTa: true, nameKn: true, nameBn: true, namePa: true },
    }),
  ])
  if (!dbUser) redirect("/login")

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
        preferredCategories: profile.preferredCategories,
        languages: profile.languages,
        photoUrl: profile.photoUrl ?? null,
        resumeUrl: profile.resumeUrl ?? null,
      } : null}
      phone={dbUser.phone}
      cities={cities.map(c => c.name)}
      categories={categories.map(c => ({
        slug: c.slug,
        name: c[CATEGORY_NAME_FIELD[locale] ?? "nameEn"] || c.nameEn,
      }))}
    />
  )
}
