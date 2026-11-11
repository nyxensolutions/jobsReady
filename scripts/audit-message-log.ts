/**
 * READ-ONLY. Delivery health per channel and template.
 *
 * Answers the question nothing could answer before: are any of the 31
 * notification senders actually reaching anyone?
 */
import { prisma } from "../src/lib/db"

const DAYS = parseInt(process.argv.find((a) => a.startsWith("--days="))?.split("=")[1] ?? "30")

async function main() {
  const since = new Date(Date.now() - DAYS * 86_400_000)
  const rows = await prisma.messageLog.findMany({
    where: { createdAt: { gte: since } },
    select: { channel: true, template: true, ok: true, error: true, createdAt: true },
  })

  if (rows.length === 0) {
    console.log(`no sends recorded in the last ${DAYS} days.`)
    console.log("if that is unexpected, the senders are not being reached at all —")
    console.log("which is the thing this table exists to make visible.")
    return
  }

  console.log(`${rows.length} send attempts in the last ${DAYS} days\n`)

  const byChannel = new Map<string, { ok: number; fail: number }>()
  const byTemplate = new Map<string, { ok: number; fail: number; channel: string }>()
  const errors = new Map<string, number>()

  for (const r of rows) {
    const c = byChannel.get(r.channel) ?? { ok: 0, fail: 0 }
    r.ok ? c.ok++ : c.fail++
    byChannel.set(r.channel, c)

    const key = `${r.channel}:${r.template}`
    const tpl = byTemplate.get(key) ?? { ok: 0, fail: 0, channel: r.channel }
    r.ok ? tpl.ok++ : tpl.fail++
    byTemplate.set(key, tpl)

    if (!r.ok && r.error) errors.set(r.error, (errors.get(r.error) ?? 0) + 1)
  }

  console.log("by channel")
  for (const [c, v] of [...byChannel].sort()) {
    const total = v.ok + v.fail
    const rate = Math.round((v.ok / total) * 100)
    console.log(`  ${c.padEnd(10)} ${String(v.ok).padStart(5)} ok  ${String(v.fail).padStart(5)} failed   ${rate}% delivered`)
  }

  console.log("\nby template")
  for (const [k, v] of [...byTemplate].sort((a, b) => b[1].ok + b[1].fail - (a[1].ok + a[1].fail))) {
    const flag = v.ok === 0 ? "   <-- never succeeded" : ""
    console.log(`  ${k.padEnd(46)} ${String(v.ok).padStart(4)} ok  ${String(v.fail).padStart(4)} failed${flag}`)
  }

  if (errors.size) {
    console.log("\nmost common failures")
    for (const [e, n] of [...errors].sort((a, b) => b[1] - a[1]).slice(0, 8)) {
      console.log(`  ${String(n).padStart(4)}x  ${e.slice(0, 90)}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
