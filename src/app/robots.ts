import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Authenticated areas and API routes carry no search value. Note this
        // deliberately does NOT blanket-block /employer/ — /employer/register
        // is a public landing page and is listed in the sitemap.
        disallow: [
          "/api/",
          "/admin",
          "/seeker/",
          "/employer/dashboard",
          "/employer/post-job",
          "/employer/profile",
          "/employer/candidates",
          "/employer/jobs",
          "/employer/responses",
          "/auth/",
          "/login",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
