import { redirect } from "next/navigation"

// Root path — next-intl middleware will redirect to /en or the detected locale.
// This page is a safety fallback.
export default function RootPage() {
  redirect("/en")
}
