import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/seo"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const DESCRIPTION =
  "India's blue-collar job portal. Search lakhs of jobs in delivery, sales, security, driving and more."

export const metadata: Metadata = {
  // Required for relative OG/Twitter image URLs to resolve to absolute ones.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jobs24India — Find Jobs. Hire People.",
    template: "%s | Jobs24India",
  },
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Jobs24India — Find Jobs. Hire People.",
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobs24India — Find Jobs. Hire People.",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", rel: "shortcut icon" },
      { url: "/favicon/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/favicon/apple-touch-icon.png", sizes: "180x180" },
    other: [
      { rel: "manifest", url: "/favicon/site.webmanifest" },
    ],
  },
  appleWebApp: {
    title: "Jobs24India",
  },
}

// Site-wide structured data. Establishes the brand entity and the search action
// once, so every page inherits it instead of each route redeclaring it.
const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo-full.png") },
      description: DESCRIPTION,
      areaServed: { "@type": "Country", name: "India" },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-99536-99143",
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/jobs?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        {children}
      </body>
    </html>
  )
}
