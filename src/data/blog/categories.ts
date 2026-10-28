// Blog taxonomy.
//
// `jobCategorySlug` maps a blog silo onto a real `categories.slug` row in the DB
// (see prisma/seed.ts). Where it is set, category pages and live-job widgets can
// link straight into /jobs?category=… — which is the whole point of the silo.
// Editorial-only silos (interviews, resumes, safety) leave it undefined.

export type BlogCategory = {
  slug: string
  label: string
  /** Short line under the category heading; also the meta description. */
  description: string
  jobCategorySlug?: string
}

export const BLOG_CATEGORIES: BlogCategory[] = [
  {
    slug: "delivery",
    label: "Delivery Jobs",
    description:
      "Salary, joining requirements and earnings breakdowns for delivery boy, courier and last-mile jobs across India.",
    jobCategorySlug: "delivery",
  },
  {
    slug: "driver",
    label: "Driver Jobs",
    description:
      "Cab, truck, company and commercial driver jobs — licence requirements, pay scales and how to get hired.",
    jobCategorySlug: "driver",
  },
  {
    slug: "security",
    label: "Security Guard Jobs",
    description:
      "Security guard salaries, shift patterns, PSARA rules and career growth in the private security industry.",
    jobCategorySlug: "security",
  },
  {
    slug: "warehouse",
    label: "Warehouse & Logistics",
    description:
      "Picker, packer, loader and inventory roles in India's fast-growing warehousing and logistics sector.",
    jobCategorySlug: "warehouse",
  },
  {
    slug: "telecaller",
    label: "Telecaller & BPO",
    description:
      "Telecalling, customer support and BPO careers — job descriptions, salary bands, skills and growth paths.",
    jobCategorySlug: "telecaller",
  },
  {
    slug: "sales",
    label: "Sales & Field Work",
    description:
      "Field sales and business development roles where incentives often matter more than the fixed salary.",
    jobCategorySlug: "sales",
  },
  {
    slug: "housekeeping",
    label: "Housekeeping",
    description:
      "Housekeeping, cleaning and facility staff roles in hotels, hospitals, malls and corporate offices.",
    jobCategorySlug: "housekeeping",
  },
  {
    slug: "factory",
    label: "Factory & Production",
    description:
      "Factory worker, machine operator and production line jobs — shifts, ESI/PF benefits and pay.",
    jobCategorySlug: "factory",
  },
  {
    slug: "data-entry",
    label: "Data Entry & Back Office",
    description:
      "Data entry, back office and computer operator roles, including genuine work-from-home options.",
    jobCategorySlug: "data-entry",
  },
  {
    slug: "salary-guides",
    label: "Salary Guides",
    description:
      "What jobs actually pay in India — role-wise and city-wise salary breakdowns based on real listings.",
  },
  {
    slug: "interview-tips",
    label: "Interview Tips",
    description:
      "How to prepare for and clear interviews for frontline jobs, with sample answers.",
  },
  {
    slug: "resume",
    label: "Resume & Profile",
    description:
      "Build a resume and a job profile that gets shortlisted — even if you have no formal work experience.",
  },
  {
    slug: "job-safety",
    label: "Job Safety & Scams",
    description:
      "Spot fake job offers, avoid registration-fee frauds and stay safe while searching for work online.",
  },
  {
    slug: "career-guide",
    label: "Career Guide",
    description:
      "Choosing a career path, switching roles and growing from an entry-level job into a supervisory one.",
  },
]

export function getBlogCategory(slug: string): BlogCategory | undefined {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)
}

/** Hindi label + description per category slug, shown on /hi/ pages. */
export const CATEGORY_HI: Record<string, { label: string; description: string }> = {
  delivery: {
    label: "डिलीवरी जॉब",
    description:
      "डिलीवरी बॉय, कूरियर और लास्ट-माइल डिलीवरी की नौकरियों में सैलरी, जॉइनिंग की शर्तें और असली कमाई का हिसाब।",
  },
  driver: {
    label: "ड्राइवर जॉब",
    description:
      "कैब, ट्रक, कंपनी और कमर्शियल ड्राइवर की नौकरियां — लाइसेंस की ज़रूरत, सैलरी और नौकरी पाने का तरीका।",
  },
  security: {
    label: "सिक्योरिटी गार्ड जॉब",
    description:
      "सिक्योरिटी गार्ड की सैलरी, शिफ्ट, PSARA के नियम और प्राइवेट सिक्योरिटी में आगे बढ़ने के रास्ते।",
  },
  warehouse: {
    label: "वेयरहाउस और लॉजिस्टिक्स",
    description:
      "भारत के तेज़ी से बढ़ते वेयरहाउस और लॉजिस्टिक्स सेक्टर में पिकर, पैकर, लोडर और इन्वेंटरी की नौकरियां।",
  },
  telecaller: {
    label: "टेलीकॉलर और BPO",
    description:
      "टेलीकॉलिंग, कस्टमर सपोर्ट और BPO करियर — काम क्या है, सैलरी कितनी है, कौन-सी स्किल चाहिए और आगे कैसे बढ़ें।",
  },
  sales: {
    label: "सेल्स और फील्ड वर्क",
    description:
      "फील्ड सेल्स और बिज़नेस डेवलपमेंट की नौकरियां, जहां इंसेंटिव अक्सर फिक्स्ड सैलरी से ज़्यादा मायने रखता है।",
  },
  housekeeping: {
    label: "हाउसकीपिंग",
    description:
      "होटल, अस्पताल, मॉल और ऑफिस में हाउसकीपिंग, सफाई और फैसिलिटी स्टाफ की नौकरियां।",
  },
  factory: {
    label: "फैक्ट्री और प्रोडक्शन",
    description:
      "फैक्ट्री वर्कर, मशीन ऑपरेटर और प्रोडक्शन लाइन की नौकरियां — शिफ्ट, ESI/PF के फायदे और सैलरी।",
  },
  "data-entry": {
    label: "डेटा एंट्री और बैक ऑफिस",
    description:
      "डेटा एंट्री, बैक ऑफिस और कंप्यूटर ऑपरेटर की नौकरियां, साथ में घर से काम के असली मौके।",
  },
  "salary-guides": {
    label: "सैलरी गाइड",
    description:
      "भारत में नौकरियों में असल में कितनी सैलरी मिलती है — अलग-अलग जॉब और शहरों के हिसाब से सही जानकारी।",
  },
  "interview-tips": {
    label: "इंटरव्यू टिप्स",
    description:
      "फ्रंटलाइन और एंट्री-लेवल नौकरियों के इंटरव्यू की तैयारी कैसे करें और उसे कैसे पास करें, सैंपल जवाब के साथ।",
  },
  resume: {
    label: "रिज्यूमे और प्रोफाइल",
    description:
      "ऐसा रिज्यूमे और जॉब प्रोफाइल बनाएं जो शॉर्टलिस्ट हो — भले ही आपके पास काम का कोई अनुभव न हो।",
  },
  "job-safety": {
    label: "जॉब सेफ्टी और ठगी से बचाव",
    description:
      "फर्जी जॉब ऑफर पहचानें, रजिस्ट्रेशन फीस की ठगी से बचें और ऑनलाइन नौकरी ढूंढते समय सुरक्षित रहें।",
  },
  "career-guide": {
    label: "करियर गाइड",
    description:
      "सही करियर चुनना, जॉब बदलना और एंट्री-लेवल नौकरी से सुपरवाइज़र तक पहुंचना।",
  },
}
