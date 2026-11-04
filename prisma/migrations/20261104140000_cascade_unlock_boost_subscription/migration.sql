-- Let a subscription's unlock and boost rows go with it.
--
-- The baseline created both of these FKs as ON DELETE RESTRICT, so deleting a
-- user threw candidate_unlocks_subscriptionId_fkey for any employer who had
-- ever unlocked a candidate or boosted a job — the account deletion Play
-- requires us to offer. The chain already cascades user -> employer_profiles
-- -> subscriptions; these two were the only links still blocking it.
--
-- Production already has these constraints, applied via `prisma db push` on
-- 4 Nov 2026. This migration exists so a database rebuilt from history matches.
ALTER TABLE "candidate_unlocks" DROP CONSTRAINT "candidate_unlocks_subscriptionId_fkey";
ALTER TABLE "candidate_unlocks" ADD CONSTRAINT "candidate_unlocks_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "job_boosts" DROP CONSTRAINT "job_boosts_subscriptionId_fkey";
ALTER TABLE "job_boosts" ADD CONSTRAINT "job_boosts_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
