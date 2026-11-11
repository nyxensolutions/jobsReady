/**
 * Seeds the skill vocabulary. Idempotent — upserts by slug, so re-running
 * updates names, aliases and category mappings without duplicating rows.
 *
 * DRY RUN BY DEFAULT. Pass --apply to write.
 *
 * Aliases exist because the search matches what people type, not what the
 * taxonomy calls things: someone looking for delivery work types "bike", not
 * "Two-Wheeler Riding". Keep adding to them as real input is observed.
 */
import { prisma } from "../src/lib/db"

const APPLY = process.argv.includes("--apply")

type Seed = {
  slug: string
  nameEn: string
  nameHi?: string
  cats: string[]
  aliases?: string[]
}

const SKILLS: Seed[] = [
  // ── Driving & delivery ───────────────────────────────────────────────────
  { slug: "two-wheeler-riding", nameEn: "Two-Wheeler Riding", nameHi: "दोपहिया चलाना", cats: ["delivery", "driver", "fieldWork"], aliases: ["bike", "scooter", "motorcycle", "two wheeler", "2 wheeler"] },
  { slug: "car-driving", nameEn: "Car Driving", nameHi: "कार चलाना", cats: ["driver"], aliases: ["car", "taxi", "cab", "four wheeler"] },
  { slug: "commercial-driving", nameEn: "Commercial Vehicle Driving", cats: ["driver", "warehouse"], aliases: ["truck", "lorry", "tempo", "van", "heavy vehicle", "hmv"] },
  { slug: "auto-rickshaw", nameEn: "Auto Rickshaw Driving", cats: ["driver"], aliases: ["auto", "rickshaw", "three wheeler"] },
  { slug: "valid-driving-licence", nameEn: "Valid Driving Licence", cats: ["driver", "delivery"], aliases: ["dl", "licence", "license", "driving license"] },
  { slug: "route-navigation", nameEn: "Route Navigation", cats: ["delivery", "driver"], aliases: ["google maps", "maps", "navigation", "gps"] },
  { slug: "last-mile-delivery", nameEn: "Last-Mile Delivery", cats: ["delivery"], aliases: ["courier", "parcel", "food delivery", "swiggy", "zomato"] },
  { slug: "vehicle-maintenance", nameEn: "Basic Vehicle Maintenance", cats: ["driver", "mechanic"], aliases: ["servicing", "puncture"] },

  // ── Security ─────────────────────────────────────────────────────────────
  { slug: "security-guarding", nameEn: "Security Guarding", nameHi: "सुरक्षा गार्ड", cats: ["security"], aliases: ["guard", "watchman", "chowkidar", "bouncer"] },
  { slug: "cctv-monitoring", nameEn: "CCTV Monitoring", cats: ["security"], aliases: ["cctv", "camera", "surveillance"] },
  { slug: "access-control", nameEn: "Gate & Access Control", cats: ["security"], aliases: ["gate", "visitor entry", "gatekeeper"] },
  { slug: "fire-safety", nameEn: "Fire Safety", cats: ["security", "construction", "factory"], aliases: ["fire", "extinguisher", "safety drill"] },
  { slug: "patrolling", nameEn: "Patrolling", cats: ["security"], aliases: ["rounds", "night patrol"] },

  // ── Housekeeping & facility ──────────────────────────────────────────────
  { slug: "housekeeping", nameEn: "Housekeeping", nameHi: "हाउसकीपिंग", cats: ["housekeeping", "hospitality"], aliases: ["cleaning", "safai", "janitor"] },
  { slug: "deep-cleaning", nameEn: "Deep Cleaning", cats: ["housekeeping"], aliases: ["floor cleaning", "scrubbing"] },
  { slug: "laundry", nameEn: "Laundry & Ironing", cats: ["housekeeping", "hospitality"], aliases: ["washing", "ironing", "press", "dhobi"] },
  { slug: "pantry-service", nameEn: "Pantry Service", cats: ["housekeeping", "peon", "hospitality"], aliases: ["pantry", "tea", "office boy"] },
  { slug: "gardening", nameEn: "Gardening", cats: ["housekeeping"], aliases: ["mali", "landscaping", "plants"] },

  // ── Cooking & food ───────────────────────────────────────────────────────
  { slug: "cooking", nameEn: "Cooking", nameHi: "खाना बनाना", cats: ["cook", "hospitality"], aliases: ["chef", "cook", "khana"] },
  { slug: "north-indian-cuisine", nameEn: "North Indian Cuisine", cats: ["cook"], aliases: ["punjabi", "tandoor", "roti", "north indian"] },
  { slug: "south-indian-cuisine", nameEn: "South Indian Cuisine", cats: ["cook"], aliases: ["dosa", "idli", "sambar", "south indian"] },
  { slug: "chinese-cuisine", nameEn: "Chinese Cuisine", cats: ["cook"], aliases: ["chinese", "noodles", "manchurian"] },
  { slug: "continental-cuisine", nameEn: "Continental Cuisine", cats: ["cook"], aliases: ["continental", "italian", "pasta", "european"] },
  { slug: "baking", nameEn: "Baking & Bakery", cats: ["cook"], aliases: ["baker", "cake", "bread", "pastry"] },
  { slug: "kitchen-helper", nameEn: "Kitchen Helper", cats: ["cook", "hospitality"], aliases: ["commis", "kitchen staff", "helper"] },
  { slug: "food-hygiene", nameEn: "Food Hygiene & Safety", cats: ["cook", "hospitality"], aliases: ["fssai", "hygiene"] },

  // ── Hospitality & service ────────────────────────────────────────────────
  { slug: "waiter-service", nameEn: "Waiter / Table Service", cats: ["waiter", "hospitality"], aliases: ["waiter", "steward", "server", "table"] },
  { slug: "front-desk", nameEn: "Front Desk / Reception", cats: ["hospitality", "hr-admin"], aliases: ["reception", "receptionist", "front office"] },
  { slug: "room-service", nameEn: "Room Service", cats: ["hospitality"], aliases: ["room boy", "attendant"] },
  { slug: "bartending", nameEn: "Bartending", cats: ["hospitality", "waiter"], aliases: ["bartender", "bar"] },
  { slug: "event-setup", nameEn: "Event Setup", cats: ["hospitality"], aliases: ["banquet", "catering", "event"] },

  // ── Retail & sales ───────────────────────────────────────────────────────
  { slug: "customer-handling", nameEn: "Customer Handling", nameHi: "ग्राहक सेवा", cats: ["retail", "telecaller", "hospitality", "sales", "shop-assistant"], aliases: ["customer service", "customer care", "crm"] },
  { slug: "billing-pos", nameEn: "Billing / POS", cats: ["cashier", "retail", "shop-assistant"], aliases: ["billing", "cash counter", "pos", "swipe machine"] },
  { slug: "cash-handling", nameEn: "Cash Handling", cats: ["cashier", "retail", "banking"], aliases: ["cash", "cashier"] },
  { slug: "stock-management", nameEn: "Stock & Inventory", cats: ["retail", "warehouse", "shop-assistant"], aliases: ["inventory", "stock", "stocking"] },
  { slug: "merchandising", nameEn: "Visual Merchandising", cats: ["retail"], aliases: ["display", "shelf", "merchandising"] },
  { slug: "field-sales", nameEn: "Field Sales", cats: ["sales", "fieldWork"], aliases: ["sales", "field work", "door to door", "b2b", "b2c"] },
  { slug: "target-achievement", nameEn: "Sales Target Achievement", cats: ["sales", "telecaller", "insurance-agent"], aliases: ["targets", "quota"] },
  { slug: "lead-generation", nameEn: "Lead Generation", cats: ["sales", "marketing", "telecaller"], aliases: ["leads", "prospecting"] },

  // ── Telecalling & BPO ────────────────────────────────────────────────────
  { slug: "telecalling", nameEn: "Telecalling", nameHi: "टेलीकॉलिंग", cats: ["telecaller"], aliases: ["calling", "tele calling", "cold calling", "bpo", "call center"] },
  { slug: "outbound-calling", nameEn: "Outbound Calling", cats: ["telecaller", "sales"], aliases: ["outbound", "dialing"] },
  { slug: "inbound-support", nameEn: "Inbound Support", cats: ["telecaller"], aliases: ["inbound", "helpdesk", "support"] },
  { slug: "crm-software", nameEn: "CRM Software", cats: ["telecaller", "sales", "it"], aliases: ["crm", "salesforce", "leadsquared"] },

  // ── Construction & trades ────────────────────────────────────────────────
  { slug: "masonry", nameEn: "Masonry", nameHi: "राजमिस्त्री", cats: ["construction"], aliases: ["mason", "mistri", "rajmistri", "brick"] },
  { slug: "carpentry", nameEn: "Carpentry", nameHi: "बढ़ईगीरी", cats: ["carpenter", "construction"], aliases: ["carpenter", "wood", "furniture", "badhai"] },
  { slug: "plumbing", nameEn: "Plumbing", nameHi: "प्लंबिंग", cats: ["plumber", "construction"], aliases: ["plumber", "pipe", "tap", "sanitary"] },
  { slug: "electrical-wiring", nameEn: "Electrical Wiring", nameHi: "बिजली का काम", cats: ["electrician", "construction"], aliases: ["electrician", "wiring", "bijli", "electrical"] },
  { slug: "painting", nameEn: "Painting", cats: ["construction"], aliases: ["painter", "whitewash", "putty"] },
  { slug: "welding", nameEn: "Welding", cats: ["construction", "factory", "mechanic"], aliases: ["welder", "arc welding", "gas welding"] },
  { slug: "tiling", nameEn: "Tiling & Flooring", cats: ["construction"], aliases: ["tiles", "marble", "flooring"] },
  { slug: "shuttering", nameEn: "Shuttering & Centering", cats: ["construction"], aliases: ["shuttering", "centering", "formwork"] },
  { slug: "bar-bending", nameEn: "Bar Bending", cats: ["construction"], aliases: ["steel fixing", "saria", "rebar"] },
  { slug: "helper-labour", nameEn: "General Labour / Helper", cats: ["construction", "factory", "warehouse"], aliases: ["helper", "labour", "mazdoor", "unskilled"] },

  // ── Factory & technical ──────────────────────────────────────────────────
  { slug: "machine-operation", nameEn: "Machine Operation", cats: ["factory"], aliases: ["operator", "machine"] },
  { slug: "cnc-operation", nameEn: "CNC Operation", cats: ["factory", "mechanic"], aliases: ["cnc", "vmc", "lathe"] },
  { slug: "quality-check", nameEn: "Quality Check", cats: ["factory"], aliases: ["qc", "quality", "inspection"] },
  { slug: "assembly-line", nameEn: "Assembly Line Work", cats: ["factory"], aliases: ["assembly", "production line"] },
  { slug: "packing", nameEn: "Packing & Packaging", cats: ["factory", "warehouse"], aliases: ["packing", "packaging", "labelling"] },
  { slug: "ac-repair", nameEn: "AC & Refrigeration Repair", cats: ["mechanic"], aliases: ["ac", "hvac", "fridge", "refrigeration"] },
  { slug: "two-wheeler-repair", nameEn: "Two-Wheeler Repair", cats: ["mechanic"], aliases: ["bike mechanic", "scooter repair"] },
  { slug: "four-wheeler-repair", nameEn: "Car Repair", cats: ["mechanic"], aliases: ["car mechanic", "automobile", "denting", "painting"] },
  { slug: "mobile-repair", nameEn: "Mobile Repair", cats: ["mechanic", "it"], aliases: ["mobile repairing", "phone repair"] },
  { slug: "forklift-operation", nameEn: "Forklift Operation", cats: ["warehouse", "factory"], aliases: ["forklift", "hydra", "stacker"] },

  // ── Warehouse & logistics ────────────────────────────────────────────────
  { slug: "loading-unloading", nameEn: "Loading & Unloading", cats: ["warehouse", "delivery"], aliases: ["loading", "unloading", "hamali"] },
  { slug: "dispatch", nameEn: "Dispatch & Despatch", cats: ["warehouse"], aliases: ["dispatch", "despatch", "outward"] },
  { slug: "barcode-scanning", nameEn: "Barcode Scanning", cats: ["warehouse", "retail"], aliases: ["barcode", "scanner", "scanning"] },
  { slug: "warehouse-management", nameEn: "Warehouse Management", cats: ["warehouse"], aliases: ["wms", "godown", "store keeping", "storekeeper"] },

  // ── Office, admin & data ─────────────────────────────────────────────────
  { slug: "data-entry", nameEn: "Data Entry", nameHi: "डेटा एंट्री", cats: ["data-entry", "hr-admin"], aliases: ["typing", "data entry operator", "deo"] },
  { slug: "ms-excel", nameEn: "MS Excel", cats: ["data-entry", "accounting", "hr-admin", "it"], aliases: ["excel", "spreadsheet", "vlookup"] },
  { slug: "ms-word", nameEn: "MS Word", cats: ["data-entry", "hr-admin"], aliases: ["word", "ms office", "msoffice"] },
  { slug: "computer-basics", nameEn: "Basic Computer Skills", cats: ["data-entry", "it", "hr-admin"], aliases: ["computer", "typing", "internet"] },
  { slug: "email-handling", nameEn: "Email Handling", cats: ["hr-admin", "data-entry"], aliases: ["email", "outlook", "gmail"] },
  { slug: "filing-records", nameEn: "Filing & Record Keeping", cats: ["hr-admin", "peon"], aliases: ["filing", "records", "documentation"] },
  { slug: "office-errands", nameEn: "Office Errands", cats: ["peon", "runner"], aliases: ["peon", "office boy", "runner", "messenger"] },
  { slug: "document-delivery", nameEn: "Document Delivery", cats: ["runner", "delivery"], aliases: ["documents", "courier"] },

  // ── Accounts & finance ───────────────────────────────────────────────────
  { slug: "tally", nameEn: "Tally", cats: ["accounting"], aliases: ["tally erp", "tally prime"] },
  { slug: "bookkeeping", nameEn: "Bookkeeping", cats: ["accounting"], aliases: ["accounts", "ledger", "accounting"] },
  { slug: "gst-filing", nameEn: "GST Filing", cats: ["accounting"], aliases: ["gst", "returns", "tax"] },
  { slug: "invoicing", nameEn: "Invoicing", cats: ["accounting", "cashier"], aliases: ["invoice", "bill"] },
  { slug: "banking-operations", nameEn: "Banking Operations", cats: ["banking"], aliases: ["bank", "teller", "kyc"] },
  { slug: "loan-processing", nameEn: "Loan Processing", cats: ["banking"], aliases: ["loan", "credit", "dsa"] },
  { slug: "insurance-sales", nameEn: "Insurance Sales", cats: ["insurance-agent", "banking", "sales"], aliases: ["insurance", "lic", "policy"] },

  // ── Healthcare ───────────────────────────────────────────────────────────
  { slug: "patient-care", nameEn: "Patient Care", cats: ["healthcare"], aliases: ["nursing", "attendant", "caretaker", "ward boy"] },
  { slug: "first-aid", nameEn: "First Aid", cats: ["healthcare", "security", "construction"], aliases: ["first aid", "cpr"] },
  { slug: "pharmacy-assistance", nameEn: "Pharmacy Assistance", cats: ["healthcare", "retail"], aliases: ["pharmacy", "chemist", "medical store"] },
  { slug: "lab-assistance", nameEn: "Lab Assistance", cats: ["healthcare"], aliases: ["lab", "pathology", "sample collection"] },
  { slug: "elderly-care", nameEn: "Elderly Care", cats: ["healthcare"], aliases: ["old age", "elder care", "home nursing"] },

  // ── Beauty, tailoring & crafts ───────────────────────────────────────────
  { slug: "hair-styling", nameEn: "Hair Styling", cats: ["beautician"], aliases: ["hair", "salon", "barber", "hair cutting"] },
  { slug: "makeup", nameEn: "Makeup", cats: ["beautician"], aliases: ["makeup", "bridal"] },
  { slug: "beauty-therapy", nameEn: "Beauty Therapy", cats: ["beautician"], aliases: ["facial", "spa", "massage", "mehendi"] },
  { slug: "stitching", nameEn: "Stitching & Tailoring", nameHi: "सिलाई", cats: ["tailor"], aliases: ["tailor", "silai", "sewing", "darzi"] },
  { slug: "embroidery", nameEn: "Embroidery", cats: ["tailor"], aliases: ["embroidery", "zari", "kadhai"] },
  { slug: "pattern-cutting", nameEn: "Pattern Cutting", cats: ["tailor"], aliases: ["cutting", "pattern master"] },

  // ── Teaching ─────────────────────────────────────────────────────────────
  { slug: "classroom-teaching", nameEn: "Classroom Teaching", cats: ["teaching"], aliases: ["teacher", "teaching", "faculty"] },
  { slug: "home-tutoring", nameEn: "Home Tutoring", cats: ["tuition-teacher", "teaching"], aliases: ["tuition", "tutor", "home tuition"] },
  { slug: "spoken-english", nameEn: "Spoken English", cats: ["teaching", "telecaller", "hospitality"], aliases: ["english", "spoken english", "communication"] },
  { slug: "maths-science", nameEn: "Maths & Science", cats: ["teaching", "tuition-teacher"], aliases: ["maths", "math", "science", "physics", "chemistry"] },

  // ── IT & digital ─────────────────────────────────────────────────────────
  { slug: "web-development", nameEn: "Web Development", cats: ["it"], aliases: ["web", "html", "javascript", "frontend", "backend"] },
  { slug: "hardware-networking", nameEn: "Hardware & Networking", cats: ["it"], aliases: ["hardware", "networking", "lan", "router"] },
  { slug: "it-support", nameEn: "IT Support", cats: ["it"], aliases: ["helpdesk", "technical support", "desktop support"] },
  { slug: "graphic-design", nameEn: "Graphic Design", cats: ["media-creative", "marketing"], aliases: ["photoshop", "canva", "design", "designer"] },
  { slug: "video-editing", nameEn: "Video Editing", cats: ["media-creative"], aliases: ["video", "premiere", "editing", "reels"] },
  { slug: "photography", nameEn: "Photography", cats: ["media-creative"], aliases: ["photo", "camera", "photographer"] },
  { slug: "content-writing", nameEn: "Content Writing", cats: ["media-creative", "marketing"], aliases: ["content", "writing", "copywriting", "blog"] },
  { slug: "social-media", nameEn: "Social Media Handling", cats: ["marketing", "media-creative"], aliases: ["instagram", "facebook", "social media", "smm"] },
  { slug: "digital-marketing", nameEn: "Digital Marketing", cats: ["marketing"], aliases: ["seo", "ads", "google ads", "digital marketing"] },

  // ── Travel & property ────────────────────────────────────────────────────
  { slug: "ticket-booking", nameEn: "Ticket Booking", cats: ["tour-travel", "travel-advisor"], aliases: ["ticketing", "booking", "irctc", "flight"] },
  { slug: "tour-planning", nameEn: "Tour Planning", cats: ["tour-travel", "travel-advisor"], aliases: ["itinerary", "tour package", "holiday"] },
  { slug: "visa-documentation", nameEn: "Visa Documentation", cats: ["travel-advisor"], aliases: ["visa", "passport", "immigration"] },
  { slug: "property-dealing", nameEn: "Property Dealing", cats: ["broker"], aliases: ["real estate", "property", "broker", "rent"] },
  { slug: "site-visits", nameEn: "Site Visits", cats: ["broker", "construction", "fieldWork"], aliases: ["site visit", "survey"] },

  // ── Cross-cutting ────────────────────────────────────────────────────────
  { slug: "hindi-fluency", nameEn: "Hindi Fluency", cats: [], aliases: ["hindi"] },
  { slug: "english-fluency", nameEn: "English Fluency", cats: [], aliases: ["english"] },
  { slug: "team-supervision", nameEn: "Team Supervision", cats: ["construction", "factory", "warehouse", "housekeeping", "security"], aliases: ["supervisor", "team lead", "incharge"] },
  { slug: "record-maintenance", nameEn: "Record Maintenance", cats: ["hr-admin", "warehouse", "security"], aliases: ["register", "logbook"] },
  { slug: "smartphone-apps", nameEn: "Smartphone App Use", cats: ["delivery", "driver", "fieldWork"], aliases: ["smartphone", "android", "app"] },
  { slug: "upi-payments", nameEn: "UPI / Digital Payments", cats: ["cashier", "retail", "delivery"], aliases: ["upi", "paytm", "phonepe", "gpay", "digital payment"] },
  { slug: "physical-fitness", nameEn: "Physical Fitness", cats: ["security", "construction", "warehouse", "delivery"], aliases: ["fitness", "stamina", "physically fit"] },
]

async function main() {
  console.log(APPLY ? "=== APPLY — writing ===" : "=== DRY RUN — no writes ===")

  const cats = await prisma.category.findMany({ select: { slug: true } })
  const known = new Set(cats.map((c) => c.slug))

  // A typo in cats would silently produce a skill that no job can ever match,
  // which is exactly the kind of quiet nothing this table exists to replace.
  const bad: string[] = []
  for (const s of SKILLS) {
    for (const c of s.cats) if (!known.has(c)) bad.push(`${s.slug} -> ${c}`)
  }
  if (bad.length) {
    console.error(`unknown category slugs:\n  ${bad.join("\n  ")}`)
    process.exit(1)
  }

  const slugs = SKILLS.map((s) => s.slug)
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i)
  if (dupes.length) {
    console.error(`duplicate slugs: ${[...new Set(dupes)].join(", ")}`)
    process.exit(1)
  }

  console.log(`${SKILLS.length} skills across ${known.size} categories, all slugs valid`)

  const uncovered = [...known].filter((c) => !SKILLS.some((s) => s.cats.includes(c)))
  if (uncovered.length) console.log(`categories with no skill mapped: ${uncovered.join(", ")}`)

  if (!APPLY) {
    console.log("\nRe-run with --apply to write.")
    return
  }

  let i = 0
  for (const s of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: s.slug },
      create: {
        slug: s.slug,
        nameEn: s.nameEn,
        nameHi: s.nameHi ?? null,
        categorySlugs: s.cats,
        aliases: s.aliases ?? [],
        sortOrder: i,
      },
      update: {
        nameEn: s.nameEn,
        nameHi: s.nameHi ?? null,
        categorySlugs: s.cats,
        aliases: s.aliases ?? [],
        sortOrder: i,
      },
    })
    i++
  }
  console.log(`upserted ${i} skills; table now holds ${await prisma.skill.count()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
