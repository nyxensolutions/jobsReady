import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@jobs24india.com"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

// ─── Shared email shell ───────────────────────────────────────────────────────
function emailShell(body: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb">
  <tr><td style="background:#1a3461;padding:24px 32px">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <img src="${APP_URL}/Logo_Light.png" alt="Jobs24India" height="32" style="display:block;margin-bottom:8px;border:none;" />
        <span style="font-size:11px;color:#93c5fd">India's job portal for frontline workers</span>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:32px">${body}</td></tr>
  <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
    <p style="margin:0;font-size:11px;color:#9ca3af">Jobs24India · NyxenCloud Solutions Private Limited · <a href="${APP_URL}" style="color:#1a3461;text-decoration:none">jobs24india.com</a></p>
    <p style="margin:8px 0 0;font-size:11px;color:#6b7280">Need help? Contact us at <a href="mailto:support@jobs24india.com" style="color:#1a3461;text-decoration:none;font-weight:600">support@jobs24india.com</a></p>
    <p style="margin:8px 0 0;font-size:10px;color:#d1d5db">To unsubscribe, visit your profile settings.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`
}

function btn(url: string, label: string, color = "#1a3461") {
  return `<a href="${url}" style="display:inline-block;background:${color};color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700">${label} →</a>`
}

// ─── Welcome Emails ─────────────────────────────────────────────────────────────

export async function sendSeekerWelcomeEmail({ email, name }: { email: string; name: string }) {
  if (!email) return
  const body = `
    <h2 style="margin:0 0 4px;color:#1a3461;font-size:20px">Welcome to Jobs24India! 👋</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px">Hi ${name},</p>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.6">
      We're thrilled to have you onboard. Jobs24India is India's leading platform connecting talented frontline workers like you with top companies. 
    </p>
    <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:20px;margin-bottom:24px">
      <h3 style="margin:0 0 12px;color:#374151;font-size:14px">To get the best jobs quickly:</h3>
      <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.5">
        <li style="margin-bottom:8px"><strong>Complete your profile:</strong> Add your skills, experience, and photo.</li>
        <li style="margin-bottom:8px"><strong>Apply actively:</strong> Employers respond faster to recent applications.</li>
        <li><strong>Stay alert:</strong> We'll notify you when an employer shortlists you.</li>
      </ul>
    </div>
    ${btn(`${APP_URL}/seeker/profile`, "Complete Your Profile")}
    <p style="margin:24px 0 0;color:#6b7280;font-size:14px">Good luck with your job search!</p>
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: email,
    subject: "Welcome to Jobs24India! 🚀",
    html: emailShell(body),
  })
}

export async function sendEmployerWelcomeEmail({ email, companyName }: { email: string; companyName: string }) {
  if (!email) return
  const body = `
    <h2 style="margin:0 0 4px;color:#1a3461;font-size:20px">Welcome to Jobs24India! 👋</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px">Hi ${companyName},</p>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.6">
      Welcome to India's fastest growing network of frontline workers. We are excited to help you find the perfect candidates for your team.
    </p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:20px;margin-bottom:24px">
      <h3 style="margin:0 0 12px;color:#374151;font-size:14px">Next steps to start hiring:</h3>
      <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.5">
        <li style="margin-bottom:8px"><strong>Verify your company:</strong> Upload your documents to get verified.</li>
        <li style="margin-bottom:8px"><strong>Post a job:</strong> Your first few hires might be covered under our free plan!</li>
        <li><strong>Review candidates:</strong> You'll get notified immediately when someone applies.</li>
      </ul>
    </div>
    ${btn(`${APP_URL}/employer/post-job`, "Post Your First Job")}
    <p style="margin:24px 0 0;color:#6b7280;font-size:14px">Happy hiring!</p>
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: email,
    subject: "Welcome to Jobs24India! 🚀",
    html: emailShell(body),
  })
}

// ─── Payment receipt ──────────────────────────────────────────────────────────

export async function sendPaymentReceipt({
  toEmail, toName, planName, amountRupees, orderId, paymentId, validFrom, validUntil, durationDays,
}: {
  toEmail: string; toName: string; planName: string; amountRupees: number
  orderId: string; paymentId: string; validFrom: Date; validUntil: Date; durationDays: number
}) {
  if (!toEmail) return
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
  const body = `
    <h2 style="margin:0 0 4px;color:#15803d;font-size:20px">Payment successful ✅</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${toName}, your payment has been received. Here is your receipt.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px">
      <tr><td style="padding:20px">
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#374151">
          <tr><td style="color:#6b7280;width:160px">Plan</td><td><strong>${planName}</strong></td></tr>
          <tr><td style="color:#6b7280">Amount paid</td><td><strong style="color:#15803d">₹${amountRupees.toLocaleString("en-IN")}</strong> (incl. GST)</td></tr>
          <tr><td style="color:#6b7280">Order ID</td><td style="font-size:12px;color:#6b7280">${orderId}</td></tr>
          <tr><td style="color:#6b7280">Payment ID</td><td style="font-size:12px;color:#6b7280">${paymentId || "—"}</td></tr>
          <tr><td style="color:#6b7280">Valid from</td><td>${fmt(validFrom)}</td></tr>
          <tr><td style="color:#6b7280">Valid until</td><td><strong>${fmt(validUntil)}</strong> (${durationDays} days)</td></tr>
        </table>
      </td></tr>
    </table>
    ${btn(`${APP_URL}/employer/billing`, "View Billing History")}
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280">Keep this email for your records. For any billing queries, reply to this email.</p>
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: toEmail,
    subject: `Payment receipt — ₹${amountRupees.toLocaleString("en-IN")} · ${planName} · Jobs24India`,
    html: emailShell(body),
  })
}

// ─── Seeker: application submitted ───────────────────────────────────────────

export async function sendSeekerApplicationConfirmation({
  seekerEmail, seekerName, jobTitle, companyName, jobId,
}: { seekerEmail: string; seekerName: string; jobTitle: string; companyName: string; jobId: string }) {
  if (!seekerEmail) return
  const body = `
    <h2 style="margin:0 0 4px;color:#1a3461;font-size:20px">Application submitted 🎯</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${seekerName}, your application has been sent to the employer.</p>
    <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#374151;font-size:14px"><strong>Job:</strong> ${jobTitle}</p>
      <p style="margin:0;color:#374151;font-size:14px"><strong>Company:</strong> ${companyName}</p>
    </div>
    <p style="margin:0 0 16px;color:#6b7280;font-size:13px">The employer will review your profile and contact you if shortlisted. Make sure your profile is complete to improve your chances.</p>
    ${btn(`${APP_URL}/jobs/${jobId}`, "View Job", "#f97316")}
    &nbsp;&nbsp;${btn(`${APP_URL}/seeker/dashboard`, "My Applications")}
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: seekerEmail,
    subject: `Application sent to ${companyName} for "${jobTitle}"`,
    html: emailShell(body),
  })
}

// ─── Seeker: application status changed ──────────────────────────────────────

export async function sendSeekerStatusUpdate({
  seekerEmail, seekerName, jobTitle, companyName, status,
}: { seekerEmail: string; seekerName: string; jobTitle: string; companyName: string; status: string }) {
  if (!seekerEmail) return
  const configs: Record<string, { emoji: string; headline: string; color: string; bg: string; border: string; msg: string }> = {
    VIEWED:      { emoji: "👀", headline: "Your profile was viewed",    color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe", msg: `${companyName} looked at your application for ${jobTitle}. They may reach out soon.` },
    SHORTLISTED: { emoji: "🎉", headline: "You've been shortlisted!",   color: "#ea580c", bg: "#fff7ed", border: "#fed7aa", msg: `${companyName} shortlisted you for ${jobTitle}. Expect a call — keep your phone handy.` },
    HIRED:       { emoji: "🏆", headline: "You got the job!",           color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0", msg: `Congratulations! ${companyName} selected you for ${jobTitle}. Check your dashboard for next steps.` },
    REJECTED:    { emoji: "📋", headline: "Application not selected",   color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb", msg: `${companyName} went with another candidate for ${jobTitle}. Don't give up — keep applying!` },
  }
  const cfg = configs[status]
  if (!cfg) return
  const body = `
    <h2 style="margin:0 0 4px;color:${cfg.color};font-size:20px">${cfg.emoji} ${cfg.headline}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${seekerName}, there's an update on your application.</p>
    <div style="background:${cfg.bg};border:1px solid ${cfg.border};border-radius:12px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 8px;color:#374151;font-size:14px"><strong>Job:</strong> ${jobTitle}</p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px"><strong>Company:</strong> ${companyName}</p>
      <p style="margin:0;color:${cfg.color};font-size:14px">${cfg.msg}</p>
    </div>
    ${btn(`${APP_URL}/seeker/dashboard`, "View My Applications")}
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: seekerEmail,
    subject: `${cfg.emoji} ${cfg.headline} — ${jobTitle} at ${companyName}`,
    html: emailShell(body),
  })
}

// ─── Seeker: daily job digest ─────────────────────────────────────────────────

export async function sendSeekerJobDigest({
  seekerEmail, seekerName, jobs,
}: {
  seekerEmail: string; seekerName: string
  jobs: Array<{ title: string; companyName: string; city: string; salaryMin?: number | null; salaryMax?: number | null; id: string }>
}) {
  if (!seekerEmail || jobs.length === 0) return
  const fmt = (n: number) => n >= 1000 ? `₹${Math.round(n / 1000)}K` : `₹${n}`
  const jobRows = jobs.slice(0, 8).map(j => {
    const salary = j.salaryMin ? `${fmt(j.salaryMin)}${j.salaryMax ? `–${fmt(j.salaryMax)}` : "+"}` : "Salary TBD"
    return `
      <tr><td style="padding:12px 0;border-bottom:1px solid #f3f4f6">
        <a href="${APP_URL}/jobs/${j.id}" style="color:#1a3461;text-decoration:none;font-weight:700;font-size:14px">${j.title}</a><br>
        <span style="font-size:12px;color:#6b7280">${j.companyName} · ${j.city}</span>
        <span style="float:right;font-size:13px;font-weight:700;color:#15803d">${salary}/mo</span>
      </td></tr>`
  }).join("")
  const body = `
    <h2 style="margin:0 0 4px;color:#1a3461;font-size:20px">New jobs for you today 🔔</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${seekerName}, here are ${jobs.length} new job${jobs.length > 1 ? "s" : ""} matching your skills.</p>
    <table width="100%" cellpadding="0" cellspacing="0">${jobRows}</table>
    <br>${btn(`${APP_URL}/jobs`, "See All Jobs", "#f97316")}
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af">Update your skills and city in your profile to get better matches.</p>
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: seekerEmail,
    subject: `${jobs.length} new job${jobs.length > 1 ? "s" : ""} match your profile today — Jobs24India`,
    html: emailShell(body),
  })
}

// ─── Employer: weekly summary ─────────────────────────────────────────────────

export async function sendEmployerWeeklySummary({
  employerEmail, companyName, contactPerson, stats,
}: {
  employerEmail: string; companyName: string; contactPerson?: string | null
  stats: { activeJobs: number; newApplications: number; totalApplications: number; shortlisted: number; planName: string; daysLeft: number }
}) {
  if (!employerEmail) return
  const name = contactPerson || companyName
  const body = `
    <h2 style="margin:0 0 4px;color:#1a3461;font-size:20px">Your weekly hiring summary 📊</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${name}, here's what happened with your job postings this week.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr>
        ${[
          { label: "Active Jobs", value: stats.activeJobs, color: "#1a3461" },
          { label: "New Applications", value: stats.newApplications, color: "#f97316" },
          { label: "Shortlisted", value: stats.shortlisted, color: "#15803d" },
        ].map(s => `
          <td width="33%" style="text-align:center;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin:0 4px">
            <div style="font-size:28px;font-weight:800;color:${s.color}">${s.value}</div>
            <div style="font-size:11px;color:#9ca3af;margin-top:4px">${s.label}</div>
          </td>`).join("")}
      </tr>
    </table>
    <div style="background:#eef2ff;border:1px solid #c7d2fe;border-radius:12px;padding:16px;margin-bottom:24px;font-size:13px;color:#374151">
      <strong>Plan:</strong> ${stats.planName} &nbsp;·&nbsp; <strong>${stats.daysLeft}</strong> days remaining
    </div>
    ${btn(`${APP_URL}/employer/dashboard`, "View Dashboard")}
    &nbsp;&nbsp;${btn(`${APP_URL}/employer/responses`, "Review Applications", "#f97316")}
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `Weekly hiring summary — ${stats.newApplications} new application${stats.newApplications !== 1 ? "s" : ""} this week`,
    html: emailShell(body),
  })
}

// ─── Employer: plan expiring soon ─────────────────────────────────────────────

export async function sendEmployerPlanExpiring({
  employerEmail, companyName, planName, daysLeft,
}: { employerEmail: string; companyName: string; planName: string; daysLeft: number }) {
  if (!employerEmail) return
  const body = `
    <h2 style="margin:0 0 4px;color:#d97706;font-size:20px">⚠️ Your plan expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${companyName}, your <strong>${planName}</strong> will expire soon. Renew now to keep your jobs active.</p>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin-bottom:24px;font-size:13px;color:#374151">
      When your plan expires, your active jobs are automatically paused and you'll lose access to candidate contacts.
    </div>
    ${btn(`${APP_URL}/employer/plans`, "Renew Plan", "#d97706")}
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `⚠️ Your ${planName} expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""} — Renew now`,
    html: emailShell(body),
  })
}

export async function sendEmployerApplicationAlert({
  employerEmail,
  employerName,
  jobTitle,
  seekerName,
  applicationId,
}: {
  employerEmail: string
  employerName: string
  jobTitle: string
  seekerName: string
  applicationId: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `New application for "${jobTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#1e3a8a;margin:0 0 8px">New application received</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${employerName}, someone just applied to your job posting.</p>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;color:#374151"><strong>Job:</strong> ${jobTitle}</p>
          <p style="margin:0;color:#374151"><strong>Applicant:</strong> ${seekerName}</p>
        </div>
        <a href="${APP_URL}/employer/dashboard"
           style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          View in Dashboard →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Jobs24India · India's job portal for frontline workers</p>
      </div>
    `,
  })
}

export async function sendEmployerVerifiedAlert({
  employerEmail,
  employerName,
}: {
  employerEmail: string
  employerName: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `Your company profile is now verified! ✅`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#15803d;margin:0 0 8px">Company verified successfully</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${employerName}, we have reviewed and verified your company profile. You can now post jobs and connect with candidates.</p>
        <a href="${APP_URL}/employer/post-job"
           style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          Post a Job →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Jobs24India · India's job portal for frontline workers</p>
      </div>
    `,
  })
}

export async function sendEmployerVerificationRejectedAlert({
  employerEmail,
  employerName,
}: {
  employerEmail: string
  employerName: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `Update on your company verification`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#b91c1c;margin:0 0 8px">Verification needs attention</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${employerName}, we were unable to verify your company profile. Please ensure your documents are correct and re-submit.</p>
        <a href="${APP_URL}/employer/profile"
           style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          Update Profile →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Jobs24India · India's job portal for frontline workers</p>
      </div>
    `,
  })
}

export async function sendEmployerJobApprovedAlert({
  employerEmail,
  employerName,
  jobTitle,
  jobId,
}: {
  employerEmail: string
  employerName: string
  jobTitle: string
  jobId: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `Your job "${jobTitle}" is now live!`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#15803d;margin:0 0 8px">Job approved and live ✅</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${employerName}, your job posting has been reviewed and approved. Candidates can now apply.</p>
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0;color:#374151"><strong>Job:</strong> ${jobTitle}</p>
        </div>
        <a href="${APP_URL}/jobs/${jobId}"
           style="display:inline-block;background:#15803d;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          View Job Listing →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Jobs24India · India's job portal for frontline workers</p>
      </div>
    `,
  })
}

export async function sendEmployerJobRejectedAlert({
  employerEmail,
  employerName,
  jobTitle,
  reason,
}: {
  employerEmail: string
  employerName: string
  jobTitle: string
  reason?: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: employerEmail,
    subject: `Update on your job posting: "${jobTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#b91c1c;margin:0 0 8px">Job posting needs attention</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${employerName}, your job posting requires changes before it can go live.</p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;color:#374151"><strong>Job:</strong> ${jobTitle}</p>
          ${reason ? `<p style="margin:0;color:#374151"><strong>Reason:</strong> ${reason}</p>` : ""}
        </div>
        <a href="${APP_URL}/employer/dashboard"
           style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          Edit and Resubmit →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Jobs24India · India's job portal for frontline workers</p>
      </div>
    `,
  })
}

export async function sendCandidateInviteEmail({
  seekerEmail,
  seekerName,
  jobTitle,
  companyName,
  jobId,
}: {
  seekerEmail: string
  seekerName: string
  jobTitle: string
  companyName: string
  jobId: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: seekerEmail,
    subject: `${companyName} wants you to apply for "${jobTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#1a3461;margin:0 0 8px">You've been invited to apply! 🎯</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${seekerName}, an employer found your profile and wants you to apply.</p>
        <div style="background:#eef2ff;border:1px solid #dde5ff;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;color:#374151"><strong>Job:</strong> ${jobTitle}</p>
          <p style="margin:0;color:#374151"><strong>Company:</strong> ${companyName}</p>
        </div>
        <a href="${APP_URL}/jobs/${jobId}"
           style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          View &amp; Apply Now →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Jobs24India · India's job portal for frontline workers</p>
      </div>
    `,
  })
}

export async function sendEmployerMagicLink({
  email,
  magicLink,
}: {
  email: string
  magicLink: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: email,
    subject: "Sign in to Jobs24India",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <div style="background:#1a3461;padding:24px 32px">
          <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">Jobs<span style="color:#f97316">24</span>India</h1>
          <p style="margin:4px 0 0;color:#93c5fd;font-size:12px">India's job portal for frontline workers</p>
        </div>
        <div style="padding:32px">
          <h2 style="margin:0 0 8px;color:#1a3461;font-size:18px">Sign in to your account</h2>
          <p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.6">
            Click the button below to sign in to your Jobs24India employer account. This link expires in 1 hour.
          </p>
          <a href="${magicLink}" style="display:inline-block;background:#1a3461;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600">
            Sign in to Jobs24India →
          </a>
          <p style="margin:24px 0 0;color:#6b7280;font-size:12px;line-height:1.6">
            If the button doesn't work, copy and paste this link:<br>
            <a href="${magicLink}" style="color:#1a3461;word-break:break-all">${magicLink}</a>
          </p>
          <p style="margin:16px 0 0;color:#9ca3af;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;color:#9ca3af;font-size:11px">Jobs24India · NyxenCloud Solutions Private Limited</p>
        </div>
      </div>
    `,
  })
}

// ─── Employer: email address verification ────────────────────────────────────

// ─── Employer: onboarding complete ───────────────────────────────────────────

export async function sendEmployerOnboardingCompleteEmail({
  email,
  companyName,
  contactPerson,
}: { email: string; companyName: string; contactPerson?: string | null }) {
  if (!email) return
  const name = contactPerson || companyName
  const body = `
    <h2 style="margin:0 0 4px;color:#15803d;font-size:20px">🎉 You're fully onboarded!</h2>
    <p style="margin:0 0 16px;color:#6b7280;font-size:14px">Hi ${name},</p>
    <p style="margin:0 0 24px;color:#4b5563;font-size:14px;line-height:1.6">
      Congratulations! Your company <strong>${companyName}</strong> has been verified and your profile is 100% complete.
      You can now post unlimited jobs (within your plan) and start receiving applications from top candidates.
    </p>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin-bottom:24px">
      <h3 style="margin:0 0 12px;color:#15803d;font-size:14px">✅ What you can do now:</h3>
      <ul style="margin:0;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.5">
        <li style="margin-bottom:8px">Post jobs and get applicants within hours</li>
        <li style="margin-bottom:8px">Unlock candidate contacts to call them directly</li>
        <li>Boost your jobs to the top for maximum visibility</li>
      </ul>
    </div>
    ${btn(`${APP_URL}/employer/post-job`, "Post a Job Now", "#15803d")}
    <p style="margin:24px 0 0;color:#6b7280;font-size:14px">Welcome aboard, ${name}! Our team is here if you need anything.</p>
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: email,
    subject: `🎉 ${companyName} is now verified on Jobs24India!`,
    html: emailShell(body),
  })
}

export async function sendEmailVerification({
  toEmail,
  toName,
  verifyUrl,
}: { toEmail: string; toName: string; verifyUrl: string }) {
  const body = `
    <h2 style="margin:0 0 4px;color:#1a3461;font-size:20px">Verify your email address ✉️</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px">Hi ${toName}, click the button below to confirm your email address and complete your account setup.</p>
    <div style="text-align:center;margin-bottom:28px">
      ${btn(verifyUrl, "Verify Email Address")}
    </div>
    <p style="margin:0 0 8px;color:#6b7280;font-size:13px">Or copy and paste this link into your browser:</p>
    <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;word-break:break-all"><a href="${verifyUrl}" style="color:#1a3461">${verifyUrl}</a></p>
    <p style="margin:0;font-size:12px;color:#9ca3af">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
  `
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: toEmail,
    subject: "Verify your email address — Jobs24India",
    html: emailShell(body),
  })
}

export async function sendSeekerShortlistAlert({
  seekerEmail,
  seekerName,
  jobTitle,
  companyName,
}: {
  seekerEmail: string
  seekerName: string
  jobTitle: string
  companyName: string
}) {
  await resend.emails.send({
    from: `Jobs24India <${FROM}>`,
    to: seekerEmail,
    subject: `You've been shortlisted for "${jobTitle}"`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px">
        <h2 style="color:#ea580c;margin:0 0 8px">Congratulations! You're shortlisted 🎉</h2>
        <p style="color:#6b7280;margin:0 0 24px">Hi ${seekerName}, great news — you have been shortlisted by an employer.</p>
        <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 8px;color:#374151"><strong>Job:</strong> ${jobTitle}</p>
          <p style="margin:0;color:#374151"><strong>Company:</strong> ${companyName}</p>
        </div>
        <a href="${APP_URL}/seeker/dashboard"
           style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
          View in Dashboard →
        </a>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Jobs24India · India's job portal for frontline workers</p>
      </div>
    `,
  })
}
