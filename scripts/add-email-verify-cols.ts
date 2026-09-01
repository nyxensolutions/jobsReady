/**
 * One-off migration: add email verification columns to users table.
 * Safe — only adds columns, no data dropped.
 * Run: npx tsx scripts/add-email-verify-cols.ts
 */
import { prisma } from "../src/lib/db"

async function main() {
  console.log("Adding email verification columns to users table…")

  await prisma.$executeRawUnsafe(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS "emailVerified"      BOOLEAN   NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS "emailVerifyToken"   TEXT      UNIQUE,
      ADD COLUMN IF NOT EXISTS "emailVerifyExpires" TIMESTAMP WITH TIME ZONE;
  `)

  console.log("Done ✅")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
