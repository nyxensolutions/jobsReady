/**
 * Salary is captured as two independent free-text fields, so nothing stops an
 * employer transposing them. A range whose top sits below its bottom renders as
 * a nonsense band ("₹5K – ₹1K/day") on every seeker-facing surface and skews
 * the minSalary filter, so it is rejected at the API rather than stored.
 *
 * Returns a message to hand back to the client, or null when the range is fine.
 * Both bounds are optional — "salary not disclosed" is a legitimate listing.
 */
export function salaryRangeError(salaryMin: unknown, salaryMax: unknown): string | null {
  const min = parseBound(salaryMin)
  const max = parseBound(salaryMax)

  if (min === "invalid") return "Minimum salary must be a number"
  if (max === "invalid") return "Maximum salary must be a number"
  if (min !== null && min < 0) return "Minimum salary cannot be negative"
  if (max !== null && max < 0) return "Maximum salary cannot be negative"
  if (min !== null && max !== null && max < min) {
    return "Maximum salary must be greater than or equal to the minimum salary"
  }
  return null
}

function parseBound(value: unknown): number | null | "invalid" {
  // Empty string / null / undefined all mean "not specified".
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : parseInt(String(value), 10)
  return Number.isFinite(parsed) ? parsed : "invalid"
}
