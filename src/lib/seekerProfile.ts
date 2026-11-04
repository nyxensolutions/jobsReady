/**
 * What counts as a finished seeker profile.
 *
 * `isProfileComplete` was previously written only by the admin create-user
 * path and read nowhere, so every seeker reported incomplete whatever they had
 * filled in. The rule lives here so the profile route and the backfill cannot
 * drift apart.
 */

/**
 * A seeker who signs up by OTP gets their phone number as a display name, and
 * the UI already treats that as having no name at all — see the same regex in
 * seeker/dashboard, jobs/[id]/applied, SeekerProfileClient and api/auth/me.
 * Worth collapsing those into this helper at some point.
 */
export function isPhonePlaceholderName(name: string | null | undefined): boolean {
  return !name || /^\+?\d+$/.test(name.trim())
}

/**
 * Complete means "matchable": the daily digest and employer Talent Search both
 * need a city and at least one preferred category before they return anything,
 * and a real name so the message can address someone.
 */
export function isSeekerProfileComplete({
  name,
  city,
  preferredCategories,
}: {
  name: string | null | undefined
  city: string | null | undefined
  preferredCategories: string[] | null | undefined
}): boolean {
  return (
    !isPhonePlaceholderName(name) &&
    Boolean(city?.trim()) &&
    (preferredCategories ?? []).filter(Boolean).length > 0
  )
}
