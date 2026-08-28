import { Link } from "@/i18n/navigation"
import { Mail } from "lucide-react"

type Props = {
  searchParams: Promise<{ email?: string }>
}

export default async function CheckEmailPage({ searchParams }: Props) {
  const { email } = await searchParams

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center max-w-sm w-full">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <Mail size={28} className="text-blue-700" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-sm text-gray-500 mb-1">
          We sent a sign-in link to
        </p>
        {email && (
          <p className="text-sm font-semibold text-gray-800 mb-5">{email}</p>
        )}
        <p className="text-xs text-gray-400 mb-7">
          Click the link in the email to sign in to your employer account. The link expires in 24 hours.
        </p>
        <Link
          href="/login"
          className="text-sm text-blue-700 font-medium hover:underline"
        >
          ← Back to login
        </Link>
      </div>
    </div>
  )
}
