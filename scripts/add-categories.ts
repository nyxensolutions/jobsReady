import { config } from "dotenv"
config({ path: ".env.local" })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const NEW_CATEGORIES = [
  {
    slug: "office-admin",
    nameEn: "Office & Admin Staff",
    nameHi: "ऑफिस स्टाफ / एडमिन",
    nameTe: "ఆఫీస్ స్టాఫ్ / అడ్మిన్",
    nameTa: "அலுவலக ஊழியர்கள்",
    nameKn: "ಆಫೀಸ್ ಸಿಬ್ಬಂದಿ",
    nameBn: "অফিস স্টাফ / অ্যাডমিন",
    namePa: "ਆਫਿਸ ਸਟਾਫ / ਐਡਮਿਨ",
    icon: "ClipboardList",
    sortOrder: 39,
  },
  {
    slug: "social-media",
    nameEn: "Social Media / Content Creator",
    nameHi: "सोशल मीडिया / कंटेंट क्रिएटर",
    nameTe: "సోషల్ మీడియా / కంటెంట్ క్రియేటర్",
    nameTa: "சமூக ஊடகம் / உள்ளடக்க படைப்பாளர்",
    nameKn: "ಸೋಶಲ್ ಮೀಡಿಯಾ / ಕಂಟೆಂಟ್ ಕ್ರಿಯೇಟರ್",
    nameBn: "সোশ্যাল মিডিয়া / কন্টেন্ট ক্রিয়েটর",
    namePa: "ਸੋਸ਼ਲ ਮੀਡੀਆ / ਕੰਟੈਂਟ ਕ੍ਰਿਏਟਰ",
    icon: "Share2",
    sortOrder: 40,
  },
  {
    slug: "graphic-design",
    nameEn: "Graphic Designer / Video Editor",
    nameHi: "ग्राफिक डिज़ाइनर / वीडियो एडिटर",
    nameTe: "గ్రాఫిక్ డిజైనర్ / వీడియో ఎడిటర్",
    nameTa: "கிராஃபிக் வடிவமைப்பாளர் / வீடியோ எடிட்டர்",
    nameKn: "ಗ್ರಾಫಿಕ್ ಡಿಸೈನರ್ / ವಿಡಿಯೋ ಎಡಿಟರ್",
    nameBn: "গ্রাফিক ডিজাইনার / ভিডিও এডিটর",
    namePa: "ਗ੍ਰਾਫਿਕ ਡਿਜ਼ਾਈਨਰ / ਵੀਡੀਓ ਐਡੀਟਰ",
    icon: "Palette",
    sortOrder: 41,
  },
]

async function main() {
  for (const cat of NEW_CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })
    if (existing) {
      console.log(`⏭  Skipping "${cat.nameEn}" — already exists`)
      continue
    }
    await prisma.category.create({ data: { ...cat, isActive: true } })
    console.log(`✅ Added: ${cat.nameEn}`)
  }
  console.log("Done.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
