/**
 * Template-based job description generator — no API key required.
 * Produces varied, original descriptions from structured job data.
 * Never copies source text verbatim.
 */

export interface JobDescriptionInput {
  title: string
  city: string
  salaryMin?: number
  salaryMax?: number
  salaryUnit?: string
  requirements?: string[]
  jobType?: string
  experienceMin?: number
  category?: string
  qualificationRequired?: string
}

// ── Template pools ────────────────────────────────────────────────────────────

const OPENERS: Record<string, string[]> = {
  delivery: [
    "We are hiring reliable delivery professionals to join our growing team in {city}.",
    "Join our fast-paced delivery operations in {city} and be the face of our brand.",
    "Looking for motivated individuals to handle daily deliveries across {city}.",
  ],
  driver: [
    "We need experienced drivers based in {city} for regular pick-up and drop assignments.",
    "Join our transport team in {city} and drive for a respected organization.",
    "Seeking skilled drivers in {city} with a clean record and strong road knowledge.",
  ],
  security: [
    "We are looking for disciplined security guards to protect our premises in {city}.",
    "Join our professional security team in {city} and build a stable career.",
    "Dedicated security personnel needed for day and night shifts in {city}.",
  ],
  housekeeping: [
    "We are hiring hardworking housekeeping staff to maintain cleanliness in {city}.",
    "Join our facility team in {city} and keep our spaces spotless and welcoming.",
    "Looking for attentive housekeeping professionals for full-time work in {city}.",
  ],
  cook: [
    "We are seeking a skilled cook to prepare fresh, quality meals for our team in {city}.",
    "Join our kitchen in {city} and bring your culinary talent to a supportive workplace.",
    "Looking for an experienced cook to manage daily meal preparation in {city}.",
  ],
  construction: [
    "We need skilled construction workers for ongoing projects in {city}.",
    "Join our construction crew in {city} and be part of building something lasting.",
    "Hiring experienced construction professionals for site work in {city}.",
  ],
  factory: [
    "We are recruiting factory workers for production operations in {city}.",
    "Join our manufacturing team in {city} for stable, full-time employment.",
    "Seeking hardworking factory floor staff for our facility in {city}.",
  ],
  retail: [
    "We are looking for friendly retail staff to assist customers in {city}.",
    "Join our store team in {city} and help deliver an excellent shopping experience.",
    "Hiring retail assistants for a busy outlet in {city}.",
  ],
  sales: [
    "We need energetic sales professionals to grow our customer base in {city}.",
    "Join our sales team in {city} and earn attractive incentives on top of your salary.",
    "Hiring motivated field sales executives to cover territory in {city}.",
  ],
  fieldWork: [
    "We are looking for field staff to handle on-ground operations in {city}.",
    "Join our field team in {city} and take ownership of your assigned area.",
    "Seeking responsible field workers for daily operations in {city}.",
  ],
  healthcare: [
    "We are hiring healthcare support staff for patient care duties in {city}.",
    "Join our healthcare facility in {city} and contribute to community wellbeing.",
    "Looking for dedicated healthcare workers for a clinical setting in {city}.",
  ],
  it: [
    "We are hiring IT support professionals for our office in {city}.",
    "Join our tech team in {city} and keep systems running smoothly.",
    "Looking for skilled IT staff to manage hardware and software in {city}.",
  ],
}

const DEFAULT_OPENERS = [
  "We are hiring motivated individuals for a rewarding position in {city}.",
  "Join a growing organization in {city} and build a stable career.",
  "Exciting job opportunity available in {city} — apply now.",
]

const DUTIES: Record<string, string[]> = {
  delivery: [
    "You will pick up packages from warehouses and deliver them to customers on time while maintaining accurate delivery records.",
    "Responsibilities include loading consignments, following assigned routes, collecting payments when needed, and updating the app after each delivery.",
    "You will handle parcel pickups, verify addresses, collect signatures, and report any delivery issues promptly.",
  ],
  driver: [
    "You will transport passengers or goods safely, follow traffic rules, maintain the vehicle, and report any issues to the supervisor.",
    "Duties include driving on assigned routes, keeping the vehicle clean, maintaining a logbook, and ensuring safe timely arrivals.",
    "You will operate the company vehicle, plan efficient routes, assist with loading and unloading, and coordinate with the dispatch team.",
  ],
  security: [
    "Duties include monitoring entry and exit points, conducting regular patrols, maintaining visitor logs, and responding to any security incidents.",
    "You will guard assigned premises, check credentials of visitors, manage CCTV monitoring, and report suspicious activities immediately.",
    "Responsibilities cover access control, night patrolling, emergency response, and coordinating with local authorities when required.",
  ],
  housekeeping: [
    "You will clean and maintain assigned areas, restock supplies, follow hygiene protocols, and report any maintenance needs.",
    "Duties include sweeping, mopping, sanitizing surfaces, cleaning washrooms, and keeping all common areas presentable throughout the shift.",
    "Responsibilities include deep cleaning, laundry support, waste disposal, and ensuring the facility meets health and hygiene standards.",
  ],
  cook: [
    "You will prepare meals as per the menu, maintain kitchen hygiene, manage ingredient stock, and ensure food is served on time.",
    "Duties include chopping, cooking, plating, cleaning the kitchen area, and following all food safety guidelines strictly.",
    "Responsibilities include planning daily menus, cooking in bulk for staff, maintaining freshness of ingredients, and keeping the kitchen organized.",
  ],
  construction: [
    "You will carry out assigned construction tasks, follow site safety protocols, operate basic tools, and coordinate with the site supervisor.",
    "Duties include mixing materials, laying foundations, assisting skilled tradespeople, and ensuring the worksite is clean and safe.",
    "Responsibilities cover reading work orders, completing assigned tasks on schedule, handling equipment carefully, and reporting hazards.",
  ],
  factory: [
    "You will operate assigned machinery, monitor production quality, follow safety procedures, and meet daily output targets.",
    "Duties include assembling components, inspecting finished goods, maintaining workstation cleanliness, and reporting equipment faults.",
    "Responsibilities cover running production lines, quality checking, packing finished goods, and following standard operating procedures.",
  ],
  retail: [
    "You will assist customers in finding products, process billing, manage shelf stocking, and keep the store clean and organized.",
    "Duties include greeting customers, answering queries, handling cash and digital payments, and restocking shelves as needed.",
    "Responsibilities include store upkeep, inventory checks, processing sales, and providing excellent service to every customer.",
  ],
  sales: [
    "You will visit prospects, demonstrate products, negotiate deals, collect payments, and submit daily call reports.",
    "Duties include generating leads, meeting targets, building long-term customer relationships, and coordinating with the back office.",
    "Responsibilities cover territory coverage, new customer acquisition, order booking, and achieving monthly sales goals.",
  ],
  fieldWork: [
    "You will complete assigned field tasks, liaise with clients, maintain records, and report daily progress to the team leader.",
    "Duties include on-ground surveys, data collection, stakeholder coordination, and timely submission of field reports.",
    "Responsibilities include visiting assigned locations, gathering information, resolving field-level issues, and escalating concerns.",
  ],
  healthcare: [
    "You will assist patients with daily care routines, monitor vital signs, maintain hygiene, and support nursing staff as required.",
    "Duties include patient support, record keeping, medication reminders, sanitizing equipment, and coordinating with the medical team.",
    "Responsibilities cover patient mobility assistance, ward cleanliness, feeding support, and alerting staff to any changes in patient condition.",
  ],
  it: [
    "You will set up and troubleshoot computers, manage user accounts, maintain network connectivity, and provide help-desk support.",
    "Duties include hardware maintenance, software installation, resolving tickets, and documenting IT issues and solutions.",
    "Responsibilities cover device configuration, antivirus management, user training, and ensuring uptime for all systems.",
  ],
}

const DEFAULT_DUTIES = [
  "You will perform assigned responsibilities diligently, coordinate with team members, and meet daily targets as directed by management.",
  "Duties include completing tasks on time, maintaining accurate records, communicating with supervisors, and supporting the overall team goals.",
]

const REQUIREMENTS_SENTENCES = [
  "Candidates should be physically fit, punctual, and comfortable working in a team environment.",
  "We value reliability, attention to detail, and a positive attitude towards work.",
  "The ideal candidate is honest, hardworking, and willing to take initiative on the job.",
  "Strong communication skills, a willingness to learn, and a professional approach are essential.",
]

const BENEFIT_SENTENCES = [
  "We offer timely salary, PF benefits, and a respectful workplace with growth opportunities.",
  "Enjoy weekly offs, ESI coverage, and performance-based incentives.",
  "Benefits include provident fund, medical support, uniforms, and on-time payment.",
  "We provide stable employment, on-the-job training, and a supportive management team.",
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function salaryText(input: JobDescriptionInput): string {
  if (!input.salaryMin) return "a competitive salary"
  const unit = input.salaryUnit === "daily" ? "per day" : "per month"
  const min = `₹${input.salaryMin.toLocaleString("en-IN")}`
  const max = input.salaryMax ? `–₹${input.salaryMax.toLocaleString("en-IN")}` : "+"
  return `${min}${max} ${unit}`
}

function expText(input: JobDescriptionInput): string {
  if (!input.experienceMin) return "Freshers are welcome to apply."
  if (input.experienceMin === 1) return "At least 1 year of relevant experience is preferred."
  return `Minimum ${input.experienceMin} years of experience is required.`
}

function qualText(input: JobDescriptionInput): string {
  if (!input.qualificationRequired) return ""
  const q = input.qualificationRequired.toLowerCase()
  if (q.includes("10th") || q.includes("matric")) return "10th pass candidates are eligible."
  if (q.includes("12th") || q.includes("inter")) return "12th pass or equivalent qualification required."
  if (q.includes("graduate") || q.includes("degree")) return "A graduate degree is preferred."
  if (q.includes("diploma")) return "A diploma in a relevant field is an advantage."
  return ""
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateJobDescription(input: JobDescriptionInput): string {
  // Use a stable seed based on title+city so repeated runs produce the same text
  const seed = [...(input.title + input.city)].reduce((acc, c) => acc + c.charCodeAt(0), 0)

  const cat = input.category ?? "fieldWork"
  const openers = OPENERS[cat] ?? DEFAULT_OPENERS
  const duties = DUTIES[cat] ?? DEFAULT_DUTIES

  const opener = pick(openers, seed).replace("{city}", input.city)
  const duty = pick(duties, seed + 1)
  const req = pick(REQUIREMENTS_SENTENCES, seed + 2)
  const benefit = pick(BENEFIT_SENTENCES, seed + 3)
  const exp = expText(input)
  const qual = qualText(input)
  const salary = `Salary is ${salaryText(input)}.`

  const parts = [opener, duty, req, exp, qual, salary, benefit].filter(Boolean)
  return parts.join(" ")
}
