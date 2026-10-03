/* ============================================================
   EDIT CONTENT HERE. No layout code lives in this file.
   Both pages read from window.SITE, so this is the only
   file you need to touch to change the content.
   ============================================================ */
window.SITE = {
  portfolioUrl: "portfolio.html",

  // Real accounts. Used for the project fallback links, the contact card and
  // the footer, so there is one place to update if any handle changes.
  githubUrl: "https://github.com/manaskumarmishra-MKM",

  voiceScript:
    "Hey, I'm Manas Kumar Mishra. I'm a Computer Science Engineering student, developer, and builder who loves turning ideas into real-world technology. Welcome to my world.",

  // Stage index -> camera look + HUD readouts
  stages: [
    { n: 1, label: "THE VOID",        scale: "scale(0.96)", filter: "brightness(35%) contrast(140%) grayscale(60%)", focal: "0.12", ocular: "14.2", status: "INITIALIZING", fov: "92.0", iso: "1/120s @ ISO 400" },
    { n: 2, label: "AMBIENT GLOW",    scale: "scale(1.0)",  filter: "brightness(75%) contrast(120%)", focal: "0.48", ocular: "52.8", status: "ACQUIRING", fov: "85.0", iso: "1/60s @ ISO 640" },
    { n: 3, label: "MANAS SEATED",    scale: "scale(1.04)", filter: "brightness(95%) contrast(110%)", focal: "0.85", ocular: "88.6", status: "POSITIONING", fov: "78.4", iso: "1/48s @ ISO 800" },
    { n: 4, label: "CAMERA DOLLY-IN", scale: "scale(1.14) translateY(-1%)", filter: "brightness(102%) contrast(115%)", focal: "0.94", ocular: "95.1", status: "DOLLYING", fov: "64.0", iso: "1/48s @ ISO 800" },
    { n: 5, label: "EYE CONTACT",     scale: "scale(1.22) translateY(-2%)", filter: "brightness(106%) contrast(118%)", focal: "0.98", ocular: "99.4", status: "STABLE", fov: "52.0", iso: "1/48s @ ISO 800" },
    { n: 6, label: "VOICE INTRO",     scale: "scale(1.16)", filter: "brightness(102%) contrast(112%) drop-shadow(0 0 30px rgba(138,43,226,.35))", focal: "0.99", ocular: "99.8", status: "TRANSMITTING: VOICE", fov: "58.0", iso: "1/48s @ ISO 800" }
  ],

  teleports: [
    { key: "projects", label: "PROJECTS UNIVERSE", icon: "grid_view", href: "portfolio.html#projects", cta: "[ OPEN ALL PROJECTS ]" },
    { key: "skills",   label: "SKILLS MATRIX",     icon: "terminal",  href: "portfolio.html#skills",   cta: "[ VIEW FULL SKILLS ]" },
    { key: "journey",  label: "B.TECH CSE JOURNEY", icon: "timeline", href: "portfolio.html#journey",  cta: "[ EXPLORE JOURNEY ]" },
    { key: "resume",   label: "VIEW RESUME",       icon: "description", href: "portfolio.html#resume", cta: "[ GO TO RESUME ]" },
    { key: "github",   label: "GITHUB",            icon: "code", external: true }
  ],

  // TODO: replace with your real project details and links as you send them
  projects: [
    { name: "RailCast",    status: "LIVE",        cat: "web",     desc: "Railway operations admin panel with dispatcher, signal, platform, broadcast and audit sections.", tags: ["HTML", "Tailwind"], link: "",
      problem: "Railway control work is split across many tasks: dispatching, signals, platforms, announcements and audit trails.", solution: "One admin panel with a section for each task, so an operator can move between them without leaving the screen." },
    { name: "StudySaathi", status: "ACTIVE",      cat: "web ai",  desc: "AI-powered exam prep platform for Indian competitive-exam and B.Tech students.", tags: ["Python", "Flask", "Gemini API"], link: "",
      problem: "Exam preparation material is scattered, and generic answers rarely fit an Indian syllabus.", solution: "A Flask web platform that uses the Gemini API to power exam-focused study help." },
    { name: "Mussu",       status: "IN PROGRESS", cat: "android ai", desc: "Personal AI assistant app: web, then PWA, then native Android, powered by Gemini.", tags: ["Kotlin", "Jetpack Compose", "Gemini API"], link: "",
      problem: "A personal assistant is most useful when it lives on the device you carry.", solution: "Built in stages: a web app first, then an installable PWA, then a native Android app in Kotlin and Jetpack Compose." },
    { name: "Unsaid",      status: "PROTOTYPE",   cat: "game",    desc: "Campus story game with joystick movement, journal, phone and inventory panels.", tags: ["Game UI", "JavaScript"], link: "",
      problem: "A story game needs interface panels that feel part of the world rather than menus.", solution: "A campus setting with joystick movement plus journal, phone and inventory panels, written in JavaScript." }
  ],

  // TODO: edit the text below. It feeds portfolio.html
  hero: {
    roles: ["Developer", "Builder", "Problem Solver"],
    lead: "B.Tech CSE student who builds full-stack web, Android and embedded systems, and AI-powered products. Recently interned at CRIS, the Centre for Railway Information Systems.",
    stats: [["4", "Products built"], ["CRIS", "Internship, New Delhi"], ["3", "Web, Android, IoT"]]
  },
  about: {
    intro: "I like knowing what happens under the framework, and shipping something people can actually use.",
    body: "My work spans web apps, Android apps and Arduino/IoT builds, and lately products powered by the Gemini API.",
    pillars: [
      { tag: "Craft", title: "Build, then improve", text: "Ship a working version early, then tighten the design, the code and the details." },
      { tag: "Academics", title: "Fundamentals first", text: "Programming, data structures and databases as the base for everything else." },
      { tag: "Exploring", title: "AI products and embedded systems", text: "Gemini-powered apps, Android with Jetpack Compose, and Arduino/IoT hardware." }
    ]
  },
  achievements: [
    { tag: "Internship", title: "CRIS, New Delhi", text: "Interned at the Centre for Railway Information Systems, under the Ministry of Railways." },
    { tag: "Shipped", title: "Four products", text: "RailCast, StudySaathi, Mussu and Unsaid, from web panels to an Android assistant." },
    { tag: "Range", title: "Web, Android and hardware", text: "Comfortable moving between Flask and React, Kotlin and Compose, and Arduino/IoT." }
  ],
  // Rendered into the contact card and footer by portfolio.js.
  contact: {
    email: "manaskumarmishraofficial@gmail.com",
    location: "India",
    linkedin: "https://www.linkedin.com/in/manas-kumar-mishra-m-k-m/",
  },

  // TODO: percentages are placeholders, not measured scores
  skills: [
    { group: "LANGUAGES", items: [["Python", 90], ["Kotlin", 75], ["JavaScript", 85], ["SQL / SQLite", 80]] },
    { group: "WEB & MOBILE", items: [["React", 85], ["Flask / REST APIs", 85], ["Jetpack Compose", 75], ["Tailwind CSS", 90]] },
    { group: "AI & EMBEDDED", items: [["Gemini API", 85], ["Arduino", 75], ["IoT", 70], ["Git / GitHub", 85]] }
  ],

  journey: [
    { phase: "PHASE 01", title: "Foundations", text: "Core programming, data structures and first projects." },
    { phase: "PHASE 02", title: "Full-stack, Android and embedded builds", text: "Web apps, Android apps and Arduino/IoT systems." },
    { phase: "PHASE 03 // ACTIVE", title: "Internship at CRIS and AI products", text: "Interned at the Centre for Railway Information Systems, New Delhi. Now building Gemini-powered apps.", active: true }
  ],

  resume: {
    title: "Manas Kumar Mishra: Developer Resume",
    sub: "B.Tech Computer Science and Engineering",
    objective: "Computer Science and Engineering student who builds full-stack web, Android and embedded systems, and AI-powered products.",
    stack: ["Languages: Python, Kotlin, JavaScript, SQL", "Frontend: React, Tailwind CSS, Jetpack Compose", "Backend: Flask, REST APIs, SQLite", "Other: Gemini API, Arduino, IoT"],
    highlights: ["Internship at CRIS (Ministry of Railways), New Delhi", "Built RailCast, StudySaathi, Mussu and Unsaid"],
    copyText: "Manas Kumar Mishra, B.Tech CSE builder and developer. Stack: Python, Kotlin, React, Flask, SQLite, Gemini API, Arduino."
  }
};
