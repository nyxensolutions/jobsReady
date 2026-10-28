import type { PostTranslation } from "../types"

import deliverySalaryIndia from "./hi/delivery-boy-salary-in-india"
import securityNightShift from "./hi/security-guard-night-shift-salary-delhi-ncr"
import fakeJobOffer from "./hi/how-to-spot-a-fake-job-offer"
import telecallerJob from "./hi/telecaller-job-description-salary-skills"
import driverSalary from "./hi/driver-job-salary-in-india"
import fresherResume from "./hi/resume-for-freshers-without-experience"
import interviewQuestions from "./hi/common-interview-questions-freshers-answers"
import dataEntryFromHome from "./hi/data-entry-jobs-from-home-real-pay"

// Hindi translations, keyed by the English post's slug. A post with no entry
// here simply has no Hindi version: /hi/ falls back to the English text and
// canonicalises to the English URL (see contentAlternates in src/lib/seo.ts).
//
// These are written natively in Hindi for the audience, not machine-translated:
// keep search-relevant terms people actually type (सैलरी, इंटरव्यू, रिज्यूमे) and
// leave acronyms (PF, ESI, CTC, PSARA) in Latin script.
export const HI_TRANSLATIONS: Record<string, PostTranslation> = {
  "delivery-boy-salary-in-india": deliverySalaryIndia,
  "security-guard-night-shift-salary-delhi-ncr": securityNightShift,
  "how-to-spot-a-fake-job-offer": fakeJobOffer,
  "telecaller-job-description-salary-skills": telecallerJob,
  "driver-job-salary-in-india": driverSalary,
  "resume-for-freshers-without-experience": fresherResume,
  "common-interview-questions-freshers-answers": interviewQuestions,
  "data-entry-jobs-from-home-real-pay": dataEntryFromHome,
}
