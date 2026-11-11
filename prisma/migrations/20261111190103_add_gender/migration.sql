-- Gender on both sides of the match. Additive and nullable throughout: every
-- existing seeker and all 265 existing listings keep NULL, which means
-- "unstated" on the seeker side and "open to anyone" on the job side.
--
-- Nothing is ever filtered by this. It only moves a job up or down within the
-- recommended section; the full listing stays complete for everyone.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
        CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
    END IF;
END
$$;

ALTER TABLE "seeker_profiles" ADD COLUMN IF NOT EXISTS "gender" "Gender";
ALTER TABLE "job_listings"   ADD COLUMN IF NOT EXISTS "genderPreference" "Gender";
