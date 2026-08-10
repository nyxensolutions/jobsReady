import { MetadataRoute } from "next"
import { prisma } from "@/lib/db"
import { SITE_URL, languageAlternates } from "@/lib/seo"
import { getAllPosts, BLOG_CATEGORIES } from "@/lib/blog"

export const dynamic = "force-dynamic"

const APP_URL = SITE_URL

/** Every URL carries its hreflang set so the 8 locales are never read as duplicates. */
function withAlternates(path: string) {
  return { languages: languageAlternates(path) }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await prisma.jobListing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
    take: 5000,
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1, alternates: withAlternates("/") },
    { url: `${APP_URL}/jobs`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9, alternates: withAlternates("/jobs") },
    { url: `${APP_URL}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8, alternates: withAlternates("/categories") },
    { url: `${APP_URL}/cities`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8, alternates: withAlternates("/cities") },
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8, alternates: withAlternates("/blog") },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5, alternates: withAlternates("/about") },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5, alternates: withAlternates("/contact") },
    { url: `${APP_URL}/employer/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6, alternates: withAlternates("/employer/register") },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/privacy") },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3, alternates: withAlternates("/terms") },
  ]

  // Only list blog categories that actually have posts — empty pages waste crawl budget.
  const posts = getAllPosts()
  const blogCategoryRoutes: MetadataRoute.Sitemap = BLOG_CATEGORIES.filter((category) =>
    posts.some((post) => post.category === category.slug)
  ).map((category) => ({
    url: `${APP_URL}/blog/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
    alternates: withAlternates(`/blog/${category.slug}`),
  }))

  const blogPostRoutes: MetadataRoute.Sitemap = posts.map((post) => {
    const path = `/blog/${post.category}/${post.slug}`
    return {
      url: `${APP_URL}${path}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: withAlternates(path),
    }
  })

  const jobRoutes: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${APP_URL}/jobs/${job.id}`,
    lastModified: job.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...blogCategoryRoutes, ...blogPostRoutes, ...jobRoutes]
}
