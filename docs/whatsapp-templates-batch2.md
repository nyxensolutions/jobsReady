# WhatsApp templates — batch 2

Paste each body into **Meta Business Suite → WhatsApp Manager → Message
templates → Create template**, on WABA `1603050564877428`.

Rules this batch already respects, so don't "tidy" them:

- A body may not **start or end with a variable**, and two variables may not sit
  next to each other. Every body here starts with `Hi ` and ends in a full stop.
- The WhatsApp **display name is "NyxenCloud Solutions"**, not Jobs24India, so
  every body names Jobs24India in the text. Recipients otherwise can't tell who
  is messaging them.
- A variable that resolves to an **empty string is rejected at send time**
  (error 132000), not at approval. Notes below flag the two that can.
- Language: `en`. Do not accept Meta's offer to also create `en_US`; the code
  looks up one locale per template and a second one causes 132001.

---

## Tier 1 — seeker, UTILITY

Reaches 41 of 47 seekers. Email reaches 6. These are the ones that matter.

### 1. `seeker_invited_to_apply_v1`

**Category:** Utility · **Language:** en

**Header** (text): `You have a job invitation`

**Body:**
```
Hi {{1}}, an employer has reviewed your profile on Jobs24India and invited you to apply for a role.

Job: {{2}}
Company: {{3}}
Location: {{4}}

Tap below to see the full details and apply.
```

**Footer:** `Jobs24India`

**Button:** Visit website → Dynamic →
`https://www.jobs24india.com/jobs/{{1}}`

**Samples:** `Akhil` · `Delivery Executive` · `Ramala Collections` · `New Delhi`
· button: `a1b2c3d4-0000-0000-0000-000000000000`

Pairs with `sendCandidateInviteEmail`, which today reaches almost nobody.

### 2. `seeker_contact_unlocked_v1`

**Category:** Utility · **Language:** en

**Body:**
```
Hi {{1}}, an employer on Jobs24India has unlocked your contact details to reach you about a job.

Company: {{2}}

They may call or message you on this number. If you did not expect this, you can hide your profile from your account settings.
```

**Footer:** `Jobs24India`

**Samples:** `Akhil` · `Ramala Collections`

**No sender exists for this yet** — it's the one template here that needs code
before it can fire. Included because an unlock hands your phone number to a
company and the seeker is currently told nothing at all.

---

## Tier 2 — employer, UTILITY

Reaches 7 of 11 employers. Small today, but these are the monetisation and
moderation paths, so they should exist before volume arrives.

### 3. `employer_job_approved_v1`

**Body:**
```
Hi {{1}}, your job posting on Jobs24India has been approved and is now live.

Job: {{2}}

Candidates can start applying right away.
```
**Footer:** `Jobs24India` ·
**Button:** Visit website → Dynamic → `https://www.jobs24india.com/jobs/{{1}}`
**Samples:** `Sachin Verma` · `Delivery Executive` · button: a job id

### 4. `employer_job_rejected_v1`

**Body:**
```
Hi {{1}}, your job posting on Jobs24India could not be approved in its current form.

Job: {{2}}
Reason: {{3}}

Please edit the posting and submit it again.
```
**Footer:** `Jobs24India` ·
**Button:** Visit website → Static → `https://www.jobs24india.com/employer/dashboard`
**Samples:** `Sachin Verma` · `Delivery Executive` · `Salary range was missing`

> `reason` is optional in `sendEmployerJobRejectedAlert`. The WhatsApp sender
> must substitute a default — "Does not meet our posting guidelines" — because
> an empty `{{3}}` is rejected at send time.

### 5. `employer_verification_rejected_v1`

**Body:**
```
Hi {{1}}, we were not able to verify the company profile for {{2}} on Jobs24India.

Please check that your business details and documents are correct, then submit them again from your profile page.
```
**Footer:** `Jobs24India` ·
**Button:** Visit website → Static → `https://www.jobs24india.com/employer/profile`
**Samples:** `Sachin Verma` · `Ramala Collections`

### 6. `employer_plan_expiring_v1`

**Body:**
```
Hi {{1}}, the {{2}} plan on your Jobs24India account expires in {{3}}.

When it expires your active job postings are paused and candidate contact details are locked.

Renew from your account to keep them running.
```
**Footer:** `Jobs24India` ·
**Button:** Visit website → Static → `https://www.jobs24india.com/employer/plans`
**Samples:** `Sachin Verma` · `Growth` · `3 days`

> `{{3}}` carries the **whole phrase**, "3 days" or "1 day" — not the number.
> The body cannot pluralise, so the sender must.

### 7. `employer_payment_receipt_v1`

**Body:**
```
Hi {{1}}, we have received your payment of {{2}} for the {{3}} plan on Jobs24India.

Order ID: {{4}}

Your plan is active and your job postings are live.
```
**Footer:** `Jobs24India`
**Samples:** `Sachin Verma` · `Rs 999` · `Growth` · `order_R1a2b3c4d5`

No button — a receipt doesn't need one, and fewer elements approve faster.

---

## Do NOT submit: `employer_verified_v1`

`employer_onboarding_complete_v1` is already approved and already says
"your employer profile for {{2}} … has been approved". A second template saying
the same thing is a near-duplicate, and Meta rejects those — sometimes taking
the original's quality rating with it.

Point `sendEmployerVerifiedAlert` at the existing template instead.

---

## Tier 3 — blocked, do not submit yet

### `seeker_job_matches_v1` — MARKETING

```
Hi {{1}}, {{2}} new jobs matching your skills were posted on Jobs24India today.

Top match: {{3}} at {{4}} in {{5}}

Tap below to see all of them.
```

This is the single highest-value message on the list — it is the reason a
seeker keeps the app — and it is the one you cannot send yet.

It is **Marketing**, not Utility. A digest of jobs a user did not ask for by
name is a recommendation, and submitting it as Utility either gets rejected or,
worse, gets approved and later reclassified with a quality-rating penalty.

Marketing requires a **recorded opt-in**, and the schema has none: `User` has
`language` and `fcmTokens`, and no consent field anywhere. Before this can be
submitted honestly you need

1. a `whatsappOptIn Boolean @default(false)` (plus a timestamp) on the seeker
   profile,
2. a checkbox at signup and in profile settings, worded as consent to job
   alerts on WhatsApp, and
3. the digest sender filtering on it.

That is maybe an hour of work and it is a prerequisite, not a nicety.
