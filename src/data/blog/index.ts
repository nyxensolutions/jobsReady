import type { BlogPost } from "./types"

import telecallerJob from "./posts/telecaller-job-description-salary-skills"
import deliverySalaryIndia from "./posts/delivery-boy-salary-in-india"
import deliverySalaryGhaziabad from "./posts/delivery-boy-salary-in-ghaziabad"
import securityNightShift from "./posts/security-guard-night-shift-salary-delhi-ncr"
import fakeJobOffer from "./posts/how-to-spot-a-fake-job-offer"
import warehouseGreaterNoida from "./posts/warehouse-jobs-in-greater-noida"
import fresherResume from "./posts/resume-for-freshers-without-experience"
import driverSalary from "./posts/driver-job-salary-in-india"
import fieldSalesSalary from "./posts/field-sales-executive-salary-incentives"
import housekeepingSalary from "./posts/housekeeping-job-description-salary"
import factoryWorkerSalary from "./posts/factory-worker-salary-shifts-benefits"
import dataEntryFromHome from "./posts/data-entry-jobs-from-home-real-pay"
import interviewQuestions from "./posts/common-interview-questions-freshers-answers"
import promotionGuide from "./posts/how-to-get-promoted-from-executive-to-supervisor"
import ctcVsInHand from "./posts/ctc-vs-in-hand-salary-explained"
import minimumWageStateWise from "./posts/minimum-wage-in-india-state-wise"
import govVsPrivateJob from "./posts/government-job-vs-private-job"
import walkInInterview from "./posts/walk-in-interview-how-to-prepare"
import deliveryNoida from "./posts/delivery-jobs-in-noida-salary-guide"
import securityGurugram from "./posts/security-guard-salary-in-gurugram"
import pfWithdrawal from "./posts/pf-withdrawal-process-explained"
import salarySlipGuide from "./posts/how-to-read-your-salary-slip"
import phoneInterviewTips from "./posts/phone-interview-tips-for-jobs"
import warehouseFaridabad from "./posts/warehouse-jobs-in-faridabad"
import bpoBangalore from "./posts/bpo-telecaller-jobs-in-bangalore"

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
  driverSalary,
  fieldSalesSalary,
  housekeepingSalary,
  factoryWorkerSalary,
  dataEntryFromHome,
  interviewQuestions,
  promotionGuide,
  ctcVsInHand,
  minimumWageStateWise,
  govVsPrivateJob,
  walkInInterview,
  deliveryNoida,
  securityGurugram,
  pfWithdrawal,
  salarySlipGuide,
  phoneInterviewTips,
  warehouseFaridabad,
  bpoBangalore,
]

export type { BlogPost }
