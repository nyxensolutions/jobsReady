import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

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
  ]

  for (const city of cities) {
    await prisma.city.upsert({
      where: { slug: city.slug },
      create: city,
      update: city,
    })
  }

  console.log("Done! Categories and cities seeded.")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
