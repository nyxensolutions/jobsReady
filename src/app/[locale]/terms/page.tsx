import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Jobs24India by NyxenCloud Solutions Private Limited Read the rules governing your use of our job platform.",
}

const LAST_UPDATED = "1 July 2026"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">

          <h1 className="text-2xl sm:text-3xl font-black text-[#1a3461] mb-2">Terms of Use</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: {LAST_UPDATED}</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-8">

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using the Jobs24India platform ("<strong>Platform</strong>") — including the website
                jobs24india.com and any associated mobile application — you agree to be bound by these Terms of Use
                ("<strong>Terms</strong>") and our <a href="/privacy" className="text-blue-700 hover:underline">Privacy Policy</a>.
              </p>
              <p className="mt-3">
                The Platform is owned and operated by <strong>NyxenCloud Solutions Private Limited</strong>
                ("<strong>Company</strong>", "<strong>we</strong>", or "<strong>us</strong>").
                If you do not agree to these Terms, you must not use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">2. Eligibility</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You must be at least 18 years of age to use the Platform.</li>
                <li>Employers must be legally registered entities or individuals operating a lawful business in India.</li>
                <li>Job Seekers must be legally eligible to work in India.</li>
                <li>By using the Platform, you represent and warrant that you meet these eligibility requirements.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">3. Account Registration</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Job Seekers register using a valid Indian mobile number and OTP verification.</li>
                <li>Employers register using a valid business email address.</li>
                <li>You are responsible for maintaining the security of your account and all activities under it.</li>
                <li>You must provide accurate and current information and update it as needed.</li>
                <li>One person may not maintain multiple accounts. Duplicate accounts may be removed without notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">4. Job Seeker Terms</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Job Seekers may use the Platform to search and apply for jobs, create and maintain a profile, and receive notifications about job opportunities.</li>
                <li>Your profile information, including name, contact number, and experience, will be shared with employers when you apply for a job.</li>
                <li>You agree that the information in your profile is accurate and does not infringe any third-party rights.</li>
                <li>Jobs24India is a free service for job seekers. We will never charge you to apply for a job.</li>
                <li>We do not guarantee employment or interview calls. The hiring decision rests solely with the employer.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">5. Employer Terms</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Employers may post job listings, review applications, shortlist candidates, and contact them directly.</li>
                <li>All job listings must be for genuine, lawful employment opportunities within India.</li>
                <li>Employers must not post fraudulent, misleading, or discriminatory job listings.</li>
                <li>Employers must not use candidate contact information obtained through the Platform for any purpose other than the specific recruitment need.</li>
                <li>Employers shall not request any fee, deposit, or advance payment from job seekers as a condition of employment.</li>
                <li>We reserve the right to remove any listing that violates these Terms or Indian labour laws without notice.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">6. Prohibited Activities</h2>
              <p>You must not use the Platform to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-3">
                <li>Post fraudulent, fake, or misleading job listings or profiles</li>
                <li>Collect personal data of other users for purposes outside the Platform</li>
                <li>Send spam, unsolicited messages, or promotional material to other users</li>
                <li>Impersonate any person or organization</li>
                <li>Charge job seekers any fee for employment referral or placement</li>
                <li>Upload malware, viruses, or any code that could damage the Platform</li>
                <li>Circumvent or attempt to circumvent any security features of the Platform</li>
                <li>Use automated bots, scrapers, or crawlers to access Platform content</li>
                <li>Post content that is obscene, defamatory, threatening, or violates applicable law</li>
                <li>Violate any applicable Indian law, including the Employment Exchanges Act, Contract Labour Act, or any state-specific labour laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">7. Platform Content and Intellectual Property</h2>
              <p>
                All content on the Platform — including logos, design, text, graphics, and software — is the property
                of NyxenCloud Solutions Private Limited and is protected under Indian copyright law.
                You may not copy, reproduce, or distribute any part of the Platform without our written consent.
              </p>
              <p className="mt-3">
                User-generated content (profiles, job listings) remains the property of the user who created it.
                By submitting content to the Platform, you grant us a non-exclusive, royalty-free, worldwide licence
                to use, display, and distribute that content as part of operating the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">8. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided on an "as is" and "as available" basis without warranties of any kind,
                express or implied. We do not warrant that the Platform will be uninterrupted, error-free, or free of
                viruses. Job listings are posted by independent employers; we do not verify the accuracy, legality, or
                safety of any listing and are not responsible for any harm arising from employer-seeker interactions.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">9. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by Indian law, NyxenCloud Solutions Private Limited and its directors,
                employees, and agents shall not be liable for any indirect, incidental, special, or consequential
                damages arising from your use of the Platform, including but not limited to loss of earnings,
                data loss, or fraud perpetrated by other users.
              </p>
              <p className="mt-3">
                Our total liability for any claim arising from your use of the Platform shall not exceed
                ₹1,000 (one thousand rupees).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">10. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time, without prior notice,
                for violation of these Terms or for any conduct we deem harmful to other users or the Platform.
                You may terminate your account by emailing <a href="mailto:support@jobs24india.com" className="text-blue-700 hover:underline">support@jobs24india.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">11. Governing Law and Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India.
                Any dispute arising from or relating to these Terms shall first be attempted to be resolved
                through amicable negotiation. If unresolved, disputes shall be subject to the exclusive jurisdiction
                of the courts located in India.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">12. Grievance Officer</h2>
              <p>
                As required under the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021,
                you may raise concerns with our Grievance Officer:
              </p>
              <div className="mt-3 bg-gray-50 rounded-xl border border-gray-100 p-4 text-sm space-y-1">
                <p><strong>Name:</strong> S Verma</p>
                <p><strong>Email:</strong> <a href="mailto:grievance@jobs24india.com" className="text-blue-700 hover:underline">grievance@jobs24india.com</a></p>
                <p><strong>Address:</strong> NyxenCloud Solutions Private Limited, B-402, Rail Vihar, Sector 3, Vasundhara, Ghaziabad, UP — 201012, India</p>
                <p className="text-gray-500 mt-2">Complaints acknowledged within 24 hours, resolved within 15 days.</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">13. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. Continued use of the Platform after changes are posted
                constitutes acceptance of the revised Terms. We recommend reviewing this page periodically.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-3">14. Contact</h2>
              <p>
                Questions about these Terms? Email <a href="mailto:legal@jobs24india.com" className="text-blue-700 hover:underline">legal@jobs24india.com</a>{" "}
                or visit our <a href="/contact" className="text-blue-700 hover:underline">Contact page</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
