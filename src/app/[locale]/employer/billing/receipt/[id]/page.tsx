import { notFound, redirect } from "next/navigation"
import { getServerSession } from "@/lib/firebase/session"
import { prisma } from "@/lib/db"

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

/**
 * Printable / downloadable payment receipt.
 * Opens in a new tab. Auto-triggers print dialog via a script tag.
 * Works offline — everything is inline, no external assets.
 */
export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession()
  if (!session) redirect("/login")

  const { id } = await params

  const [dbUser, employer, sub] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.uid } }),
    prisma.employerProfile.findUnique({ where: { userId: session.uid } }),
    prisma.subscription.findUnique({ where: { id }, include: { plan: true } }),
  ])

  if (!dbUser || dbUser.role !== "EMPLOYER" || !employer) redirect("/login")
  if (!sub || sub.employerId !== employer.id) notFound()

  const receiptNo = `J24-${sub.id.slice(0, 8).toUpperCase()}`
  const orderId = sub.razorpayOrderId ?? "—"
  const paymentId = sub.razorpayPaymentId ?? "—"

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Receipt {receiptNo} — Jobs24India</title>
        <style>{`
          @media print { .no-print { display:none!important } body { background:#fff } }
          body { margin:0; padding:0; background:#f3f4f6; font-family:Arial,Helvetica,sans-serif; }
          .page { max-width:680px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb; }
          .header { background:#1a3461; color:#fff; padding:28px 40px; }
          .logo { font-size:24px; font-weight:800; } .logo span { color:#f97316; }
          .tagline { font-size:11px; color:#93c5fd; margin-top:4px; }
          .body { padding:40px; }
          h2 { margin:0 0 4px; color:#1a3461; font-size:20px; }
          table { width:100%; border-collapse:collapse; }
          td { padding:8px 0; font-size:14px; color:#374151; vertical-align:top; }
          td:first-child { color:#6b7280; width:180px; }
          .divider { border:none; border-top:1px solid #e5e7eb; margin:24px 0; }
          .amount { font-size:28px; font-weight:800; color:#15803d; }
          .footer { background:#f9fafb; padding:16px 40px; border-top:1px solid #e5e7eb; font-size:11px; color:#9ca3af; }
          .print-btn { display:block; text-align:center; margin:24px auto 0; }
          button { background:#1a3461; color:#fff; border:none; border-radius:8px; padding:12px 32px; font-size:14px; font-weight:700; cursor:pointer; }
        `}</style>
      </head>
      <body>
        <div className="page" style={{ maxWidth: 680, margin: "32px auto", background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          {/* Header */}
          <div style={{ background: "#1a3461", padding: "28px 40px", color: "#fff" }}>
            <div style={{ fontSize: 24, fontWeight: 800 }}>
              Jobs<span style={{ color: "#f97316" }}>24</span>India
            </div>
            <div style={{ fontSize: 11, color: "#93c5fd", marginTop: 4 }}>India's job portal for blue-collar workers</div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, color: "#bfdbfe", fontWeight: 600 }}>PAYMENT RECEIPT</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{receiptNo}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 13, color: "#bfdbfe" }}>
                <div>Date: {fmt(sub.startedAt)}</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "40px" }}>
            <h2 style={{ margin: "0 0 4px", color: "#1a3461", fontSize: 20 }}>Invoice to</h2>
            <p style={{ margin: "0 0 24px", color: "#374151", fontSize: 14 }}>
              <strong>{employer.companyName}</strong><br />
              {employer.contactPerson && <>{employer.contactPerson}<br /></>}
              {employer.city && <>{employer.city}<br /></>}
            </p>

            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["Plan", sub.plan.name],
                  ["Validity", `${sub.plan.durationDays} days (${fmt(sub.startedAt)} to ${fmt(sub.expiresAt)})`],
                  ["Receipt #", receiptNo],
                  ["Order ID", orderId],
                  ["Payment ID", paymentId],
                  ["Status", sub.status],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td style={{ padding: "8px 0", color: "#6b7280", width: 180, fontSize: 14, verticalAlign: "top" }}>{label}</td>
                    <td style={{ padding: "8px 0", color: "#374151", fontSize: 14 }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <hr style={{ border: "none", borderTop: "2px solid #1a3461", margin: "24px 0" }} />

            <table style={{ width: "100%" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#6b7280", fontSize: 14 }}>Subtotal (excl. 18% GST)</td>
                  <td style={{ textAlign: "right", fontSize: 14, color: "#374151" }}>
                    ₹{Math.round(sub.plan.priceRupees / 1.18).toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "#6b7280", fontSize: 14 }}>GST @ 18%</td>
                  <td style={{ textAlign: "right", fontSize: 14, color: "#374151" }}>
                    ₹{(sub.plan.priceRupees - Math.round(sub.plan.priceRupees / 1.18)).toLocaleString("en-IN")}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "#374151", fontSize: 16, fontWeight: 700, paddingTop: 12 }}>Total paid</td>
                  <td style={{ textAlign: "right", fontSize: 28, fontWeight: 800, color: "#15803d" }}>
                    ₹{sub.plan.priceRupees.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>

            <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "24px 0" }} />
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
              NyxenCloud Solution Pvt. Ltd. · GSTIN: [Your GSTIN] · billing@jobs24india.com
            </p>
          </div>

          {/* Footer */}
          <div style={{ background: "#f9fafb", padding: "16px 40px", borderTop: "1px solid #e5e7eb", fontSize: 11, color: "#9ca3af" }}>
            This is a computer-generated receipt and does not require a signature.
          </div>
        </div>

        {/* Print button — hidden when printing */}
        <div className="no-print" style={{ textAlign: "center", marginBottom: 32 }}>
          <button onClick={() => window.print()} style={{ background: "#1a3461", color: "#fff", border: "none", borderRadius: 8, padding: "12px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", marginRight: 12 }}>
            🖨 Print / Save as PDF
          </button>
          <button onClick={() => window.close()} style={{ background: "#e5e7eb", color: "#374151", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, cursor: "pointer" }}>
            Close
          </button>
        </div>

        <script dangerouslySetInnerHTML={{ __html: "" }} />
      </body>
    </html>
  )
}
