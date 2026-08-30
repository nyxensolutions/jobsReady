import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy — Jobs24India",
  description:
    "Cancellation and Refund Policy for Jobs24India subscription plans. Understand how to cancel your plan, eligibility for refunds, and our payment terms.",
}

const LAST_UPDATED = "28 August 2026"

export default function CancellationPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">

          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-2">Cancellation &amp; Refund Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">1. Overview</h2>
              <p>
                This Cancellation &amp; Refund Policy applies to all paid subscription plans and services purchased through
                the <strong>Jobs24India</strong> platform (<strong>jobs24india.com</strong>), operated by{" "}
                <strong>NyxenCloud Solutions Private Limited</strong> ("<strong>Company</strong>", "<strong>we</strong>", "<strong>us</strong>").
              </p>
              <p className="mt-3">
                By purchasing a subscription plan on Jobs24India, you acknowledge that you have read, understood, and
                agree to this policy. All payments are processed securely through <strong>Razorpay</strong>, a PCI-DSS
                compliant payment gateway.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">2. Subscription Plans</h2>
              <p>Jobs24India offers paid plans for employers on a prepaid basis. Plans include:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li><strong>Fixed-term plans</strong> (e.g., 30-day, 60-day, 90-day) — paid in full at the time of purchase and valid for the stated duration.</li>
                <li><strong>Credits-based features</strong> — candidate contact unlocks and job boosts are consumed from your plan balance as you use them.</li>
              </ul>
              <p className="mt-3">
                All plan prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes (GST).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">3. Cancellation Policy</h2>

              <h3 className="font-semibold text-gray-700 mt-4 mb-2">3.1 How to Cancel</h3>
              <p>
                To cancel your active subscription or discontinue renewal of a plan, please contact us at{" "}
                <a href="mailto:support@jobs24india.com" className="text-[#1a3461] hover:underline">support@jobs24india.com</a>{" "}
                with your registered email address, company name, and order details. We will process your cancellation
                request within <strong>2 business days</strong>.
              </p>

              <h3 className="font-semibold text-gray-700 mt-4 mb-2">3.2 Effect of Cancellation</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Upon cancellation, your plan will remain active until the end of the current billing period. You will not be charged again.</li>
                <li>Active job listings will remain visible until the plan expiry date.</li>
                <li>Unused candidate contact unlocks and boost credits will expire at the end of the plan period and will not carry over.</li>
                <li>You can continue to use free-tier features (1 job listing, no contact unlocks) after your plan expires.</li>
              </ul>

              <h3 className="font-semibold text-gray-700 mt-4 mb-2">3.3 Cancellation by Jobs24India</h3>
              <p>
                We reserve the right to cancel or suspend your account and subscription if you are found to be in
                violation of our{" "}
                <Link href="/terms" className="text-[#1a3461] hover:underline">Terms of Use</Link>,
                including but not limited to: posting fraudulent job listings, charging job seekers any fee for
                employment, or misusing candidate data. In such cases, no refund will be issued.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">4. Refund Policy</h2>

              <h3 className="font-semibold text-gray-700 mt-4 mb-2">4.1 General Rule — No Refunds</h3>
              <p>
                All subscription plan purchases on Jobs24India are <strong>non-refundable</strong> once the plan has been
                activated and access to premium features has been granted. This includes cases where:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>You did not use the features during the plan period</li>
                <li>You found a suitable candidate before the plan expired</li>
                <li>You no longer require hiring services</li>
                <li>Unused credits or unlocks remain at the time of cancellation</li>
              </ul>

              <h3 className="font-semibold text-gray-700 mt-4 mb-2">4.2 Exceptions — When a Refund May Be Issued</h3>
              <p>A full or partial refund may be considered in the following exceptional circumstances:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Duplicate payment:</strong> If your account was charged more than once for the same plan due to a
                  payment gateway error, the duplicate amount will be refunded in full within 7–10 business days.
                </li>
                <li>
                  <strong>Technical failure preventing access:</strong> If a verified technical issue on our end prevented
                  you from accessing any premium features for the entire duration of your plan, and we are unable to
                  resolve it within 5 business days, a pro-rated refund may be issued for the affected period.
                </li>
                <li>
                  <strong>Unauthorised transaction:</strong> If you report an unauthorised charge within 7 days of the
                  transaction, we will investigate and refund the amount if the claim is verified.
                </li>
              </ul>

              <h3 className="font-semibold text-gray-700 mt-4 mb-2">4.3 How to Request a Refund</h3>
              <p>
                To request a refund, email <a href="mailto:support@jobs24india.com" className="text-[#1a3461] hover:underline">support@jobs24india.com</a> within
                {" "}<strong>7 days</strong> of the payment date with:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Your registered email address and company name</li>
                <li>Razorpay Payment ID or Order ID (visible in your payment confirmation email)</li>
                <li>Reason for refund request</li>
              </ul>
              <p className="mt-3">
                We will acknowledge your request within 2 business days and issue a decision within 7 business days.
                Approved refunds will be credited to the original payment method within <strong>5–10 business days</strong>,
                subject to your bank's processing time.
              </p>

              <h3 className="font-semibold text-gray-700 mt-4 mb-2">4.4 Free-Tier Services</h3>
              <p>
                Jobs24India is free for job seekers. No payment is collected from job seekers, and this policy does
                not apply to them.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">5. Payment Gateway</h2>
              <p>
                All payments are processed by <strong>Razorpay Payments Pvt. Ltd.</strong>, a PCI-DSS Level 1 certified
                payment gateway. We do not store your card details on our servers. In case of a payment dispute, you
                may also contact Razorpay directly through their{" "}
                <a
                  href="https://razorpay.com/support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1a3461] hover:underline"
                >
                  support centre
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">6. Governing Law</h2>
              <p>
                This policy is governed by the laws of India, including the Consumer Protection Act, 2019.
                Any disputes shall be subject to the exclusive jurisdiction of courts in Ghaziabad, Uttar Pradesh, India.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">7. Contact Us</h2>
              <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-sm space-y-1">
                <p><strong>NyxenCloud Solutions Private Limited</strong></p>
                <p>Email: <a href="mailto:support@jobs24india.com" className="text-[#1a3461] hover:underline">support@jobs24india.com</a></p>
                <p>Address: B-402, Rail Vihar, Sector 3, Vasundhara, Ghaziabad, Uttar Pradesh — 201012, India</p>
                <p className="text-gray-500 mt-2">Support hours: Monday – Saturday, 10 AM – 6 PM IST</p>
              </div>
              <p className="mt-4 text-sm">
                You may also review our{" "}
                <Link href="/privacy" className="text-[#1a3461] hover:underline font-medium">Privacy Policy</Link>,{" "}
                <Link href="/terms" className="text-[#1a3461] hover:underline font-medium">Terms of Use</Link>, and{" "}
                <Link href="/cookie-policy" className="text-[#1a3461] hover:underline font-medium">Cookie Policy</Link>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
