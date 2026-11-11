-- Removes the gender columns added earlier the same day.
--
-- They were never populated: every row on both tables was NULL, so there is
-- nothing to lose. The job side had no honest source — employers setting a
-- gender on a role is not something to ask for, and inferring it from listing
-- text reads "Delivery Boy" as men-only, which is a job title in India and not
-- a requirement. Tagging those 24 delivery listings MALE would have pushed
-- women away from the category growing fastest for them.
--
-- With no job-side value, the seeker column could not rank anything either,
-- leaving personal data collected in exchange for nothing.
--
-- Guarded so a database that never received the add migration can still
-- replay the history.

ALTER TABLE "job_listings"   DROP COLUMN IF EXISTS "genderPreference";
ALTER TABLE "seeker_profiles" DROP COLUMN IF EXISTS "gender";

DROP TYPE IF EXISTS "Gender";
