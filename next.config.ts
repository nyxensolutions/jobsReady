import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase storage — avatars bucket (employer logos, seeker photos)
        protocol: "https",
        hostname: "akziowlvsowdybpzuifo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
}

export default withNextIntl(nextConfig)
