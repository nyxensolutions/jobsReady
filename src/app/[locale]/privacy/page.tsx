import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Jobs24India by NyxenCloud Solution Pvt. Ltd. Learn how we collect, use, and protect your personal data.",
}

const LAST_UPDATED = "1 July 2026"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">

          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">1. Introduction</h2>
              <p>
                NyxenCloud Solution Pvt. Ltd. ("<strong>Company</strong>", "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>")
                operates the Jobs24India platform available at <strong>jobs24india.com</strong> and related mobile applications
                (collectively, the "<strong>Platform</strong>").
              </p>
              <p className="mt-3">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.
                By using Jobs24India, you agree to the collection and use of information as described in this policy.
                If you do not agree, please discontinue use of the Platform.
              </p>
              <p className="mt-3">
                This policy complies with the Information Technology Act, 2000, IT (Amendment) Act, 2008,
                IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011,
                and the Digital Personal Data Protection Act, 2023 (DPDP Act).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">2. Information We Collect</h2>
              <h3 className="font-semibold text-gray-700 mb-2">2.1 Information You Provide</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Job Seekers:</strong> Mobile number, name, date of birth, gender, current location/city, work experience, skills, preferred job categories, education qualification, languages known, profile photo (optional).</li>
                <li><strong>Employers:</strong> Company name, business email address, company description, contact phone number, city of operation, company registration details (if provided).</li>
                <li><strong>All Users:</strong> Communications you send us (support emails, feedback forms).</li>
              </ul>
              <h3 className="font-semibold text-gray-700 mt-4 mb-2">2.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Device information (device type, OS version, browser type)</li>
                <li>IP address and approximate location</li>
                <li>Usage data (pages visited, buttons clicked, search queries, time spent)</li>
                <li>Cookies and similar tracking technologies (see Section 7)</li>
              </ul>
              <h3 className="font-semibold text-gray-700 mt-4 mb-2">2.3 Payment Information (Employers Only)</h3>
              <p className="text-sm mb-2">
                When employers purchase a subscription plan, payments are processed by <strong>Razorpay</strong>.
                We receive a payment confirmation token and order ID. We do not store card numbers, UPI IDs,
                or bank account details on our servers — these are handled entirely by Razorpay.
              </p>
              <h3 className="font-semibold text-gray-700 mt-4 mb-2">2.4 Information from Third Parties</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>OTP verification data from our SMS service provider (Fast2SMS)</li>
                <li>Authentication data from Supabase (our authentication provider)</li>
                <li>Payment status and order details from Razorpay Payments Pvt. Ltd.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To create and manage your account on the Platform</li>
                <li>To display your profile to potential employers (job seekers) or display job listings to candidates (employers)</li>
                <li>To send OTP messages for authentication</li>
                <li>To notify you of new job matches, application status updates, and shortlisting decisions</li>
                <li>To send transactional emails (application received, magic link sign-in)</li>
                <li>To improve the Platform through analytics and usage data</li>
                <li>To enforce our Terms of Use and prevent fraud</li>
                <li>To comply with applicable Indian law and court orders</li>
              </ul>
              <p className="mt-3 text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
                <strong>Note:</strong> We do not sell your personal data to third parties. We do not use your data for targeted advertising.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">4. Sharing of Information</h2>
              <p>We share your information only in the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li><strong>With Employers (Job Seekers only):</strong> When you apply for a job, your profile information (name, phone, experience, skills) is shared with the employer who posted that job.</li>
                <li><strong>With Job Seekers (Employers only):</strong> Your company name, job listings, and contact phone number are visible to registered job seekers.</li>
                <li><strong>Service Providers:</strong> We share data with Supabase (authentication), Fast2SMS (OTP), Resend (email), Razorpay (payment processing — employer subscription payments), and our hosting/database provider. These providers are bound by confidentiality agreements and their own privacy policies.</li>
                <li><strong>Legal Requirements:</strong> If required by law, court order, or government authority under Indian law.</li>
                <li><strong>Business Transfer:</strong> In the event of merger, acquisition, or sale of our business, your data may be transferred to the successor entity.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures including TLS/HTTPS encryption for all data transmission,
                hashed/encrypted storage of sensitive data, and role-based access controls. Our database is hosted on
                enterprise-grade cloud infrastructure with daily backups.
              </p>
              <p className="mt-3">
                However, no method of internet transmission or electronic storage is 100% secure. While we strive
                to use commercially acceptable means to protect your data, we cannot guarantee absolute security.
                In the event of a data breach that is likely to result in a risk to your rights, we will notify
                you and the relevant authorities as required under the DPDP Act, 2023.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">6. Your Rights (DPDP Act 2023)</h2>
              <p>Under the Digital Personal Data Protection Act, 2023, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete personal data.</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data (subject to legal retention requirements).</li>
                <li><strong>Grievance Redressal:</strong> Lodge a complaint with our Grievance Officer (see Section 9).</li>
                <li><strong>Nominate:</strong> Nominate another individual to exercise rights on your behalf in case of death or incapacity.</li>
              </ul>
              <p className="mt-3">
                To exercise any of these rights, email <a href="mailto:privacy@jobs24india.com" className="text-blue-700 hover:underline">privacy@jobs24india.com</a> from your registered contact.
                We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">7. Cookies and Tracking</h2>
              <p>We use the following types of cookies:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li><strong>Essential Cookies:</strong> Required for authentication and session management. Cannot be disabled.</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform (page views, search queries). Used to improve the product.</li>
              </ul>
              <p className="mt-3">We do not use advertising or third-party tracking cookies.</p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">8. Data Retention</h2>
              <p>
                We retain your personal data for as long as your account is active or as needed to provide services.
                Job seeker profiles are retained for 3 years after last activity. Employer accounts and job listings
                are retained for 5 years for legal compliance. You may request deletion at any time.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">9. Grievance Officer</h2>
              <p>
                In accordance with the Information Technology (Intermediary Guidelines) Rules, 2021,
                the name and contact details of our Grievance Officer are:
              </p>
              <div className="mt-3 bg-gray-50 rounded-xl border border-gray-100 p-4 text-sm space-y-1">
                <p><strong>Name:</strong> S Verma</p>
                <p><strong>Designation:</strong> Grievance Officer, NyxenCloud Solution Pvt. Ltd.</p>
                <p><strong>Email:</strong> <a href="mailto:grievance@jobs24india.com" className="text-blue-700 hover:underline">grievance@jobs24india.com</a></p>
                <p><strong>Address:</strong> B-402, Rail Vihar, Sector 3, Vasundhara, Ghaziabad, Uttar Pradesh — 201012, India</p>
                <p className="text-gray-500 mt-2">Complaints will be acknowledged within 24 hours and resolved within 15 days of receipt.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes
                by posting the new policy on the Platform and updating the "Last updated" date.
                Continued use of the Platform after changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">11. Contact</h2>
              <p>
                For privacy-related queries, email <a href="mailto:privacy@jobs24india.com" className="text-blue-700 hover:underline">privacy@jobs24india.com</a>.
                For general support, see our <a href="/contact" className="text-blue-700 hover:underline">Contact page</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
