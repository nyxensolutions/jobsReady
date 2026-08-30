import type { Metadata } from "next"
import { Link } from "@/i18n/navigation"
import { Mail, MapPin, Clock, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with Jobs24India support team. We're here to help job seekers and employers.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-[#1a3461] mb-3">Contact Us</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Have a question or need help? Our team is ready to assist job seekers and employers alike.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Contact Info */}
          <div className="flex flex-col gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-[#1a3461] mb-5">Get in Touch</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-[#1a3461]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email Support</p>
                    <a href="mailto:support@jobs24india.com" className="text-sm font-semibold text-[#1a3461] hover:underline">
                      support@jobs24india.com
                    </a>
                    <p className="text-xs text-gray-400 mt-0.5">Response within 24 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-[#1a3461]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Employer Queries</p>
                    <a href="mailto:employers@jobs24india.com" className="text-sm font-semibold text-[#1a3461] hover:underline">
                      employers@jobs24india.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-[#1a3461]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Support Hours</p>
                    <p className="text-sm font-semibold text-gray-700">Mon – Sat, 9 AM – 6 PM IST</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#eef2ff] flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-[#1a3461]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Company</p>
                    <p className="text-sm font-semibold text-gray-700">NyxenCloud Solutions Private Limited</p>
                    <a href="https://www.nyxensolutions.net" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      www.nyxensolutions.net
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Grievance Officer */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <h3 className="font-bold text-amber-800 text-sm">Grievance Officer</h3>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed mb-3">
                As per the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021,
                you may contact our Grievance Officer for any complaints or concerns:
              </p>
              <div className="text-xs text-amber-800 space-y-1">
                <p><strong>Name:</strong> S Verma</p>
                <p><strong>Designation:</strong> Grievance Officer</p>
                <p><strong>Email:</strong>{" "}
                  <a href="mailto:grievance@jobs24india.com" className="underline">grievance@jobs24india.com</a>
                </p>
                <p><strong>Address:</strong> NyxenCloud Solutions Private Limited, B-402, Rail Vihar, Sector 3, Vasundhara, Ghaziabad, UP — 201012</p>
                <p className="text-amber-600 mt-2">Response time: Within 24 hours of receipt, resolved within 15 days.</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-bold text-[#1a3461] mb-5">Common Questions</h2>
            <div className="flex flex-col divide-y divide-gray-100">
              {[
                { q: "How do I apply for a job?", a: "Search for a job, click 'Apply Now', and log in with your mobile number via OTP. No email or CV needed." },
                { q: "Is Jobs24India free for job seekers?", a: "Yes, completely free. Job seekers can apply to unlimited jobs at no cost." },
                { q: "How do I post a job as an employer?", a: "Register your company, verify your email, and use the dashboard to post and manage job listings." },
                { q: "I didn't receive my OTP. What should I do?", a: "Wait 60 seconds and retry. If the issue persists, email us at support@jobs24india.com with your mobile number." },
                { q: "How do I delete my account?", a: "Go to your Profile page and scroll to the bottom — there is a 'Delete Account' button. Alternatively, call or email us at support@jobs24india.com." },
                { q: "How do I report a fraudulent job posting?", a: "Click 'Report' on the job listing, or email grievance@jobs24india.com with the job ID and details." },
              ].map(({ q, a }) => (
                <div key={q} className="py-3.5">
                  <p className="text-sm font-semibold text-gray-800 mb-1">{q}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 mb-3">Still need help?</p>
              <a
                href="mailto:support@jobs24india.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a3461] hover:bg-[#142a52] text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Mail size={14} /> Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
