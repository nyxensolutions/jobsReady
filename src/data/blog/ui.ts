// Interface strings for the blog, keyed by the language of the *content* being
// shown — not the URL locale. A /ta/ URL that falls back to English content
// gets English chrome, so a page never mixes two languages.

export type ContentLang = "en" | "hi"

export type BlogUi = {
  home: string
  careerGuide: string
  indexTitle: string
  indexDescription: string
  heroTitle: string
  heroText: string
  latest: string
  readGuide: string
  readTime: (minutes: number) => string
  by: string
  author: string
  related: string
  toc: string
  faqHeading: string
  share: string
  categoryTitle: (label: string) => string
  browseOpenings: (label: string) => string
  noArticles: string
  browseAll: string
  otherTopics: string
  categoriesAria: string
  untranslatedNote: string
  englishBadge: string
  viewAll: string
  opening: string
  openings: string
  perMonth: string
  perDay: string
  salaryFrom: (amount: string) => string
  salaryUpTo: (amount: string) => string
  asPerInterview: string
}

export const BLOG_UI: Record<ContentLang, BlogUi> = {
  en: {
    home: "Home",
    careerGuide: "Career Guide",
    indexTitle: "Career Guide & Job Advice",
    indexDescription:
      "Salary guides, job descriptions, interview tips and job-safety advice for delivery, driver, security, warehouse, telecalling and other frontline jobs across India.",
    heroTitle: "Jobs24India Blog",
    heroText:
      "Honest salary breakdowns, job descriptions and hiring advice for frontline work in India — written for people looking for a job today, not for a career ten years away.",
    latest: "Latest",
    readGuide: "Read guide",
    readTime: (m) => `${m} min read`,
    by: "By",
    author: "Jobs24India Careers Desk",
    related: "Related guides",
    toc: "Table of Contents",
    faqHeading: "Frequently Asked Questions",
    share: "Share",
    categoryTitle: (label) => `${label} — Career Guide`,
    browseOpenings: (label) => `Browse ${label.toLowerCase()} openings`,
    noArticles: "No articles published in this section yet.",
    browseAll: "Browse all career guides",
    otherTopics: "Other career topics",
    categoriesAria: "Blog categories",
    untranslatedNote: "",
    englishBadge: "",
    viewAll: "View all",
    opening: "opening",
    openings: "openings",
    perMonth: "/month",
    perDay: "/day",
    salaryFrom: (a) => `From ${a}`,
    salaryUpTo: (a) => `Up to ${a}`,
    asPerInterview: "As per interview",
  },
  hi: {
    home: "होम",
    careerGuide: "करियर गाइड",
    indexTitle: "करियर गाइड और जॉब सलाह",
    indexDescription:
      "डिलीवरी, ड्राइवर, सिक्योरिटी गार्ड, वेयरहाउस, टेलीकॉलिंग और दूसरी नौकरियों के लिए सैलरी गाइड, जॉब की पूरी जानकारी, इंटरव्यू टिप्स और फर्जी जॉब से बचने की सलाह — हिंदी में।",
    heroTitle: "Jobs24India ब्लॉग",
    heroText:
      "सैलरी की सही जानकारी, जॉब की पूरी डिटेल और भर्ती से जुड़ी सलाह — उन लोगों के लिए जो आज नौकरी ढूंढ रहे हैं।",
    latest: "नया लेख",
    readGuide: "गाइड पढ़ें",
    readTime: (m) => `${m} मिनट में पढ़ें`,
    by: "लेखक:",
    author: "Jobs24India करियर डेस्क",
    related: "ये गाइड भी पढ़ें",
    toc: "विषय सूची",
    faqHeading: "अक्सर पूछे जाने वाले सवाल",
    share: "शेयर करें",
    categoryTitle: (label) => `${label} — करियर गाइड`,
    browseOpenings: (label) => `${label} की नौकरियां देखें`,
    noArticles: "इस सेक्शन में अभी कोई लेख नहीं है।",
    browseAll: "सभी करियर गाइड देखें",
    otherTopics: "और विषय",
    categoriesAria: "ब्लॉग श्रेणियां",
    untranslatedNote:
      "कुछ लेख अभी सिर्फ़ अंग्रेज़ी में हैं। हिंदी में उपलब्ध लेख सबसे ऊपर दिखाए गए हैं।",
    englishBadge: "English",
    viewAll: "सभी देखें",
    opening: "पद",
    openings: "पद",
    perMonth: "/माह",
    perDay: "/दिन",
    salaryFrom: (a) => `${a} से शुरू`,
    salaryUpTo: (a) => `${a} तक`,
    asPerInterview: "इंटरव्यू में तय होगा",
  },
}

export function blogUi(lang: ContentLang): BlogUi {
  return BLOG_UI[lang]
}
