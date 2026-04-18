// Journey data — single source of truth for the UI kit
const AVATAR_SRC = "../../assets/avatar-shivam.svg";

const JOURNEY_STOPS = [
  {
    id: "stop-trajector",
    chapter: "Chapter 03",
    period: "Apr 2025 — Present",
    title: "Trajector",
    titleAccent: ", now.",
    role: "Software Engineer II · Gurgaon, Haryana",
    dot: "now",
    narrative: [
      "Deep in AI territory. I spend my days building agents that think, act, and ship work.",
      "When I'm not shipping agents, I'm moving data at scale — syncing millions of files from EFS to S3, or automating pull-request reviews so reviewers can focus on architecture instead of typos."
    ],
    did: [
      { h: "Built Python AI agents with NOVA Act", d: "Task extraction + automated file-upload workflows, cross-platform for Windows & macOS. Reduced manual processing by an order of magnitude." },
      { h: "Designed an internal booking platform", d: "Event-driven architecture scheduling calls across multiple departments and services." },
      { h: "Shipped AI agents inside GitHub Workflows", d: "Automated PR reviews — catching regressions before a human ever opens the diff." },
      { h: "Engineered 2.5M doc sync EFS → S3", d: "High-performance cron jobs optimizing storage management and data availability at scale." },
      { h: "Desktop automation with PyAutoGUI + OpenCV", d: "Visual element detection and hands-free task execution on a video streaming platform." }
    ],
    stack: ["Python", "NOVA Act", "AWS S3", "EFS", "EventBridge", "PyAutoGUI", "OpenCV", "GitHub Actions"]
  },
  {
    id: "stop-acefone",
    chapter: "Chapter 02",
    period: "Feb 2022 — Apr 2025",
    title: "Acefone",
    titleAccent: ", three years.",
    role: "Software Developer I/II · Gurgaon, Haryana",
    dot: "past",
    narrative: [
      "Three years inside a communications platform. Payments, SSO, messaging, billing — the unsexy plumbing that keeps businesses running.",
      "I learned what it means to ship quietly and keep things boring on purpose. Reliability is a feature."
    ],
    did: [
      { h: "Integrated Stripe & Revolut", d: "Improved payment reliability, processing efficiency, and system scalability across the portal." },
      { h: "Twilio MMS + SMS", d: "Implemented messaging functionality end-to-end." },
      { h: "Azure SSO on the Acefone Portal", d: "Smooth login experience; single sign-on that just works." },
      { h: "Laravel upgrade → ~50% perf gain", d: "Measured end-to-end, not benchmark-massaged." },
      { h: "NestJS SSO architecture", d: "Re-platformed internal single sign-on on NestJS from the ground up." },
      { h: "75% billing efficiency via Xero automation", d: "Invoice automation that gave the billing team their afternoons back." },
      { h: "WhatsApp call-log microservice", d: "NestJS + MongoDB for scalable logging and communication analytics." }
    ],
    stack: ["PHP", "Laravel", "NestJS", "Node.js", "MongoDB", "MySQL", "Stripe", "Revolut", "Twilio", "Xero", "Azure"]
  },
  {
    id: "stop-jiit",
    chapter: "Chapter 01",
    period: "Jul 2018 — May 2022",
    title: "JIIT Noida",
    titleAccent: ", the start.",
    role: "B.Tech · Computer Science & Engineering · GPA 7.3",
    dot: "past",
    narrative: [
      "Four years of fundamentals. Algorithms at 2am, competitive programming weekends, building the mental library that still backs every system I design.",
      "I learned that the interesting problems live at the intersection of math and messy real-world constraints. That's still where I want to be."
    ],
    did: [
      { h: "Data structures & algorithms", d: "Built out the mental library that still backs every system I design." },
      { h: "Independent backend side-projects", d: "Bootstrap the muscles for production work — deploys, databases, APIs." },
      { h: "Class XII — Aster Public School · 95%", d: "Strong academics before engineering — science stream." },
      { h: "Class X — Aster Public School · 10 CGPA", d: "Perfect CGPA. The early signal that detail and consistency matter." }
    ],
    stack: ["C++", "Java", "Algorithms", "Math", "MySQL"]
  }
];

const TECH_STACK = [
  { e: "🟨", n: "JavaScript", group: "lang" },
  { e: "🐘", n: "PHP / Laravel", group: "lang" },
  { e: "🐍", n: "Python", group: "lang" },
  { e: "🟦", n: "TypeScript", group: "lang" },
  { e: "🟢", n: "Node.js", group: "framework" },
  { e: "🐦", n: "NestJS", group: "framework" },
  { e: "🍃", n: "MongoDB", group: "db" },
  { e: "🐬", n: "MySQL", group: "db" },
  { e: "☁️", n: "AWS Suite", group: "cloud" },
  { e: "🐳", n: "Docker", group: "cloud" },
  { e: "📨", n: "Kafka", group: "cloud" },
  { e: "🤖", n: "AI Agents", group: "ai" },
  { e: "💳", n: "Stripe / Revolut", group: "integration" },
  { e: "📱", n: "Twilio", group: "integration" },
  { e: "📊", n: "SonarQube", group: "ops" },
  { e: "🔍", n: "SumoLogic", group: "ops" }
];

const CONTACTS = [
  { ic: "✉️", text: "shivam12061999@gmail.com", lbl: "// email", href: "mailto:shivam12061999@gmail.com" },
  { ic: "📞", text: "+91 8373972304", lbl: "// phone", href: "tel:8373972304" },
  { ic: "💼", text: "linkedin.com/in/shivam-sharma", lbl: "// linkedin", href: "#" },
  { ic: "🧩", text: "leetcode.com/shyyvam", lbl: "// leetcode", href: "#" }
];

window.JOURNEY_STOPS = JOURNEY_STOPS;
window.TECH_STACK = TECH_STACK;
window.CONTACTS = CONTACTS;
window.AVATAR_SRC = AVATAR_SRC;
