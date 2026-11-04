<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# The database in `.env.local` is production

There is no local database. `DATABASE_URL` and `DIRECT_URL` both point at the live
Supabase instance, so anything you run from this checkout reads and writes real
seeker, employer and application rows.

**Never run `prisma db push`, `prisma migrate dev`, or `prisma migrate reset`.**
`db push` applies schema changes with no migration record; `migrate dev` and
`migrate reset` can drop and recreate the schema when they decide it has drifted.

This is not hypothetical. On 4 Nov 2026 a `db push` created `job_listings.area`
outside the migration history. The next `prisma migrate deploy` failed with
Postgres 42701 — *column already exists* — and a failed migration blocks every
later one until a human resolves it. A second push the same day did the same to
two foreign-key constraints. Both had to be reconciled by hand, and both left a
migration whose SQL now has to say "production already has this".

To change the schema:

1. Edit `prisma/schema.prisma`, then `npx prisma validate` and `npx prisma format`.
2. Hand-write `prisma/migrations/<UTC timestamp>_<name>/migration.sql`.
   Don't use `migrate dev --create-only`; it wants a shadow database.
3. `npx prisma migrate deploy`.
4. `npx prisma generate`.

Make every migration idempotent (`ADD COLUMN IF NOT EXISTS`, `DROP CONSTRAINT IF
EXISTS`). A fresh database or a preview branch has to be able to replay the whole
history, and some of it describes changes production already has.

A script that queries the database is read-only unless the user asked for a write.
Say which it is before you run it.
