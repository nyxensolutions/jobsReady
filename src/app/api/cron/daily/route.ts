import { NextRequest, NextResponse } from "next/server"
import { GET as expireJobs } from "../expire-jobs/route"
import { GET as expireSubscriptions } from "../expire-subscriptions/route"
import { GET as seekerDigest } from "../seeker-digest/route"
import { GET as employerWeekly } from "../employer-weekly/route"

/**
 * One cron that runs every scheduled job.
 *
 * Vercel's Hobby plan allows two cron entries, daily only. Four were declared
 * in vercel.json, so three never ran: jobs were never expired (making the
 * "Job active for" picker inert), subscriptions never lapsed, and employers
 * never got their weekly summary. Only the seeker digest was firing.
 *
 * Each task still lives in its own route and can be invoked directly; this
 * just calls them in turn, so there is one schedule to pay for rather than
 * four.
 *
 * Order matters: the cheap, correctness-critical updates run before the slow
 * mail-sending ones, so a timeout costs a digest rather than leaving expired
 * jobs live.
 *
 * Scheduled at 02:30 UTC, which is 08:00 IST. Vercel reads cron expressions
 * as UTC - the previous "0 8 * * *" was documented as 8 AM IST but fired at
 * 13:30 IST.
 */

export const maxDuration = 60

type Task = { name: string; run: (req: NextRequest) => Promise<Response>; only?: () => boolean }

/** IST, because that is the timezone every schedule here is written in. */
function istDayOfWeek(): number {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
  return ist.getUTCDay() // 0 = Sunday, 1 = Monday
}

const TASKS: Task[] = [
  { name: "expire-jobs", run: expireJobs },
  { name: "expire-subscriptions", run: expireSubscriptions },
  { name: "seeker-digest", run: seekerDigest },
  { name: "employer-weekly", run: employerWeekly, only: () => istDayOfWeek() === 1 },
]

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ?? req.nextUrl.searchParams.get("secret")
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  for (const task of TASKS) {
    if (task.only && !task.only()) {
      results[task.name] = "skipped"
      continue
    }
    // One failing task must not stop the rest — a mail provider outage should
    // not leave expired jobs on the site.
    try {
      const res = await task.run(req)
      results[task.name] = await res.json().catch(() => ({ status: res.status }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[cron/daily] ${task.name} failed:`, message)
      results[task.name] = { error: message }
    }
  }

  console.log("[cron/daily]", JSON.stringify(results))
  return NextResponse.json({ ran: new Date().toISOString(), results })
}
