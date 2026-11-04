# Automated Posting Plan — Instagram + Facebook

Daily and weekly auto-posts for both audiences, modelled on the working
`olympiadready-social` bot. Seeker content is **Hindi only**. Employer content is English.

Status: plan. Nothing built yet. §7 lists what's needed to start.

---

## 1. The two audiences never mix

| | Seekers | Employers |
|---|---|---|
| Language | **Hindi only** | English |
| Channels | Instagram (primary), Facebook Page | Facebook Page (primary), LinkedIn |
| Volume | 2 posts/day | 2 posts/week |
| Tone | Direct, practical, no jargon | Plain business, numbers-led |
| CTA | लिंक बायो में / अप्लाई फ्री | WhatsApp us, we'll post it for you |

One Instagram account, one Facebook Page. Employer posts on the Page are a small
minority of volume — which is correct, because the employer audience is reached by the
founder walking into their shop, not by a feed post. Social is there so that when an
employer looks us up after that visit, the Page looks alive.

**Do not open a second Instagram account for employers.** Two accounts means two audiences
to grow and the employer one will die. One Page, mostly seeker content, employer posts
twice a week.

---

## 2. The schedule

All IST. GitHub Actions cron drifts 5–15 minutes at busy times; that's fine.

### Daily — seekers (Hindi)

| Time | Format | Source | Channels |
|---|---|---|---|
| 08:00 | Job carousel, 6 jobs | generated from live DB | IG feed + FB Page |
| 13:00 | Job-card reel (R4 template) | generated from live DB | IG Reels + FB |
| 19:00 | Blog card (Tue/Thu/Sat) or scam-safety (Fri) | Hindi blog + bank | IG feed + FB Page |

Stories twice a day stay manual. They're the one place a human voice shows and they take
two minutes.

### Weekly — employers (English)

| Day | Time | Format | Source |
|---|---|---|---|
| Mon | 11:00 | "Last week in <cluster>": jobs posted, applications received | generated from DB |
| Thu | 11:00 | Free-until-March offer / Founding Employer | rotating bank |

### What is deliberately *not* automated

- Instagram stories
- Replies to comments and DMs — the whole point of the channel
- P5 proof content (real hires, real employers): consent-gated, always by hand
- Anything about a scam report we received
- The first two weeks of launch reels

Automation covers the repeatable 80%. The trust content is the reason the account works,
and it stays hand-written.

---

## 3. The honesty gate — the most important part

Your database today: **6 active employer-posted jobs, 265 scraped.** A naive generator
would happily render 6 scraped jobs with a ✅ वेरिफाइड badge and post it. That single bug
would undo the entire positioning, and it would do it every morning at 08:00 without
anyone watching.

So the rules are enforced in code, not in a style guide:

1. A job appears on a card only if `status = ACTIVE` **and** `source = 'EMPLOYER'` **and**
   `employer.status = 'VERIFIED'` **and** `salaryMin` is set.
2. `salaryMax < salaryMin` → the job is excluded (there's one such row live today — a Cab
   Driver at ₹5,000–1,000).
3. Fewer than 4 card-ready jobs for the slot → **skip the post entirely.** No padding with
   scraped listings, no reposting yesterday's, no "jobs coming soon" filler.
4. A skipped slot opens a GitHub issue: "08:00 carousel skipped — only 2 card-ready jobs."
   That issue is the signal to go get more employers, which is the actual fix.

Scraped jobs are genuinely useful on the site — they keep the cluster from looking empty,
and `jobs/page.tsx:90` already withholds the Verified badge from them. They just never go
on a social card with a verification claim attached.

`scripts/live-jobs-report.ts` already prints exactly what passes this gate. Run it before
turning anything on.

---

## 4. Architecture

Copy `olympiadready-social` wholesale — Actions cron, Playwright HTML→PNG rendering,
filename-as-contract overrides, token refresh. It works, it's free, and you already know it.

```
jobs24india-social/
├─ .github/workflows/
│   ├─ post-jobs-carousel.yml     08:00 daily
│   ├─ post-jobs-reel.yml         13:00 daily
│   ├─ post-evening.yml           19:00 daily
│   ├─ post-employer.yml          Mon + Thu 11:00
│   └─ refresh-token.yml          weekly
├─ generators/
│   ├─ job-card.js                job → 1080×1350 PNG (Playwright)
│   ├─ job-reel.js                5 cards → 20s MP4
│   ├─ blog-card.js               Hindi blog post → carousel
│   └─ banks/safety-hi.js         scam-safety bank, Hindi
├─ poster/
│   ├─ post-instagram.js          from olympiadready-social, unchanged
│   ├─ post-facebook.js           NEW — Page feed + reels
│   └─ lib/captions-hi.js         Hindi caption + hashtag builder
├─ content/                       drop files here to override any slot
└─ state/posted.json              dedupe, same contract as OlympiadReady
```

### Three things that are new vs OlympiadReady

**1. Facebook.** That bot is Instagram-only. Facebook needs a Page access token and the
Page's own endpoints (`/feed`, `/photos`, `/video_reels`) — a separate module, same token
plumbing. Instagram cross-posting from the API is unreliable; post to each explicitly.

**2. The content is database-driven.** OlympiadReady generates quizzes from a static bank.
Ours comes from live job rows, which is better content — never stale, never invented — and
more plumbing.

Don't give the social repo your database credentials. Add a read-only endpoint on the site
instead:

```
GET /api/social/feed?slot=carousel&cluster=okhla
Authorization: Bearer <SOCIAL_FEED_TOKEN>

→ { "jobs": [ { title, titleHi, salaryMin, salaryMax, area, shiftType,
                categoryHi, emoji, url } ], "count": 6 }
```

The honesty gate from §3 lives in that route, in the app, next to the rules it enforces —
one place, covered by the app's own types. The social repo just renders what it's given.

**3. Devanagari rendering.** Playwright must have a Devanagari font installed in the Actions
runner or every card renders as tofu boxes. Install Noto Sans Devanagari in the workflow and
set it explicitly in the card CSS. **Check the first generated PNG by eye** — this fails
silently and a month of broken cards is a real possibility.

---

## 5. The Hindi blog problem

All 25 blog posts are English. Seeker social is Hindi only. So a Hindi card linking to an
English article sends someone who reads Hindi to a page they can't read — the exact
exclusion R5 is about.

Three options:

| Option | Effort | Verdict |
|---|---|---|
| Hindi card → English article | none | Don't. Breaks the promise at the click. |
| Hindi card → no link, full value in the carousel | low | Fine as a stopgap |
| **Translate the top 8 posts to Hindi** | ~2 days | Right answer |

The third is worth doing regardless of social. The site has `/hi` and eight locales, the
audience is Hindi-first, and the blog — the best long-term seeker channel in the
strategy — is English-only. Hindi versions of these eight would be both the social fuel
and a real SEO asset:

`how-to-spot-a-fake-job-offer` · `delivery-boy-salary-in-india` ·
`walk-in-interview-how-to-prepare` · `ctc-vs-in-hand-salary-explained` ·
`how-to-read-your-salary-slip` · `pf-withdrawal-process-explained` ·
`resume-for-freshers-without-experience` · `minimum-wage-in-india-state-wise`

This is a code change (the blog data model has no translation fields today), so it's its
own piece of work, not a marketing task.

Until that lands, run the evening slot as option 2: self-contained Hindi carousels that
teach the whole thing in 6 slides and link to the job search, not the article.

---

## 6. Build order

| Phase | What | Unblocked by |
|---|---|---|
| 0 | Launch reels by hand (R2 first) | nothing — start now |
| 1 | `/api/social/feed` + honesty gate + job-card generator | 10+ verified employer jobs |
| 2 | 08:00 carousel live, IG only | phase 1 |
| 3 | Facebook poster, same slot both channels | Page token |
| 4 | 13:00 job reel | phase 2 running clean for a week |
| 5 | Evening blog/safety slot | Hindi content decision (§5) |
| 6 | Employer Mon/Thu slot | phase 3 |

**Phase 1 is gated on real employers, not on code.** With 6 verified jobs across 5 cities
there is nothing to automate — the generator would skip every morning. Five Okhla
businesses signed up is what turns this on, and that's field work.

Build phases 2 and 3 only after a week of generated cards reviewed by eye. An automated
account that posts something wrong at 08:00 daily is worse than no automated account.

---

## 7. What's needed from you

### Decisions

1. **Cluster** — Okhla or Noida Sector 63. Still open from the first day; every caption
   and every feed query filters on it.
2. **Hindi blog** — translate the 8 posts (§5), or run self-contained carousels for now?
3. **Reels in phase 4** — generated from job cards (cheap, repeatable, a bit dull), or
   stay hand-made? My take: generated for the daily job reel, hand-made for everything else.
4. **Where the social repo lives** — new `jobs24india-social` repo, or a folder in this one?
   Separate repo, to match OlympiadReady and keep Meta tokens away from app CI.

### Credentials (GitHub Actions secrets)

Same set as OlympiadReady plus Facebook:

| Secret | Where from |
|---|---|
| `IG_APP_ID`, `IG_APP_SECRET` | Meta app → Settings → Basic |
| `IG_ACCESS_TOKEN` | long-lived user token |
| `IG_USER_ID` | Instagram Business account numeric id |
| `FB_PAGE_ID` | the Facebook Page |
| `FB_PAGE_ACCESS_TOKEN` | **new** — Page token, `pages_manage_posts` |
| `SECRETS_WRITE_PAT` | optional, for automatic token rotation |
| `SOCIAL_FEED_TOKEN` | **new** — bearer token for `/api/social/feed` |

Prerequisites: Instagram converted to a Business account and linked to the Page; Meta
Business verification done (`public/Meta_App.png` suggests this is in flight — confirm
where it got to).

### Assets

- Brand kit: logo in PNG with transparency, navy `#1a3461`, Noto Sans Devanagari
- The card templates from the reel work — job card, end card, lower-third
- Instagram DP (`public/instagram_DP.png` exists) and a Page cover

### The one that actually matters

**10+ verified employer jobs in one cluster.** Not a credential, not a decision — the
thing the whole daily schedule rests on. Today there are 6, spread across five cities.
Everything in phases 1–6 waits on that, and no amount of code moves it.

---

## 8. Running cost

| Item | Cost |
|---|---|
| GitHub Actions | free (public repo, well under the limit) |
| Meta Graph API | free |
| Hosting the feed endpoint | already paid for — it's the existing app |
| Human time | ~2 hours/week reviewing output and replying to comments |

The expensive part is the review loop, and skipping it is how automated accounts quietly
start posting nonsense.
