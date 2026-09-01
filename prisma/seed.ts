import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { FREE_PLAN_SLUG, FREE_PLAN_DURATION_DAYS, UNLIMITED } from "../src/lib/subscription"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding categories…")

  const categories = [
    { slug: "delivery", nameEn: "Delivery", nameHi: "डिलीवरी", nameTe: "డెలివరీ", nameTa: "டெலிவரி", nameKn: "ಡೆಲಿವರಿ", nameBn: "ডেলিভারি", namePa: "ਡਿਲੀਵਰੀ", icon: "Truck", sortOrder: 1 },
    { slug: "driver", nameEn: "Driver", nameHi: "ड्राइवर", nameTe: "డ్రైవర్", nameTa: "ஓட்டுனர்", nameKn: "ಚಾಲಕ", nameBn: "ড্রাইভার", namePa: "ਡਰਾਈਵਰ", icon: "Car", sortOrder: 2 },
    { slug: "sales", nameEn: "Sales", nameHi: "सेल्स", nameTe: "సేల్స్", nameTa: "விற்பனை", nameKn: "ಮಾರಾಟ", nameBn: "বিক্রয়", namePa: "ਸੇਲਜ਼", icon: "TrendingUp", sortOrder: 3 },
    { slug: "security", nameEn: "Security Guard", nameHi: "सिक्योरिटी गार्ड", nameTe: "సెక్యూరిటీ గార్డ్", nameTa: "பாதுகாப்பு காவலர்", nameKn: "ಭದ್ರತಾ ಸಿಬ್ಬಂದಿ", nameBn: "নিরাপত্তা প্রহরী", namePa: "ਸੁਰੱਖਿਆ ਗਾਰਡ", icon: "Shield", sortOrder: 4 },
    { slug: "housekeeping", nameEn: "Housekeeping", nameHi: "हाउसकीपिंग", nameTe: "హౌస్‌కీపింగ్", nameTa: "வீட்டு பராமரிப்பு", nameKn: "ಗೃಹ ನಿರ್ವಹಣೆ", nameBn: "গৃহকর্মী", namePa: "ਘਰੇਲੂ ਸਾਂਭ-ਸੰਭਾਲ", icon: "Sparkles", sortOrder: 5 },
    { slug: "cook", nameEn: "Cook / Chef", nameHi: "रसोइया / शेफ", nameTe: "వంటవాడు / చెఫ్", nameTa: "சமையல்காரர்", nameKn: "ಅಡುಗೆಯವರು", nameBn: "রাঁধুনি", namePa: "ਰਸੋਈਆ", icon: "UtensilsCrossed", sortOrder: 6 },
    { slug: "construction", nameEn: "Construction", nameHi: "निर्माण", nameTe: "నిర్మాణం", nameTa: "கட்டுமானம்", nameKn: "ನಿರ್ಮಾಣ", nameBn: "নির্মাণ", namePa: "ਨਿਰਮਾਣ", icon: "HardHat", sortOrder: 7 },
    { slug: "factory", nameEn: "Factory Worker", nameHi: "फैक्ट्री कर्मचारी", nameTe: "ఫ్యాక్టరీ కార్మికుడు", nameTa: "தொழிற்சாலை தொழிலாளர்", nameKn: "ಕಾರ್ಖಾನೆ ಕಾರ್ಮಿಕ", nameBn: "কারখানা শ্রমিক", namePa: "ਫੈਕਟਰੀ ਕਾਮਾ", icon: "Factory", sortOrder: 8 },
    { slug: "retail", nameEn: "Retail", nameHi: "रिटेल", nameTe: "రిటెయిల్", nameTa: "சில்லறை", nameKn: "ಚಿಲ್ಲರೆ", nameBn: "খুচরা", namePa: "ਰਿਟੇਲ", icon: "ShoppingBag", sortOrder: 9 },
    { slug: "fieldWork", nameEn: "Field Work", nameHi: "फील्ड वर्क", nameTe: "ఫీల్డ్ వర్క్", nameTa: "களப்பணி", nameKn: "ಕ್ಷೇತ್ರ ಕೆಲಸ", nameBn: "মাঠকর্মী", namePa: "ਫੀਲਡ ਵਰਕ", icon: "Briefcase", sortOrder: 10 },
    { slug: "it", nameEn: "IT / Computer", nameHi: "IT / कंप्यूटर", nameTe: "IT / కంప్యూటర్", nameTa: "IT / கணினி", nameKn: "IT / ಕಂಪ್ಯೂಟರ್", nameBn: "IT / কম্পিউটার", namePa: "IT / ਕੰਪਿਊਟਰ", icon: "Monitor", sortOrder: 11 },
    { slug: "healthcare", nameEn: "Healthcare", nameHi: "स्वास्थ्य सेवा", nameTe: "ఆరోగ్య సేవలు", nameTa: "சுகாதாரம்", nameKn: "ಆರೋಗ್ಯ ಸೇವೆ", nameBn: "স্বাস্থ্যসেবা", namePa: "ਸਿਹਤ ਸੇਵਾ", icon: "HeartPulse", sortOrder: 12 },
    { slug: "data-entry", nameEn: "Data Entry", nameHi: "डेटा एंट्री", nameTe: "డేటా ఎంట్రీ", nameTa: "தரவு உள்ளீடு", nameKn: "ಡೇಟಾ ಎಂಟ್ರಿ", nameBn: "ডেটা এন্ট্রি", namePa: "ਡੇਟਾ ਐਂਟਰੀ", icon: "Keyboard", sortOrder: 13 },
    { slug: "telecaller", nameEn: "Telecaller / BPO", nameHi: "टेलीकॉलर / BPO", nameTe: "టెలీకాలర్ / BPO", nameTa: "தொலைபேசி நிபுணர்", nameKn: "ಟೆಲಿಕಾಲರ್ / BPO", nameBn: "টেলিকলার / BPO", namePa: "ਟੈਲੀਕਾਲਰ / BPO", icon: "Phone", sortOrder: 14 },
    { slug: "electrician", nameEn: "Electrician", nameHi: "इलेक्ट्रीशियन", nameTe: "ఎలక్ట్రీషియన్", nameTa: "மின்சாரவாதி", nameKn: "ವಿದ್ಯುತ್ ತಂತ್ರಜ್ಞ", nameBn: "ইলেকট্রিশিয়ান", namePa: "ਇਲੈਕਟ੍ਰੀਸ਼ੀਅਨ", icon: "Zap", sortOrder: 15 },
    { slug: "plumber", nameEn: "Plumber", nameHi: "प्लंबर", nameTe: "ప్లంబర్", nameTa: "குழாய் பணியாளர்", nameKn: "ಪ್ಲಂಬರ್", nameBn: "প্লাম্বার", namePa: "ਪਲੰਬਰ", icon: "Wrench", sortOrder: 16 },
    { slug: "carpenter", nameEn: "Carpenter", nameHi: "बढ़ई / कारपेंटर", nameTe: "వడ్రంగి", nameTa: "தச்சர்", nameKn: "ಮರಗೆಲಸಗಾರ", nameBn: "কাঠমিস্ত্রি", namePa: "ਤਰਖਾਣ", icon: "Hammer", sortOrder: 17 },
    { slug: "mechanic", nameEn: "Mechanic / Technician", nameHi: "मैकेनिक / टेक्नीशियन", nameTe: "మెకానిక్ / టెక్నీషియన్", nameTa: "இயந்திர நிபுணர்", nameKn: "ಮೆಕ್ಯಾನಿಕ್ / ತಂತ್ರಜ್ಞ", nameBn: "মেকানিক / টেকনিশিয়ান", namePa: "ਮਕੈਨਿਕ / ਟੈਕਨੀਸ਼ੀਅਨ", icon: "Settings", sortOrder: 18 },
    { slug: "tailor", nameEn: "Tailor / Stitching", nameHi: "दर्जी / सिलाई", nameTe: "దర్జీ / కుట్టు", nameTa: "தையல்காரர்", nameKn: "ದರ್ಜಿ / ಹೊಲಿಗೆ", nameBn: "দর্জি / সেলাই", namePa: "ਦਰਜ਼ੀ / ਸਿਲਾਈ", icon: "Scissors", sortOrder: 19 },
    { slug: "beautician", nameEn: "Beautician / Salon", nameHi: "ब्यूटीशियन / सैलून", nameTe: "బ్యూటీషియన్ / సెలూన్", nameTa: "அழகுநர் / சலூன்", nameKn: "ಬ್ಯೂಟಿಷಿಯನ್ / ಸಲೂನ್", nameBn: "বিউটিশিয়ান / সেলুন", namePa: "ਬਿਊਟੀਸ਼ੀਅਨ / ਸੈਲੂਨ", icon: "Sparkles", sortOrder: 20 },
    { slug: "peon", nameEn: "Peon / Office Boy", nameHi: "चपरासी / ऑफिस बॉय", nameTe: "పియోన్ / ఆఫీస్ బాయ్", nameTa: "அலுவலக உதவியாளர்", nameKn: "ಪ್ಯಾದೆ / ಆಫೀಸ್ ಬಾಯ್", nameBn: "পিয়ন / অফিস বয়", namePa: "ਚਪੜਾਸੀ / ਆਫਿਸ ਬੁਆਏ", icon: "User", sortOrder: 21 },
    { slug: "accounting", nameEn: "Accounting / Finance", nameHi: "अकाउंटिंग / फाइनेंस", nameTe: "అకౌంటింగ్ / ఫైనాన్స్", nameTa: "கணக்கியல் / நிதி", nameKn: "ಅಕೌಂಟಿಂಗ್ / ಫೈನಾನ್ಸ್", nameBn: "অ্যাকাউন্টিং / ফাইন্যান্স", namePa: "ਅਕਾਊਂਟਿੰਗ / ਫਾਈਨੈਂਸ", icon: "Calculator", sortOrder: 22 },
    { slug: "teaching", nameEn: "Teaching / Tutor", nameHi: "शिक्षक / ट्यूटर", nameTe: "టీచర్ / ట్యూటర్", nameTa: "ஆசிரியர் / பயிற்சியாளர்", nameKn: "ಶಿಕ್ಷಕ / ಟ್ಯೂಟರ್", nameBn: "শিক্ষক / টিউটর", namePa: "ਅਧਿਆਪਕ / ਟਿਊਟਰ", icon: "BookOpen", sortOrder: 23 },
    { slug: "warehouse", nameEn: "Warehouse / Logistics", nameHi: "वेयरहाउस / लॉजिस्टिक्स", nameTe: "వేర్‌హౌస్ / లాజిస్టిక్స్", nameTa: "கிடங்கு / தளவாடம்", nameKn: "ವೇರ್‌ಹೌಸ್ / ಲಾಜಿಸ್ಟಿಕ್ಸ್", nameBn: "গুদাম / লজিস্টিক্স", namePa: "ਵੇਅਰਹਾਊਸ / ਲੌਜਿਸਟਿਕਸ", icon: "Warehouse", sortOrder: 24 },
    { slug: "hospitality", nameEn: "Hospitality / Hotel", nameHi: "हॉस्पिटैलिटी / होटल", nameTe: "హాస్పిటాలిటీ / హోటల్", nameTa: "விருந்தோம்பல் / ஹோட்டல்", nameKn: "ಆತಿಥ್ಯ / ಹೋಟೆಲ್", nameBn: "আতিথেয়তা / হোটেল", namePa: "ਪ੍ਰਾਹੁਣਚਾਰੀ / ਹੋਟਲ", icon: "Hotel", sortOrder: 25 },
    { slug: "banking", nameEn: "Banking / Insurance", nameHi: "बैंकिंग / बीमा", nameTe: "బ్యాంకింగ్ / ఇన్సూరెన్స్", nameTa: "வங்கியியல் / காப்பீடு", nameKn: "ಬ್ಯಾಂಕಿಂಗ್ / ವಿಮೆ", nameBn: "ব্যাংকিং / বীমা", namePa: "ਬੈਂਕਿੰਗ / ਬੀਮਾ", icon: "Landmark", sortOrder: 26 },
    { slug: "hr-admin", nameEn: "HR / Admin", nameHi: "HR / एडमिन", nameTe: "HR / అడ్మిన్", nameTa: "HR / நிர்வாகம்", nameKn: "HR / ಆಡಳಿತ", nameBn: "HR / অ্যাডমিন", namePa: "HR / ਪ੍ਰਸ਼ਾਸਨ", icon: "Users", sortOrder: 27 },
    { slug: "marketing", nameEn: "Marketing / Digital", nameHi: "मार्केटिंग / डिजिटल", nameTe: "మార్కెటింగ్ / డిజిటల్", nameTa: "சந்தைப்படுத்தல் / டிஜிட்டல்", nameKn: "ಮಾರ್ಕೆಟಿಂಗ್ / ಡಿಜಿಟಲ್", nameBn: "মার্কেটিং / ডিজিটাল", namePa: "ਮਾਰਕੀਟਿੰਗ / ਡਿਜੀਟਲ", icon: "Megaphone", sortOrder: 28 },
    { slug: "tour-travel", nameEn: "Tour & Travel", nameHi: "टूर एंड ट्रैवल", nameTe: "టూర్ & ట్రావెల్", nameTa: "சுற்றுலா & பயண", nameKn: "ಪ್ರವಾಸ & ಪ್ರಯಾಣ", nameBn: "ট্যুর ও ট্র্যাভেল", namePa: "ਟੂਰ ਅਤੇ ਟ੍ਰੈਵਲ", icon: "Plane", sortOrder: 29 },
    { slug: "travel-advisor", nameEn: "Travel Advisor", nameHi: "ट्रैवल एडवाइजर", nameTe: "ట్రావెల్ అడ్వైజర్", nameTa: "பயண ஆலோசகர்", nameKn: "ಪ್ರಯಾಣ ಸಲಹೆಗಾರ", nameBn: "ট্র্যাভেল অ্যাডভাইজার", namePa: "ਟ੍ਰੈਵਲ ਅਡਵਾਈਜ਼ਰ", icon: "MapPin", sortOrder: 30 },
    { slug: "tuition-teacher", nameEn: "Tuition / Home Tutor", nameHi: "ट्यूशन / होम ट्यूटर", nameTe: "ట్యూషన్ / హోమ్ ట్యూటర్", nameTa: "ட்யூஷன் / இல்ல ஆசிரியர்", nameKn: "ಟ್ಯೂಷನ್ / ಹೋಮ್ ಟ್ಯೂಟರ್", nameBn: "টিউশন / হোম টিউটর", namePa: "ਟਿਊਸ਼ਨ / ਹੋਮ ਟਿਊਟਰ", icon: "GraduationCap", sortOrder: 31 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat,
    })
  }

  console.log("Seeding cities…")

  const cities = [
    { name: "Hyderabad", nameHi: "हैदराबाद", slug: "hyderabad", stateCode: "TS", stateName: "Telangana" },
    { name: "Bengaluru", nameHi: "बेंगलुरु", slug: "bengaluru", stateCode: "KA", stateName: "Karnataka" },
    { name: "Mumbai", nameHi: "मुंबई", slug: "mumbai", stateCode: "MH", stateName: "Maharashtra" },
    { name: "Delhi", nameHi: "दिल्ली", slug: "delhi", stateCode: "DL", stateName: "Delhi" },
    { name: "Chennai", nameHi: "चेन्नई", slug: "chennai", stateCode: "TN", stateName: "Tamil Nadu" },
    { name: "Pune", nameHi: "पुणे", slug: "pune", stateCode: "MH", stateName: "Maharashtra" },
    { name: "Kolkata", nameHi: "कोलकाता", slug: "kolkata", stateCode: "WB", stateName: "West Bengal" },
    { name: "Ahmedabad", nameHi: "अहमदाबाद", slug: "ahmedabad", stateCode: "GJ", stateName: "Gujarat" },
    { name: "Jaipur", nameHi: "जयपुर", slug: "jaipur", stateCode: "RJ", stateName: "Rajasthan" },
    { name: "Lucknow", nameHi: "लखनऊ", slug: "lucknow", stateCode: "UP", stateName: "Uttar Pradesh" },
    { name: "Chandigarh", nameHi: "चंडीगढ़", slug: "chandigarh", stateCode: "PB", stateName: "Punjab" },
    { name: "Visakhapatnam", nameHi: "विशाखापट्टनम", slug: "visakhapatnam", stateCode: "AP", stateName: "Andhra Pradesh" },
    { name: "Noida", nameHi: "नोएडा", slug: "noida", stateCode: "UP", stateName: "Uttar Pradesh" },
    { name: "Gurugram", nameHi: "गुरुग्राम", slug: "gurugram", stateCode: "HR", stateName: "Haryana" },
    { name: "Ghaziabad", nameHi: "गाज़ियाबाद", slug: "ghaziabad", stateCode: "UP", stateName: "Uttar Pradesh" },
    { name: "Faridabad", nameHi: "फरीदाबाद", slug: "faridabad", stateCode: "HR", stateName: "Haryana" },
    { name: "Greater Noida", nameHi: "ग्रेटर नोएडा", slug: "greater-noida", stateCode: "UP", stateName: "Uttar Pradesh" },
    { name: "Indore", nameHi: "इंदौर", slug: "indore", stateCode: "MP", stateName: "Madhya Pradesh" },
    { name: "Bhopal", nameHi: "भोपाल", slug: "bhopal", stateCode: "MP", stateName: "Madhya Pradesh" },
    { name: "Nagpur", nameHi: "नागपुर", slug: "nagpur", stateCode: "MH", stateName: "Maharashtra" },
    { name: "Surat", nameHi: "सूरत", slug: "surat", stateCode: "GJ", stateName: "Gujarat" },
    { name: "Kochi", nameHi: "कोच्चि", slug: "kochi", stateCode: "KL", stateName: "Kerala" },
    { name: "Coimbatore", nameHi: "कोयंबटूर", slug: "coimbatore", stateCode: "TN", stateName: "Tamil Nadu" },
    { name: "Nashik", nameHi: "नासिक", slug: "nashik", stateCode: "MH", stateName: "Maharashtra" },
    { name: "Patna", nameHi: "पटना", slug: "patna", stateCode: "BR", stateName: "Bihar" },
    { name: "Agra", nameHi: "आगरा", slug: "agra", stateCode: "UP", stateName: "Uttar Pradesh" },
    { name: "Varanasi", nameHi: "वाराणसी", slug: "varanasi", stateCode: "UP", stateName: "Uttar Pradesh" },
  ]

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      create: city,
      update: city,
    })
  }

  console.log("Seeding plans…")

  const plans = [
    // ── Free launch offer ────────────────────────────────────────
    // Every employer is auto-enrolled in this (see ensureFreeSubscription), so
    // subscription-scoped records — candidate unlocks, job boosts — always have
    // a real subscription to hang off, and metering works through one code path.
    //
    // The plans page advertises this as unlimited, so the limits here are what
    // actually honour that. When paid plans launch, lower these values and
    // update the plans page in the same change.
    {
      slug: FREE_PLAN_SLUG, name: "Free Plan", type: "MULTI_HIRE" as const,
      durationDays: FREE_PLAN_DURATION_DAYS, priceRupees: 0,
      activeJobLimit: UNLIMITED, candidateUnlockCredits: UNLIMITED, boostCredits: UNLIMITED,
      isTrial: false, isPopular: false, isActive: true, sortOrder: 0,
    },
    // ── Single Hire ──────────────────────────────────────────────
    {
      slug: "trial", name: "3-Day Trial", type: "SINGLE_HIRE" as const,
      durationDays: 3, priceRupees: 1,
      activeJobLimit: 1, candidateUnlockCredits: 5, boostCredits: 0,
      isTrial: true, isPopular: false, sortOrder: 1,
    },
    {
      slug: "single-1m", name: "Single Hire · 1 Month", type: "SINGLE_HIRE" as const,
      durationDays: 30, priceRupees: 999,
      activeJobLimit: 1, candidateUnlockCredits: 50, boostCredits: 2,
      isTrial: false, isPopular: false, sortOrder: 2,
    },
    {
      slug: "single-3m", name: "Single Hire · 3 Months", type: "SINGLE_HIRE" as const,
      durationDays: 90, priceRupees: 2499,
      activeJobLimit: 1, candidateUnlockCredits: 150, boostCredits: 6,
      isTrial: false, isPopular: false, sortOrder: 3,
    },
    {
      slug: "single-1y", name: "Single Hire · 1 Year", type: "SINGLE_HIRE" as const,
      durationDays: 365, priceRupees: 7999,
      activeJobLimit: 1, candidateUnlockCredits: 500, boostCredits: 24,
      isTrial: false, isPopular: true, sortOrder: 4,
    },
    // ── Multi Hire ───────────────────────────────────────────────
    {
      slug: "multi-1m", name: "Multi Hire · 1 Month", type: "MULTI_HIRE" as const,
      durationDays: 30, priceRupees: 1999,
      activeJobLimit: 3, candidateUnlockCredits: 150, boostCredits: 5,
      isTrial: false, isPopular: true, sortOrder: 5,
    },
    {
      slug: "multi-3m", name: "Multi Hire · 3 Months", type: "MULTI_HIRE" as const,
      durationDays: 90, priceRupees: 4999,
      activeJobLimit: 3, candidateUnlockCredits: 400, boostCredits: 15,
      isTrial: false, isPopular: false, sortOrder: 6,
    },
    {
      slug: "multi-1y", name: "Multi Hire · 1 Year", type: "MULTI_HIRE" as const,
      durationDays: 365, priceRupees: 14999,
      activeJobLimit: 3, candidateUnlockCredits: 1200, boostCredits: 48,
      isTrial: false, isPopular: false, sortOrder: 7,
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan,
    })
  }

  console.log("Done! Categories, cities, and plans seeded.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
