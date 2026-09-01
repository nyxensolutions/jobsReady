import type { BlogPost } from "../types"

const post: BlogPost = {
  slug: "pf-withdrawal-process-explained",
  category: "salary-guides",
  title: "PF Withdrawal Process: A Step-by-Step Guide",
  seoTitle: "PF Withdrawal Process in India (2026) — Full Step-by-Step Guide",
  description:
    "How to withdraw your PF (Provident Fund) online — eligibility, the difference between full and partial withdrawal, documents needed, timelines, and common reasons claims get rejected.",
  excerpt:
    "Your PF is not locked away forever, and it is not free money either. Here is exactly when you can take it out, and how to do it without a rejected claim.",
  author: "Jobs24India Careers Desk",
  publishedAt: "2026-08-31",
  keywords: [
    "pf withdrawal process",
    "how to withdraw pf online",
    "epf withdrawal rules",
    "pf claim rejected",
    "provident fund withdrawal after resignation",
  ],
  blocks: [
    {
      type: "p",
      text: "Every month a slice of your salary goes into your PF account, matched by an equal contribution from your employer. Most workers only think about this money when they need it — after leaving a job, during an emergency, or approaching retirement — and by then the process feels unfamiliar and slower than it needs to be.",
    },
    {
      type: "p",
      text: "This guide walks through exactly when you can withdraw, how much, and the steps to actually get the money into your account without a rejected claim.",
    },
    { type: "h2", text: "When Can You Withdraw Your PF?" },
    {
      type: "table",
      caption: "PF withdrawal eligibility",
      head: ["Situation", "What you can withdraw", "Waiting period"],
      rows: [
        ["Unemployed for 1 month", "75% of the balance", "1 month after leaving the job"],
        ["Unemployed for 2 months", "Remaining 25%", "2 months after leaving the job"],
        ["Retirement (58+)", "Full balance", "None"],
        ["Medical emergency", "Partial, for self/family treatment", "None — emergency provision"],
        ["Home purchase / construction", "Partial, up to a defined limit", "After 5 years of PF membership"],
        ["Marriage (self, children, siblings)", "Partial", "After 7 years of PF membership"],
        ["Higher education (self, children)", "Partial", "After 7 years of PF membership"],
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "The 2-month rule is the one most people miss",
      text: "You do not need to be retired or facing an emergency to withdraw. If you have left a job and remain unemployed for two months, the full balance becomes withdrawable — this is the route most frontline workers actually use between jobs.",
    },
    { type: "h2", text: "Full Withdrawal vs Partial Withdrawal" },
    {
      type: "table",
      head: ["", "Full withdrawal", "Partial withdrawal (advance)"],
      rows: [
        ["When available", "After 2 months of unemployment, or retirement", "For specific approved reasons — medical, housing, education, marriage"],
        ["Amount", "Entire PF balance", "A defined portion, based on the reason and years of service"],
        ["Repayment needed", "No", "No — it is not a loan"],
        ["Effect on account", "Account closes", "Account stays active, balance reduces"],
      ],
    },
    { type: "h2", text: "How to Withdraw PF Online: Step by Step" },
    {
      type: "ol",
      items: [
        "Activate your UAN (Universal Account Number) on the EPFO member portal if you haven't already, using your UAN and a password set via OTP",
        "Link and verify your Aadhaar with your UAN — this is mandatory for online claims",
        "Ensure your bank account and IFSC code are updated and verified in the portal, since the amount is credited there directly",
        "Log in to the EPFO member portal and go to the online claim (Form 31, 19 or 10C) section under 'Online Services'",
        "Select the appropriate claim type — full final settlement, PF advance, or pension withdrawal",
        "Enter the last 4 digits of your linked bank account to confirm your identity",
        "Submit the claim — no physical documents are needed if your KYC (Aadhaar, PAN, bank) is fully verified",
        "Track the claim status on the portal; approved claims are typically credited within 5 to 20 working days",
      ],
    },
    { type: "h2", text: "Documents and Details You Need" },
    {
      type: "ul",
      items: [
        "Activated UAN with a working registered mobile number",
        "Aadhaar linked and verified against your UAN",
        "PAN linked to your UAN — required to avoid TDS deduction on early withdrawal in most cases",
        "Bank account and IFSC code, verified and matching your UAN details exactly",
        "For partial withdrawals: supporting documents for the specific reason, such as a hospital estimate for medical claims or a sale agreement for housing claims",
      ],
    },
    { type: "h2", text: "Common Reasons Claims Get Rejected" },
    {
      type: "table",
      head: ["Reason for rejection", "How to fix it"],
      rows: [
        ["Name mismatch between Aadhaar, PAN and UAN records", "Correct the mismatched record through the EPFO portal's joint declaration process before reapplying"],
        ["Bank account not linked or KYC not approved by employer", "Contact your last employer's HR to approve pending KYC, or update it yourself if self-service is available"],
        ["Claiming full withdrawal before the 2-month gap", "Wait out the required period, or apply for a partial advance instead if eligible"],
        ["UAN not linked to the correct employment history", "Raise a correction request via the EPFO grievance portal"],
      ],
    },
    {
      type: "callout",
      tone: "warn",
      title: "Tax on early withdrawal",
      text: "Withdrawing your PF before completing 5 years of continuous service can attract TDS (tax deducted at source) if the amount exceeds ₹50,000, unless specific exemptions apply. If your PAN is linked to your UAN, the deduction is at a lower rate; if not, it can be significantly higher. Link your PAN before applying if you plan to withdraw early.",
    },
    { type: "h2", text: "Should You Withdraw or Transfer?" },
    {
      type: "p",
      text: "If you are moving to a new job rather than staying unemployed, transferring your PF to your new employer's account — rather than withdrawing it — keeps your continuous service record intact, which matters for tax treatment and for pension eligibility later. The EPFO portal has a dedicated 'One Employee One EPF Account' transfer request for exactly this.",
    },
    {
      type: "jobs",
      heading: "Jobs that come with genuine PF and ESI benefits",
    },
    { type: "h2", text: "Conclusion" },
    {
      type: "p",
      text: "PF withdrawal is a fully online process once your UAN, Aadhaar, PAN and bank details are properly linked — the entire delay in most rejected or slow claims traces back to a mismatch in one of those four things. Sort that out first, and a claim typically clears within 5 to 20 working days.",
    },
  ],
  faqs: [
    {
      q: "How long after leaving a job can I withdraw my full PF?",
      a: "You can withdraw 75% of the balance after 1 month of unemployment, and the remaining 25% after 2 months. You do not need to be retired to access the full balance — becoming unemployed for 2 months is enough.",
    },
    {
      q: "Can I withdraw PF while still employed?",
      a: "Yes, through a partial withdrawal (advance) for specific approved reasons like medical emergencies, home purchase after 5 years of membership, or marriage and education after 7 years. This does not require you to resign, and it does not need to be repaid.",
    },
    {
      q: "How long does a PF withdrawal claim take?",
      a: "Typically 5 to 20 working days once submitted, provided your UAN, Aadhaar, PAN and bank account are all correctly linked and verified. Mismatched KYC details are the most common cause of delay or rejection.",
    },
    {
      q: "Is PF withdrawal taxable?",
      a: "Withdrawals after 5 years of continuous service are generally tax-free. Withdrawing earlier can attract TDS if the amount exceeds ₹50,000, at a lower rate if your PAN is linked to your UAN and a higher rate if it isn't.",
    },
    {
      q: "Should I withdraw my PF or transfer it to a new employer?",
      a: "If you're moving to a new job rather than staying unemployed, transferring is usually better — it preserves your continuous service record, which affects both tax treatment and pension eligibility. Withdrawal makes more sense if you're leaving the workforce or facing a genuine need for the funds.",
    },
  ],
}

export default post
