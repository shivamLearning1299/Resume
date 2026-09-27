/* ============================================================
   TIMELINE DATA — all content lives here + admin overrides.
   The admin dashboard (admin.html) edits this via localStorage.
   Never invent numbers — fix real values via the dashboard.
   ============================================================ */
window.SITE = {
  name: "Shivam Sharma",
  role: "AI & Backend Engineer",
  tagline: "If I can imagine it, I can build it.",
  subline: "Backend systems and AI agents that survive production traffic — Python · FastAPI · LangChain/LangGraph · AWS.",
  location: "Noida, NCR, India",
  experience: "4.5+ years",
  email: "shivam@gmail.com",          /* ← fix real address in admin dashboard */
  github: "https://github.com/",      /* ← fix in dashboard */
  linkedin: "https://www.linkedin.com/in/shivamsharma3ab",
  resumeUrl: "ShivamSharma_Python_AgenticAI_4.5+_YOE.pdf",
};

window.TIMELINE = [
  {
    id: "now", type: "hero", year: "2026", date: "NOW",
    title: "Shivam Sharma",
    body: "AI & Backend Engineer — event-driven microservices, LLM agents, and RAG pipelines in Python/Node.js. 4.5 years, prototype → production.",
    tech: ["Python", "FastAPI", "Node.js", "LangChain", "LangGraph", "AWS"],
  },
  {
    id: "skills", type: "skills", year: "2026", date: "NOW", title: "Current Skills",
    clusters: [
      { name: "Backend", items: ["Python", "Node.js", "TypeScript", "FastAPI", "NestJS", "REST APIs"] },
      { name: "AI / Agentic", items: ["LLM Agents", "RAG", "LangChain", "LangGraph", "Vector Search", "Semantic Caching", "Prompt Engineering", "Amazon Nova Act", "Claude MCP / Hooks"] },
      { name: "Cloud / Infra", items: ["AWS S3", "EC2", "EventBridge", "CloudWatch", "Secrets Manager", "Docker", "Kafka", "WebSockets", "GitHub Actions"] },
      { name: "Data", items: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "ChromaDB", "Supabase"] },
    ],
  },
  {
    id: "trajector", type: "experience", year: "2023", date: "APR 2023 — NOW",
    title: "Software Engineer II", company: "Trajector · Gurgaon",
    body: "Backend performance, an event-driven booking platform, and production AI tooling.",
    points: [
      "Fixed N+1 queries, rewrote joins, resolved critical production bugs — measurably faster API responses.",
      "Architected an event-driven booking system on AWS EventBridge + Kafka; Docker-orchestrated microservices for real-time call scheduling.",
      "Parallelised cron pipelines syncing medical documents (EFS → S3) on EC2, thousands of client files/day — turnaround cut from days to same-day.",
      "Browser-level automation: XHR interception replaces a 6-hour manual review with a 1-hour automated pipeline.",
    ],
    tech: ["Python", "Node.js", "AWS EventBridge", "Kafka", "Docker", "PostgreSQL", "Grafana"],
  },
  {
    id: "proj-nova", type: "project", year: "2024", date: "2024", featured: true,
    title: "NOVA VBMS — Citrix/browser automation",
    body: "Fault-tolerant AI automation of Citrix and browser workflows with state detection, retries, validation, recovery flows, and human-in-the-loop escalation.",
    architecture: ["Trigger", "State Detector (OpenCV + confidence)", "LangGraph Orchestrator (checkpointed)", "Action Layer (PyAutoGUI)", "Validator → Retry / HITL Escalation"],
    tech: ["Amazon Nova Act", "LangGraph", "LangChain", "Python", "OpenCV", "PyAutoGUI"],
  },
  {
    id: "proj-rag", type: "project", year: "2024", date: "2024", featured: true,
    title: "Voice Chatbot with RAG + VAD",
    body: "Grounded natural-language Q&A over internal project and process docs; voice interface with voice-activity detection over a retrieval pipeline.",
    architecture: ["Voice in (VAD)", "Transcribe", "Retrieve (embeddings + vector search)", "Rerank", "Grounded answer (Nova / Bedrock)"],
    tech: ["Amazon Nova", "AWS Bedrock", "FastAPI", "Vector Search", "RAG", "VAD"],
  },
  {
    id: "proj-prreview", type: "project", year: "2025", date: "2025",
    title: "Automated PR Review Agent",
    body: "CI-integrated agent on GitHub Actions + SonarQube streamlines static analysis — handles 50+ PRs / week.",
    tech: ["GitHub Actions", "SonarQube", "LLM Agents", "Node.js"],
  },
  {
    id: "acefone", type: "experience", year: "2021", date: "FEB 2021 — APR 2023",
    title: "Software Developer I → II", company: "Acefone Software · Gurgaon",
    body: "Full-stack product engineering across billing, messaging, and identity.",
    points: [
      "Stripe & Revolut gateway integrations replaced manual reconciliation — automated subscription billing at scale, billing errors to near 0%.",
      "Xero invoice automation eliminated hours of manual finance effort weekly.",
      "Real-time MMS/SMS over WebSockets for 25K+ daily active users; delivery latency cut sharply.",
      "Azure AD SSO rolled out across 5+ internal systems, cutting login-related support tickets.",
    ],
    tech: ["Node.js", "NestJS", "PHP", "Laravel", "MongoDB", "Redis", "Twilio", "Azure AD"],
  },
  {
    id: "proj-paygate", type: "project", year: "2022", date: "2022", featured: true,
    title: "Payment Gateway Integrations — Stripe & Revolut",
    body: "Automated subscription billing replacing manual balance-sheet reconciliation; webhooks, idempotent retries, ledger consistency.",
    architecture: ["Checkout / Subscription", "Stripe + Revolut Webhooks", "Idempotency + Retry Queue", "Ledger Writer", "Reconciliation Report"],
    tech: ["Stripe", "Revolut", "Node.js", "PostgreSQL", "Webhooks"],
  },
  {
    id: "education", type: "education", year: "2017", date: "2017 — 2021",
    title: "B.Tech, Computer Science & Engineering",
    company: "Jaypee Institute of Information Technology (JIIT), Noida",
    body: "Graduated May 2021.",
  },
  {
    id: "achievements", type: "achievement", year: "2017", date: "2017",
    title: "Before engineering school",
    points: [
      "12th grade — 95%.",
      "International Mathematics Olympiad — All India Rank 105.",
    ],
  },
  {
    id: "contact", type: "contact", year: "NEXT", date: "THE FUTURE",
    title: "What should we build?",
    body: "Targeting Senior SDE / AI Engineer roles. If it involves backend systems or agents that have to work in production, I'm interested.",
  },
];

/* Deep-merge admin overrides from localStorage */
(function () {
  try {
    const ov = JSON.parse(localStorage.getItem("tl_overrides") || "null");
    if (ov && ov.site) Object.assign(window.SITE, ov.site);
    if (ov && ov.timeline) window.TIMELINE = ov.timeline;
    const blob = localStorage.getItem("resume_blob");
    if (blob) { window.SITE.resumeUrl = blob; window.SITE._resumeUploaded = true; }
  } catch (e) {}
})();
