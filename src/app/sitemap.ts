import { MetadataRoute } from "next"
import { prisma } from "@/lib/db"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://jobsready.in"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await prisma.jobListing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${APP_URL}/employer/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${APP_URL}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...jobRoutes]
}
