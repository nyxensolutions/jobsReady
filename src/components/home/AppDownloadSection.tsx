import Image from "next/image"

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.nyxensolutions.jobs24india"
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=1a3461&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(PLAY_STORE_URL)}`

export default function AppDownloadSection() {
  return (
    <section className="relative overflow-hidden bg-[#0f2347] py-16 sm:py-20">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#f97316]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left: copy + QR ── */}
          <div>
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f97316]/15 px-3 py-1 text-xs font-semibold text-[#f97316] mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f97316] animate-pulse" />
              Now on Google Play
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
              Find jobs faster —{" "}
              <span className="text-[#f97316]">on your phone</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-md">
              Browse thousands of verified jobs, apply in one tap, and track your applications — all from the Jobs24India app. Free. Fast. No CV needed.
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-3 mb-10">
              {[
                "100% Free to use",
                "OTP login — no password",
                "Hindi & 7 more languages",
                "Call HR directly",
              ].map((f) => (
                <span key={f} className="flex items-center gap-1.5 text-sm text-gray-300 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <svg className="text-green-400 shrink-0" width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2 6.5L5.2 9.5L11 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {f}
                </span>
              ))}
            </div>

            {/* QR + badge row */}
            <div className="flex items-center gap-6 flex-wrap">
              {/* QR code */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white rounded-2xl p-2.5 shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={QR_URL}
                    alt="QR code to download Jobs24India on Google Play"
                    width={120}
                    height={120}
                    className="block rounded-lg"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">Scan to download</p>
              </div>

              {/* Divider */}
              <div className="flex flex-col items-center gap-1 self-stretch py-2">
                <div className="w-px flex-1 bg-white/10" />
                <span className="text-xs text-gray-600">or</span>
                <div className="w-px flex-1 bg-white/10" />
              </div>

              {/* Play Store badge */}
              <div className="flex flex-col gap-3">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get Jobs24India on Google Play"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    width={180}
                    height={54}
                    className="block"
                  />
                </a>
                <p className="text-xs text-gray-600 pl-1">Free · Android · 4.5★</p>
              </div>
            </div>
          </div>

          {/* ── Right: phone mockup ── */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-72 h-[520px] sm:w-80 sm:h-[580px]">

              {/* Back phone — screenshot 2, tilted */}
              <div className="absolute right-0 top-6 w-56 sm:w-64 rounded-[2.5rem] overflow-hidden border-[6px] border-white/10 shadow-2xl rotate-6 origin-bottom-left opacity-70">
                <div className="bg-gray-900 h-5 flex items-center justify-center">
                  <div className="w-16 h-1.5 rounded-full bg-white/20" />
                </div>
                <Image
                  src="/app-screen-2.jpg"
                  alt="Jobs24India app — browse jobs"
                  width={280}
                  height={560}
                  className="w-full object-cover object-top"
                  style={{ maxHeight: "460px" }}
                />
              </div>

              {/* Front phone — screenshot 1, straight */}
              <div className="absolute left-0 top-0 w-56 sm:w-64 rounded-[2.5rem] overflow-hidden border-[6px] border-white/20 shadow-[0_32px_80px_rgba(0,0,0,0.7)] -rotate-3">
                {/* Notch */}
                <div className="bg-black h-7 flex items-center justify-center relative">
                  <div className="w-20 h-4 rounded-b-2xl bg-black absolute top-0 left-1/2 -translate-x-1/2 border border-white/10" />
                  <div className="w-2 h-2 rounded-full bg-white/20 absolute right-4" />
                </div>
                <Image
                  src="/app-screen-1.jpg"
                  alt="Jobs24India app — find work near you"
                  width={280}
                  height={560}
                  className="w-full object-cover object-top"
                  style={{ maxHeight: "470px" }}
                />
                {/* Home indicator */}
                <div className="bg-black h-5 flex items-center justify-center">
                  <div className="w-24 h-1 rounded-full bg-white/20" />
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -right-4 bottom-20 bg-white rounded-2xl shadow-xl px-3 py-2 flex items-center gap-2 text-xs font-bold text-[#1a3461]">
                <span className="text-green-500 text-base">✓</span>
                Verified employers
              </div>
              <div className="absolute left-1 top-1/2 -translate-y-1/2 bg-[#f97316] rounded-2xl shadow-xl px-3 py-2 flex items-center gap-1.5 text-xs font-bold text-white">
                <span>🔔</span>
                Job alerts
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
