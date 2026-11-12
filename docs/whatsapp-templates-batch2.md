# WhatsApp templates — batch 2

## Outcome, 13 Nov 2026 — submitted, and what Meta decided

All eight went in. Six are Active, two still in review. **Meta's categories
are below; the predictions further down this document were wrong twice and
are kept only to show what the classifier actually does.**

| Template | Submitted as | Approved as | Needs opt-in |
|---|---|---|---|
| `employer_payment_receipt_v1` | Utility | Utility | no |
| `employer_job_approved_v1` | Utility | Utility | no |
| `seeker_contact_unlocked_v1` | Utility | Utility | no |
| `employer_job_rejected_v1` | Utility | *in review* | no |
| `employer_verification_rejected_v1` | Utility | *in review* | no |
| `seeker_invited_to_apply_v1` | Utility | **Marketing** | **yes** |
| `employer_plan_expiring_v1` | Utility | **Marketing** | **yes** |
| `seeker_job_matches_v1` | Marketing | Marketing | yes |

### What the classifier actually enforces

Two Utility predictions in this document were refused, and the pattern is
consistent once you stop arguing with it:

- **A message is Utility only when it reports a state change to a thing the
  recipient already owns.** A posting that went live, a payment that landed, a
  profile whose contact details were released. The event has already happened
  and the recipient is the owner of the thing it happened to.
- **Anything whose purpose is to get the recipient to come back and act is
  Marketing**, however factual the wording. "Your plan expires in 3 days …
  renew to keep them running" is a renewal prompt. "An employer shortlisted
  you" introduces a relationship that does not exist yet. Dropping the button
  and the header did not change either verdict — because the *purpose* is what
  is being read, not the furniture.

The note below claiming renewal notices are "expressly allowed as Utility" was
wrong and `employer_plan_expiring_v1` is the proof.

### The consequence that needs code

`employer_plan_expiring_v1` is the renewal nudge and it is now consent-gated.
`users.whatsappOptIn` covers employers — the column is on User, not
SeekerProfile, for exactly this reason — but **the toggle only exists on the
seeker profile page**, so no employer can consent and the template cannot
legitimately fire at all. An employer-side toggle is a prerequisite, not a
follow-up.

---

# The submitted templates

WABA `1603050564877428` → WhatsApp Manager → Message templates → Create.

**Submit in the order below.** Safest first, so the account builds a clean
record before anything borderline is attempted.

## Rules this batch respects — don't "tidy" them

- A body may not **start or end with a variable**, and two variables may not sit
  next to each other. Every body starts with `Hi ` and ends in a full stop.
- The WhatsApp **display name is "NyxenCloud Solutions"**, not Jobs24India, so
  every body names Jobs24India in the text. Recipients otherwise cannot tell
  who is messaging them.
- **Static buttons only.** No dynamic URL variables anywhere in this batch.
  All six destinations verified live (HTTP 200) on 13 Nov 2026.
- A variable resolving to an **empty string is rejected at send time**
  (error 132000), not at approval. Two are flagged below.
- **Headers are plain text with no variables.** A variable in a header is
  another rejection surface for very little gain. A Utility header states what
  happened to something the recipient already has, in the past tense where it
  can — "Payment received", "Your job posting is live". Anything that reads as
  an announcement of something new pulls the template toward Marketing.
- Language `en`. Decline any offer to also create `en_US` — the code looks up
  one locale per template and a second causes 132001.

## What "Utility" actually means here

Meta's rule is *an existing order or account*. A message about something the
recipient already has — their posting, their plan, their payment, their
profile — is Utility. A message introducing something new, with a
"go and look at this" call to action, is Marketing however it is worded.

`seeker_invited_to_apply_v1` was submitted as Utility and the classifier
refused it. That was a misjudgement in the first version of this document: a
seeker has no existing relationship with the employer inviting them, so there
is nothing for the message to be "about". The rewrite below drops the button
and anchors it in the seeker's own account, which is the only honest route to
Utility. If it is refused again, that is the classifier's final word — switch
it to Marketing rather than rewording it a third time.

---

# 1. `employer_payment_receipt_v1` — Utility

```
Hi {{1}}, we have received your payment of {{2}} for the {{3}} plan on Jobs24India.

Order ID: {{4}}

Your plan is active and your job postings are live.
```

**Header** (text): `Payment received`
**Footer:** `Jobs24India` · **Button:** none
**Samples:** `Sachin Verma` · `Rs 999` · `Growth` · `order_R1a2b3c4d5`

A receipt needs no button, and fewer elements approve faster. Start here.

---

# 2. `employer_job_approved_v1` — Utility

```
Hi {{1}}, your job posting on Jobs24India has been approved and is now live.

Job: {{2}}

Candidates can start applying right away.
```

**Header** (text): `Your job posting is live`
**Footer:** `Jobs24India`
**Button:** Visit website → Static → `https://www.jobs24india.com/employer/dashboard`
**Samples:** `Sachin Verma` · `Delivery Executive`

---

# 3. `employer_job_rejected_v1` — Utility

```
Hi {{1}}, your job posting on Jobs24India could not be approved in its current form.

Job: {{2}}
Reason: {{3}}

Please edit the posting and submit it again.
```

**Header** (text): `Your job posting needs changes`
**Footer:** `Jobs24India`
**Button:** Visit website → Static → `https://www.jobs24india.com/employer/dashboard`
**Samples:** `Sachin Verma` · `Delivery Executive` · `Salary range was missing`

> `reason` is optional in `sendEmployerJobRejectedAlert`. The WhatsApp sender
> must substitute a default — "Does not meet our posting guidelines" — because
> an empty `{{3}}` fails at send with 132000.

---

# 4. `employer_verification_rejected_v1` — Utility

```
Hi {{1}}, we were not able to verify the company profile for {{2}} on Jobs24India.

Please check that your business details and documents are correct, then submit them again from your profile page.
```

**Header** (text): `Company verification unsuccessful`
**Footer:** `Jobs24India`
**Button:** Visit website → Static → `https://www.jobs24india.com/employer/profile`
**Samples:** `Sachin Verma` · `Ramala Collections`

---

# 5. `employer_plan_expiring_v1` — Utility

```
Hi {{1}}, the {{2}} plan on your Jobs24India account expires in {{3}}.

When it expires your active job postings are paused and candidate contact details are locked.

Renew from your account to keep them running.
```

**Header** (text): `Your plan is expiring`
**Footer:** `Jobs24India`
**Button:** Visit website → Static → `https://www.jobs24india.com/employer/plans`
**Samples:** `Sachin Verma` · `Growth` · `3 days`

> `{{3}}` carries the **whole phrase** — "3 days" or "1 day". A body cannot
> pluralise, so the sender must.

Renewal notices are expressly allowed as Utility, but the renew-flavoured CTA
is the first thing here that might draw the category warning. If it does, drop
the header first and then the button, rather than changing the category — a plan expiry genuinely is an
account message.

---

# 6. `seeker_contact_unlocked_v1` — Utility

```
Hi {{1}}, an employer on Jobs24India has unlocked your contact details to reach you about a job.

Company: {{2}}

They may call or message you on this number. If you did not expect this, you can hide your profile from your account settings.
```

**Header** (text): `Your contact details were shared`
**Footer:** `Jobs24India` · **Button:** none
**Samples:** `Akhil` · `Ramala Collections`

**No sender exists for this yet** — it needs code before it can fire. It is in
the batch because an unlock hands a seeker's phone number to a company and the
seeker is currently told nothing at all.

---

# 7. `seeker_invited_to_apply_v1` — Utility (one attempt)

```
Hi {{1}}, an employer on Jobs24India has shortlisted your profile for a role.

Job: {{2}}
Company: {{3}}
Location: {{4}}

The invitation has been saved to your Jobs24India account.
```

**Header:** none — deliberate. "You have a job invitation" is announcement
framing, and it pulls this template further toward the Marketing reading that
already got it refused once.
**Footer:** `Jobs24India` · **Button:** none
**Samples:** `Akhil` · `Delivery Executive` · `Ramala Collections` · `New Delhi`

The closing line is literally true: `/api/employer/candidates/invite` writes a
`Notification` row before it sends anything, so the invitation really is in
their account.

**If the category warning appears again, do not reword it.** Cancel, set the
category to Marketing, and submit the same body. It then falls under the
opt-in rules below.

---

# 8. `seeker_job_matches_v1` — **Marketing**

```
Hi {{1}}, {{2}} new jobs matching your skills were posted on Jobs24India today.

Top match: {{3}} at {{4}} in {{5}}

Tap below to see all of them.
```

**Header** (text): `New jobs for you`
**Footer:** `Jobs24India`
**Button:** Visit website → Static → `https://www.jobs24india.com/jobs`
**Samples:** `Akhil` · `5` · `Delivery Executive` · `Ramala Collections` · `New Delhi`

Submit this as Marketing deliberately. A digest of jobs nobody asked for by
name is a recommendation; forcing it through as Utility either bounces or gets
approved and reclassified later with a quality-rating penalty.

Consent is now recorded — `users.whatsappOptIn` / `whatsappOptInAt`, with a
toggle on the seeker profile page — so sending this is legitimate. It defaults
to false for every existing seeker, so the digest reaches nobody until people
opt in. That is correct, not a bug.

---

# Do NOT submit: `employer_verified_v1`

`employer_onboarding_complete_v1` is already approved and already says
"your employer profile for {{2}} … has been approved". A second template
saying the same thing is a near-duplicate; Meta rejects those and can drag the
original's quality rating down with it.

Point `sendEmployerVerifiedAlert` at the existing template instead.

---

# After approval

Send the approved names and parameter counts — reconcile them with

```
npx tsx scripts/test-whatsapp.ts <phone> --list-remote
```

— before the senders are written. Meta sometimes trims a template during
review, and the send must match what was approved, not what was submitted.
