import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"

export const metadata: Metadata = {
  title: "Delete Your Account",
  description:
    "How to delete your Jobs24India account and the data associated with it, from the app or by contacting us.",
}

/**
 * Google Play requires a publicly reachable page explaining account deletion
 * for any app that lets people create an account, and it has to work without
 * installing the app. The in-app route already exists under Settings; this
 * documents it and gives a path for someone who has uninstalled.
 */
export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-2">
            Delete your Jobs24India account
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            You can delete your account at any time. It is free, and you do not need to contact
            anyone first.
          </p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">From the app</h2>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li>Open the Jobs24India app and sign in.</li>
                <li>Go to <strong>Profile</strong>, then <strong>Settings</strong>.</li>
                <li>Scroll to the bottom and tap <strong>Delete Account</strong>.</li>
                <li>Confirm. Your account is deleted straight away.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">From the website</h2>
              <p>
                Sign in at{" "}
                <Link href="/login" className="text-[#1a3461] font-semibold underline">
                  jobs24india.com
                </Link>
                , open your profile page and use <strong>Delete Account</strong> at the bottom.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">
                If you no longer have the app
              </h2>
              <p>
                Email{" "}
                <a
                  href="mailto:support@jobs24india.com?subject=Account%20deletion%20request"
                  className="text-[#1a3461] font-semibold underline"
                >
                  support@jobs24india.com
                </a>{" "}
                from the address on your account, or include your registered mobile number. We will
                verify the request and delete the account within 7 working days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">What gets deleted</h2>
              <p className="mb-2">Deleting your account permanently removes:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Your profile — name, photo, city, skills, experience and preferences</li>
                <li>Your uploaded resume and any documents</li>
                <li>Your saved jobs and job alert preferences</li>
                <li>Your contact details, including mobile number and email address</li>
                <li>Your notification history and push notification tokens</li>
                <li>
                  For employers: your company profile, verification documents and job listings
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">What we keep, and why</h2>
              <p>
                Applications you have already sent remain visible to the employer who received
                them, without your contact details, because they form part of that employer&apos;s
                own hiring record. Anonymised usage counts that cannot identify you may be retained.
                Where Indian law requires us to keep transaction or tax records, we keep only those
                records, for as long as the law requires.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">Deletion is permanent</h2>
              <p>
                Deleted accounts cannot be restored. If you sign up again later you will start with
                a new, empty profile.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">Questions</h2>
              <p>
                Email{" "}
                <a
                  href="mailto:support@jobs24india.com"
                  className="text-[#1a3461] font-semibold underline"
                >
                  support@jobs24india.com
                </a>{" "}
                or see our{" "}
                <Link href="/privacy" className="text-[#1a3461] font-semibold underline">
                  Privacy Policy
                </Link>
                . Jobs24India is operated by NyxenCloud Solutions Private Limited.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
