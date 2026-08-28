# WhatsApp Message Templates — Jobs24India

Register these in Interakt → Templates → Create New Template.
Category: **Utility** (not Marketing — gets approved faster).
Language: **English**.

## Seeker Templates

### j24_seeker_applied
> Jobs24India: Your application for {{1}} at {{2}} was submitted. Track it at jobs24india.com

Variables: `{{1}}` = job title, `{{2}}` = company name

---

### j24_seeker_viewed
> Jobs24India: {{2}} viewed your application for {{1}}. Stay ready! jobs24india.com

Variables: `{{1}}` = job title, `{{2}}` = company name

---

### j24_seeker_shortlisted
> Jobs24India: Great news! {{2}} shortlisted you for {{1}}. Login to check. jobs24india.com

Variables: `{{1}}` = job title, `{{2}}` = company name

---

### j24_seeker_hired
> Jobs24India: Congratulations! {{2}} selected you for {{1}}. Login for details. jobs24india.com

Variables: `{{1}}` = job title, `{{2}}` = company name

---

### j24_seeker_rejected
> Jobs24India: Your application for {{1}} was not selected. Keep applying! jobs24india.com

Variables: `{{1}}` = job title

---

### j24_seeker_new_jobs
> Jobs24India: {{1}} new job(s) match your skills today. Apply now at jobs24india.com

Variables: `{{1}}` = count of new jobs

---

## Employer Templates

### j24_employer_plan_activated
> Jobs24India: Your {{1}} is active for {{2}} days. Start hiring at jobs24india.com/employer/dashboard

Variables: `{{1}}` = plan name, `{{2}}` = duration days

---

### j24_employer_plan_expiring
> Jobs24India: Your plan expires in {{1}} day(s). Renew now at jobs24india.com/employer/plans

Variables: `{{1}}` = days remaining

---

### j24_employer_plan_expired
> Jobs24India: Your plan has expired. Jobs are paused. Renew now at jobs24india.com/employer/plans

Variables: _(none)_

---

### j24_employer_weekly_summary
> Jobs24India Weekly: {{1}} active job(s), {{2}} new application(s) this week. jobs24india.com

Variables: `{{1}}` = active job count, `{{2}}` = new application count

---

## Setup Checklist

- [ ] Sign up at https://app.interakt.ai
- [ ] Add your WhatsApp Business number (needs a SIM not already on WA)
- [ ] Complete Meta Business verification (business.facebook.com)
- [ ] Create all templates above, submit for Meta approval
- [ ] Wait for approval (usually 1-24 hours for Utility templates)
- [ ] Copy API key from Interakt → Account → Developer
- [ ] Add to .env.local:  `INTERAKT_API_KEY=your_base64_key`
- [ ] Deploy — WhatsApp activates automatically alongside SMS

## Sender name

The name shown to recipients ("Jobs24India") is set in your WhatsApp Business Profile
inside Interakt → Settings → WhatsApp Business Profile → Business name.
This is separate from your DLT sender ID.
