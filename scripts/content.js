"use strict";

/**
 * Manual profile text is inlined in this module (from a sanitized extract).
 * Do not read any external content file at runtime. Do not add employer or
 * internal product names here.
 */
module.exports = {
  username: "neuraljatin",
  promptUser: "jatin",
  displayName: "Jatin",
  taglineLead: "Hi, I'm Jatin.",
  taglineRest: "Business Systems Analyst who ships: requirements → data → product",
  roles: ["Business Systems Analyst", "Data Analyst", "BI Developer"],
  experience: "4+ years",
  portfolioUrl: "https://portfolio-sage-mu-53.vercel.app",
  githubUrl: "https://github.com/neuraljatin",
  linkedin: { url: "https://www.linkedin.com/in/jatin-bharmota", label: "linkedin.com/in/jatin-bharmota" },
  infoRows: [
    { key: "user", value: "neuraljatin @ github" },
    { key: "Role", value: "Business Systems Analyst · Data Analyst · BI Developer" },
    { key: "Focus", value: "Data storytelling, process design, end-to-end delivery" },
    { key: "Stack", value: "Python · SQL · TypeScript · Power BI · Tableau" },
    { key: "Builds", value: "Next.js · React · AWS · Vercel" },
    { key: "Edu", value: "MCA, AI & ML (2024–2026) · BCA (2020–2023)" },
    { key: "XP", value: "4+ years" },
    { key: "Site", value: "portfolio-sage-mu-53.vercel.app" },
    { key: "LinkedIn", value: "https://www.linkedin.com/in/jatin-bharmota" }
  ],
  // Steps and labels follow the approved preview; every term is from the sanitized extract.
  process: [
    { step: "01 Discover", detail: ["Stakeholders", "KPI trees · BRDs"] },
    { step: "02 Model", detail: ["Data modelling", "ETL · MS Visio"] },
    { step: "03 Analyse", detail: ["SQL · Excel", "Power BI · EDA"] },
    { step: "04 Build", detail: ["Next.js · TypeScript", "REST APIs"] },
    { step: "05 Ship & measure", detail: ["CI/CD · UAT", "KPI reporting"] }
  ],
  skillGroups: [
    { title: "ANALYSIS", items: ["BRD / FRD", "UAT", "Jira", "Agile / Scrum"] },
    { title: "DATA", items: ["SQL", "Python", "Pandas", "EDA"] },
    { title: "BI", items: ["Power BI", "Tableau", "Excel", "KPI reporting"] },
    { title: "LANGUAGES", items: ["Python", "SQL", "TypeScript", "JavaScript"] },
    { title: "CLOUD", items: ["AWS", "Vercel", "Next.js", "Git"] },
    { title: "MODELLING", items: ["Data modelling", "Statistics", "scikit-learn", "REST APIs"] }
  ],
  certifications: [
    { title: "Data Analytics", issuer: "Coding Ninjas", when: "Mar 2026" },
    { title: "Excel 2016: Core Data Analysis", issuer: "Coding Ninjas × Analytics Club, IIM Calcutta", when: "Nov 2024" },
    { title: "Introduction to Large Language Models", issuer: "Google Cloud", when: "Jul 2024" },
    { title: "Introduction to Generative AI", issuer: "Google Cloud", when: "Jul 2024" },
    { title: "AWS Compute Services Overview", issuer: "AWS Training and Certification", when: "Jul 2024" },
    { title: "Amazon Bedrock Getting Started", issuer: "AWS Training and Certification", when: "Jul 2024" },
    { title: "Cryptocurrency Trading", issuer: "Online", when: "2024" }
  ],
  // Public, live projects only. No private repo links.
  featured: [
    { name: "money-tracker", detail: "Spending & savings tracker web app", url: "https://money-tracker-mauve-kappa.vercel.app", host: "money-tracker-mauve-kappa.vercel.app" },
    { name: "FITNESSGYM", detail: "Gym website & member management", url: "https://fitnessgym-gamma.vercel.app", host: "fitnessgym-gamma.vercel.app" },
    { name: "portfolio", detail: "Animated portfolio + GitHub CMS", url: "https://portfolio-sage-mu-53.vercel.app", host: "portfolio-sage-mu-53.vercel.app" }
  ],
  // Generic, true items only (from the approved preview). Never invent numbers.
  achievements: [
    { icon: "ship", title: "Shipped to production", detail: "Live apps on Vercel" },
    { icon: "gear", title: "CI/CD automated", detail: "GitHub Actions build & deploy" },
    { icon: "chart", title: "Data → decisions", detail: "Dashboards & KPI reporting" },
    { icon: "gym", title: "FITNESSGYM", detail: "Gym website & member management" },
    { icon: "cap", title: "4+ years", detail: "Analysis, data & BI delivery" },
    { icon: "badge", title: "GitHub milestones", detail: "live" }
  ],
  education: [
    { title: "MCA — AI & Machine Learning", place: "Manav Rachna International Institute of Research and Studies", when: "Jul 2024–Jul 2026", detail: "CGPA 8.2 / 10" },
    { title: "BCA", place: "Integrated Institute of Technology, Dwarka (GGSIPU)", when: "Aug 2020–Jun 2023", detail: "CGPA 8.5 / 10" }
  ]
};
