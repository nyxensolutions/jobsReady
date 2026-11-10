/**
 * Removes the Google-only bot, automation and own-test accounts identified in
 * the 11 Nov 2026 audit, from both Postgres and Firebase Auth.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 * candidate_unlocks.employerId / .seekerId and job_boosts.employerId carry no
 * foreign key, so no cascade reaches them — they are cleared explicitly first
 * or they outlive the account holding dead ids. Everything else cascades:
 * User -> EmployerProfile -> Subscription -> unlocks/boosts, and
 * JobListing -> Application.
 *
 * nyxencloud@gmail.com is deliberately NOT in this list: it is the live admin
 * login. ramalacollections@gmail.com and the five Google seekers are real
 * third parties and stay.
 */
import { adminAuth } from "../src/lib/firebase/admin"
import { prisma } from "../src/lib/db"

const APPLY = process.argv.includes("--apply")

const TARGETS = [
  // Bot signups — firstname+lastname.5digits pattern, 23-26 Oct, one sign-in each
  "brandonvaughn.63146@gmail.com",
  "darylnorman.96045@gmail.com",
  "leecollier.76788@gmail.com",
  "percymclaughlin.52788@gmail.com",
  "rossaustin.89028@gmail.com",
  "samanthachavez.55839@gmail.com",
  "timweaver.79457@gmail.com",
  "travissutton.83673@gmail.com",
  // Google Play pre-launch report / Firebase Test Lab device farm
  "l5tmg6ww6drzojnxhl4a74-lvl-00@cloudtestlabaccounts.com",
  // Owner's own test accounts, no data
  "policycounter@gmail.com",
  "sachin12verma@gmail.com",
  "ishita.sri001@gmail.com",
  // Owner's own employer accounts, confirmed for deletion 11 Nov 2026
  "adarshg1204@gmail.com",
  "helloekta85@gmail.com",
  "prakashbackgroundd@gmail.com",
  "akhil.mittal20@gmail.com",
]

async function main() {
  console.log(APPLY ? "=== APPLY — writing ===\n" : "=== DRY RUN — no writes ===\n")

  let deletedPg = 0
  let deletedFb = 0
  const fbFailures: string[] = []

  for (const email of TARGETS) {
    const fb = await adminAuth.getUserByEmail(email).catch(() => null)
    if (!fb) {
      console.log(`${email}\n   not in firebase — skipped\n`)
      continue
    }

    const u = await prisma.user.findUnique({
      where: { id: fb.uid },
      select: {
        role: true, isAdmin: true,
        employerProfile: {
          select: { id: true, companyName: true, _count: { select: { jobListings: true } } },
        },
        seekerProfile: { select: { id: true, name: true } },
      },
    })

    const parts: string[] = [`firebase uid ${fb.uid}`]
    if (!u) parts.push("no postgres row")
    else {
      parts.push(`postgres ${u.role}${u.isAdmin ? "+ADMIN" : ""}`)
      if (u.employerProfile) {
        parts.push(`employer "${u.employerProfile.companyName}" jobs=${u.employerProfile._count.jobListings}`)
      }
      if (u.seekerProfile) parts.push(`seeker "${u.seekerProfile.name}"`)
    }
    console.log(`${email}\n   ${parts.join(" | ")}`)

    if (u) {
      const empId = u.employerProfile?.id
      const seekId = u.seekerProfile?.id

      const [unlockEmp, unlockSeek, boosts] = await Promise.all([
        empId ? prisma.candidateUnlock.count({ where: { employerId: empId } }) : 0,
        seekId ? prisma.candidateUnlock.count({ where: { seekerId: seekId } }) : 0,
        empId ? prisma.jobBoost.count({ where: { employerId: empId } }) : 0,
      ])
      if (unlockEmp || unlockSeek || boosts) {
        console.log(`   fk-less rows to clear: unlocks(employer)=${unlockEmp} unlocks(seeker)=${unlockSeek} boosts=${boosts}`)
      }

      if (APPLY) {
        await prisma.$transaction(async (tx) => {
          if (empId) {
            await tx.candidateUnlock.deleteMany({ where: { employerId: empId } })
            await tx.jobBoost.deleteMany({ where: { employerId: empId } })
          }
          if (seekId) await tx.candidateUnlock.deleteMany({ where: { seekerId: seekId } })
          await tx.user.delete({ where: { id: fb.uid } })
        })
        deletedPg++
        console.log(`   postgres row deleted`)
      }
    }

    if (APPLY) {
      try {
        await adminAuth.deleteUser(fb.uid)
        deletedFb++
        console.log(`   firebase account deleted`)
      } catch (err) {
        fbFailures.push(`${email}: ${(err as Error).message}`)
        console.log(`   FIREBASE DELETE FAILED — ${(err as Error).message}`)
      }
    }
    console.log()
  }

  if (APPLY) {
    console.log(`postgres rows deleted: ${deletedPg}`)
    console.log(`firebase accounts deleted: ${deletedFb}`)
    if (fbFailures.length) console.log(`\nfirebase failures:\n  ${fbFailures.join("\n  ")}`)
  } else {
    console.log(`${TARGETS.length} accounts targeted. Re-run with --apply to execute.`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
