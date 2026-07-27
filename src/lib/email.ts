import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? "noreply@jobsready.in"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

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
    from: `Job Ready <${FROM}>`,
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
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Job Ready · India's job portal for blue-collar workers</p>
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
    from: `Job Ready <${FROM}>`,
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
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Job Ready · India's job portal for blue-collar workers</p>
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
    from: `Job Ready <${FROM}>`,
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
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Job Ready · India's job portal for blue-collar workers</p>
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
    from: `Job Ready <${FROM}>`,
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
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Job Ready · India's job portal for blue-collar workers</p>
      </div>
    `,
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
    from: `Job Ready <${FROM}>`,
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
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">Job Ready · India's job portal for blue-collar workers</p>
      </div>
    `,
  })
}
