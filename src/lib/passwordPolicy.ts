/**
 * Mirrors the password policy configured on the Firebase project: minimum 8
 * characters with an uppercase letter, a lowercase letter, a digit and a
 * symbol, enforced at sign-up.
 *
 * Checking it in the browser only buys a fast, specific message. Firebase
 * enforces the same rules server side, so a bypassed client check changes
 * nothing — which is why this never stands in for that enforcement.
 *
 * Keep this in step with Authentication → Settings → Password policy. If the
 * two drift, the symptom is Firebase rejecting a password this accepted, and
 * the user seeing a vaguer message than they should.
 */
export function meetsPasswordPolicy(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}

/** English wording for surfaces that are not translated. */
export const PASSWORD_RULE =
  "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number and a symbol."
