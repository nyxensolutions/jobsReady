import type { BlogPost } from "../types"

const post: BlogPost = {
  slug: "how-to-read-your-salary-slip",
  category: "salary-guides",
  title: "How to Read Your Salary Slip: A Line-by-Line Guide",
  seoTitle: "How to Read a Salary Slip in India (2026) — Full Guide",
  description:
    "A line-by-line guide to reading your Indian salary slip — basic pay, HRA, PF, ESI, professional tax and net pay explained, plus the red flags that mean something is wrong.",
  excerpt:
    "Most people glance at the final number on a payslip and ignore everything above it. That's exactly where the mistakes and the missing money hide.",
  author: "Jobs24India Careers Desk",
  publishedAt: "2026-08-31",
  keywords: [
    "how to read salary slip",
    "payslip format india",
    "salary slip components",
    "gross salary vs net salary",
    "salary slip sample",
  ],
  blocks: [
    {
      type: "p",
      text: "A salary slip is more than a receipt — it is your proof of employment, your evidence in any wage dispute, and the document banks, landlords and embassies will ask for again and again. Most people check only the final credited amount and skip the rest, which is exactly where errors and shortfalls hide.",
    },
    {
      type: "p",
      text: "This guide breaks down every line on a typical Indian salary slip, so you can actually verify it rather than just trust it.",
    },
    { type: "h2", text: "A Sample Salary Slip, Explained" },
    {
      type: "table",
      caption: "Typical salary slip breakdown (₹18,000 monthly CTC)",
      head: ["Line item", "Amount", "What it means"],
      rows: [
        ["Basic Salary", "₹8,500", "The core fixed component; most other items are calculated as a % of this"],
        ["HRA", "₹4,250", "House Rent Allowance — often partly tax-exempt if you pay rent and can show receipts"],
        ["Conveyance / Travel Allowance", "₹1,600", "Fixed monthly travel support, taxable"],
        ["Special Allowance", "₹2,650", "A flexible top-up component, fully taxable"],
        ["Gross Salary", "₹17,000", "Sum of all earnings before deductions"],
        ["Employee PF (deduction)", "− ₹1,020", "12% of basic, deducted and credited to your PF account"],
        ["ESI (deduction)", "− ₹128", "0.75% of gross, applies if gross is ₹21,000 or below"],
        ["Professional Tax", "− ₹150", "A small state-government tax, applicable in some states only"],
        ["Total Deductions", "− ₹1,298", ""],
        ["Net Pay (in-hand)", "₹15,702", "What is actually credited to your bank account"],
      ],
    },
    { type: "h2", text: "Earnings Side: What Each Component Means" },
    {
      type: "table",
      head: ["Component", "Explanation"],
      rows: [
        ["Basic Salary", "Usually 40–50% of gross. Statutory calculations (PF, gratuity) are based on this figure, so it matters more than its size suggests."],
        ["HRA (House Rent Allowance)", "Meant to cover rent. If you rent your home and can show rent receipts, part of this can be tax-exempt."],
        ["Conveyance/Travel Allowance", "Covers commuting costs. Some companies fold this into 'special allowance' instead."],
        ["Special Allowance", "A catch-all component companies use to balance the total CTC; fully taxable."],
        ["Overtime / Night Allowance", "Appears only in months you actually worked overtime or night shifts — verify it matches your actual hours or shift log."],
        ["Bonus / Incentive", "Performance or attendance-linked payouts, shown separately from fixed pay."],
      ],
    },
    { type: "h2", text: "Deductions Side: What Each Component Means" },
    {
      type: "table",
      head: ["Component", "Explanation"],
      rows: [
        ["Employee PF", "12% of basic salary, going into your own retirement fund — matched by an equal employer contribution shown separately or not at all on your slip."],
        ["ESI", "0.75% of gross salary if your gross is ₹21,000 or below, funding subsidised medical treatment for you and your family."],
        ["Professional Tax", "A small monthly state tax, typically ₹150–₹200, applicable in states like Maharashtra, Karnataka, West Bengal and Telangana — not all states levy it."],
        ["TDS (Tax Deducted at Source)", "Income tax withheld in advance, usually only relevant once annual income crosses the taxable threshold."],
        ["Loan / Advance Recovery", "Repayment instalments for any salary advance or company loan you have taken."],
      ],
    },
    {
      type: "callout",
      tone: "tip",
      title: "Gross salary vs CTC vs net pay",
      text: "Your CTC (Cost to Company) includes employer contributions you never see as cash, like the employer's share of PF. Gross salary is everything paid to you before your own deductions. Net pay is what actually reaches your bank account. A salary slip usually shows only gross and net — CTC is stated separately in your offer letter.",
    },
    { type: "h2", text: "Red Flags to Check on Your Salary Slip" },
    {
      type: "ul",
      items: [
        "No PF deduction shown, despite your offer letter stating PF applies — ask HR directly why",
        "ESI missing when your gross is ₹21,000 or below — this is a legal requirement, not optional",
        "Basic salary set unusually low relative to gross, which reduces your PF and gratuity accrual over time",
        "Deductions that don't match anything you agreed to or recognise",
        "No employer PF contribution line, or a UAN never shared with you — ask for your UAN and check your balance directly on the EPFO portal",
        "The same net pay every month despite working overtime, when overtime was promised",
      ],
    },
    {
      type: "callout",
      tone: "warn",
      title: "Check your PF balance yourself, don't just trust the slip",
      text: "A salary slip showing a PF deduction proves money left your pay — it does not prove the employer actually deposited it in your PF account. Log into the EPFO member portal periodically with your UAN and check the passbook directly. A pattern of deductions with no matching deposits is a serious and unfortunately not uncommon problem.",
    },
    { type: "h2", text: "Why You Should Keep Every Salary Slip" },
    {
      type: "ul",
      items: [
        "Proof of income for loan and credit card applications",
        "Required for rental agreements in most cities",
        "Evidence in any wage or PF dispute with a past employer",
        "Needed for visa applications and some government scheme enrolments",
        "The only reliable record of your actual employment history and pay progression over time",
      ],
    },
    {
      type: "jobs",
      heading: "Jobs that issue proper, transparent salary slips",
    },
    { type: "h2", text: "Conclusion" },
    {
      type: "p",
      text: "A salary slip is a document worth actually reading, not just glancing at the bottom line of. Checking that PF, ESI and professional tax are correctly applied — and periodically verifying your PF balance independently on the EPFO portal — is the simplest way to catch an underpayment or a missing deposit before it becomes a much larger problem.",
    },
  ],
  faqs: [
    {
      q: "What is the difference between gross salary and net salary on a payslip?",
      a: "Gross salary is your total earnings before any deductions — basic, HRA, allowances and bonuses combined. Net salary (in-hand) is gross salary minus PF, ESI, professional tax and any other deductions — it's what actually gets credited to your bank account.",
    },
    {
      q: "Why is my basic salary lower than my other allowances?",
      a: "Companies often keep basic salary at 40–50% of gross and use allowances to make up the rest. This isn't necessarily a problem, but it's worth noting that PF and gratuity are calculated on basic salary, so a lower basic means slightly lower long-term retirement savings.",
    },
    {
      q: "How do I know if my PF is actually being deposited?",
      a: "A deduction on your salary slip only shows money left your pay — it doesn't confirm deposit. Log into the EPFO member portal with your UAN and check your PF passbook directly to verify deposits are actually being made by your employer.",
    },
    {
      q: "Why doesn't my salary slip show ESI?",
      a: "ESI only applies if your gross salary is ₹21,000 or below. If your gross is above that threshold, no ESI deduction is expected. If it's below and ESI is missing, raise it with HR — it is a legal requirement.",
    },
    {
      q: "Why do I need to keep my salary slips?",
      a: "They serve as proof of income for loans and rental agreements, evidence in any wage or PF dispute, and the only reliable record of your employment history and pay progression. Keep them even after you leave a job.",
    },
  ],
}

export default post
