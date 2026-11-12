-- WhatsApp job-alert consent.
--
-- Meta requires a recorded opt-in before a MARKETING-category template may be
-- sent. The daily job digest is Marketing; application-status and billing
-- templates are Utility and are not gated on this column.
--
-- Deliberately defaults to FALSE for every existing row. Consent cannot be
-- backfilled — no seeker who signed up before this column existed was asked
-- for it, so defaulting to TRUE would be inventing permission we do not have.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "whatsappOptInAt" TIMESTAMP(3);
