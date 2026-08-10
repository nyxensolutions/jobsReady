import type { BlogPost } from "./types"

import telecallerJob from "./posts/telecaller-job-description-salary-skills"
import deliverySalaryIndia from "./posts/delivery-boy-salary-in-india"
import deliverySalaryGhaziabad from "./posts/delivery-boy-salary-in-ghaziabad"
import securityNightShift from "./posts/security-guard-night-shift-salary-delhi-ncr"
import fakeJobOffer from "./posts/how-to-spot-a-fake-job-offer"
import warehouseGreaterNoida from "./posts/warehouse-jobs-in-greater-noida"
import fresherResume from "./posts/resume-for-freshers-without-experience"

// Register every post here. Newest-first ordering is derived from publishedAt,
// so the order of this array does not matter.
export const ALL_POSTS: BlogPost[] = [
  telecallerJob,
  deliverySalaryIndia,
  deliverySalaryGhaziabad,
  securityNightShift,
  fakeJobOffer,
  warehouseGreaterNoida,
  fresherResume,
]

export type { BlogPost }
