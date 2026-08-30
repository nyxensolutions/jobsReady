import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"

export const metadata: Metadata = {
  title: "Cookie Policy — Jobs24India",
  description:
    "Cookie Policy for Jobs24India by NyxenCloud Solutions Private Limited Learn what cookies we use, why we use them, and how to manage your preferences.",
}

const LAST_UPDATED = "10 August 2026"

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">

          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-2">Cookie Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files placed on your device (computer, smartphone, or tablet) by websites you visit.
                They are widely used to make websites work efficiently, to remember your preferences, and to provide information
                to the website operators.
              </p>
              <p className="mt-3">
                This Cookie Policy explains how <strong>NyxenCloud Solutions Private Limited</strong> ("<strong>we</strong>",
                "<strong>us</strong>", "<strong>our</strong>") uses cookies and similar tracking technologies on the
                <strong> Jobs24India</strong> platform at <strong>jobs24india.com</strong> and related mobile applications
                (collectively, the "<strong>Platform</strong>").
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">2. Types of Cookies We Use</h2>

              <div className="space-y-5">
                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-1">2.1 Strictly Necessary Cookies</h3>
                  <p className="text-sm">
                    These cookies are essential for the Platform to function correctly. They include session authentication
                    cookies that keep you logged in as you navigate between pages. Without these cookies, services you have
                    asked for (such as accessing your dashboard) cannot be provided.
                  </p>
                  <p className="text-sm mt-2 text-gray-500">
                    <strong>Examples:</strong> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">__session</code> (secure HTTP-only session token),
                    CSRF protection tokens.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Can you opt out?</strong> No — these are required for the Platform to operate.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-1">2.2 Performance &amp; Analytics Cookies</h3>
                  <p className="text-sm">
                    These cookies collect anonymised information about how visitors use the Platform — which pages are visited
                    most often, where users come from, and how they interact with search results and job listings. The data
                    helps us improve site performance and user experience.
                  </p>
                  <p className="text-sm mt-2 text-gray-500">
                    <strong>Examples:</strong> Vercel Analytics (privacy-friendly, no cross-site tracking), page-view counters.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Can you opt out?</strong> Yes — see Section 5 on how to manage cookies.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-1">2.3 Functionality Cookies</h3>
                  <p className="text-sm">
                    These cookies remember choices you make — such as your language preference or city — so we can provide
                    a more personalised experience on return visits.
                  </p>
                  <p className="text-sm mt-2 text-gray-500">
                    <strong>Examples:</strong> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">locale</code> (language preference),
                    recent search history stored locally.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Can you opt out?</strong> Yes, though some features (like saved language) may not work correctly.
                  </p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4">
                  <h3 className="font-bold text-gray-800 text-sm mb-1">2.4 Third-Party &amp; Payment Cookies</h3>
                  <p className="text-sm">
                    When you make a payment (e.g., purchasing a subscription plan), our payment processor Razorpay may set
                    cookies on your device for fraud-prevention and payment-flow continuity. These are governed by
                    Razorpay's own privacy and cookie policies.
                  </p>
                  <p className="text-sm mt-2 text-gray-500">
                    <strong>Third parties:</strong> Razorpay Payments Pvt. Ltd.
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Can you opt out?</strong> These cookies are necessary for payment processing and cannot be disabled
                    during a payment session.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">3. Cookies We Do Not Use</h2>
              <p>
                We do not use:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>Advertising or retargeting cookies (Google Ads, Meta Pixel, etc.)</li>
                <li>Social-media tracking pixels</li>
                <li>Cross-site behavioural profiling cookies</li>
                <li>Third-party analytics that share your data with advertisers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">4. How Long Do Cookies Last?</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Cookie</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Type</th>
                      <th className="px-3 py-2 border border-gray-200 font-semibold text-gray-700">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200"><code className="bg-gray-100 px-1 rounded text-xs">__session</code></td>
                      <td className="px-3 py-2 border border-gray-200">Strictly Necessary</td>
                      <td className="px-3 py-2 border border-gray-200">14 days (or until you sign out)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-3 py-2 border border-gray-200"><code className="bg-gray-100 px-1 rounded text-xs">locale</code></td>
                      <td className="px-3 py-2 border border-gray-200">Functionality</td>
                      <td className="px-3 py-2 border border-gray-200">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 border border-gray-200">Vercel Analytics</td>
                      <td className="px-3 py-2 border border-gray-200">Performance</td>
                      <td className="px-3 py-2 border border-gray-200">Session (no persistent cookie)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-3 py-2 border border-gray-200">Razorpay</td>
                      <td className="px-3 py-2 border border-gray-200">Third-Party / Payment</td>
                      <td className="px-3 py-2 border border-gray-200">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">5. Managing Your Cookie Preferences</h2>
              <p>
                You can control and delete cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                <li>See what cookies are stored and delete them individually</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies from specific websites</li>
                <li>Block all cookies from all websites</li>
                <li>Delete all cookies when you close the browser</li>
              </ul>
              <p className="mt-3 text-sm">
                Please note that blocking all cookies will prevent some parts of the Platform from working correctly —
                in particular, you will not be able to sign in if the session cookie is blocked.
              </p>
              <div className="mt-4 bg-[#eef2ff] border border-[#dde5ff] rounded-xl p-4 text-sm text-[#1a3461]">
                <p className="font-semibold mb-1">Browser cookie settings:</p>
                <ul className="space-y-1 text-[#2a4a7f]">
                  <li>
                    <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                  </li>
                  <li>
                    <strong>Firefox:</strong> Options → Privacy &amp; Security → Cookies and Site Data
                  </li>
                  <li>
                    <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                  </li>
                  <li>
                    <strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">6. Local Storage</h2>
              <p>
                In addition to cookies, we may use the browser's <strong>localStorage</strong> to store lightweight
                preferences (e.g., recently viewed job categories) entirely on your device. This data is never transmitted
                to our servers and is cleared when you clear your browser site data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">7. Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our
                practices. When we make changes, we will update the "Last updated" date at the top of this page.
                We encourage you to review this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">8. Contact Us</h2>
              <p>
                If you have questions about this Cookie Policy or our use of cookies, please contact us at:
              </p>
              <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm space-y-1">
                <p><strong>NyxenCloud Solutions Private Limited</strong></p>
                <p>Email: <a href="mailto:support@jobs24india.com" className="text-[#1a3461] hover:underline">support@jobs24india.com</a></p>
                <p>Website: <a href="https://jobs24india.com" className="text-[#1a3461] hover:underline">jobs24india.com</a></p>
              </div>
              <p className="mt-4">
                You may also view our{" "}
                <Link href="/privacy" className="text-[#1a3461] hover:underline font-medium">Privacy Policy</Link>
                {" "}and{" "}
                <Link href="/terms" className="text-[#1a3461] hover:underline font-medium">Terms of Use</Link>
                {" "}for more information on how we handle your data.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
