/* ============ TIMELINE ENGINE ============ */
(function () {
  const S = window.SITE, TL = window.TIMELINE;
  const stage = document.getElementById("stage");
  const rail = document.getElementById("rail");
  const yearEl = document.getElementById("yearNow");
  const stageName = document.getElementById("stageName");
  const stageDate = document.getElementById("stageDate");
  const fill = document.getElementById("progressFill");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let idx = 0, animating = false;

  document.getElementById("resumeLink").href = S.resumeUrl;
  document.getElementById("journeyBtn").onclick = () => go(2);
  document.getElementById("contactBtn").onclick = () => go(TL.length - 1);

  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pills = (arr) => (arr || []).map(t => `<span class="tech-pill">${esc(t)}</span>`).join("");
  const coords = (e, i) => `<span class="coords">COORD <b>${String(i + 1).padStart(2, "0")}/${String(TL.length).padStart(2, "0")}</b> · ${esc(e.date)} · ${esc(e.type).toUpperCase()}</span>`;

  function sceneHTML(e, i) {
    switch (e.type) {
      case "hero": return `<div class="scene-inner">
        ${coords(e, i)}
        <div class="pane">
          <div class="kicker">${esc(S.role)} · ${esc(S.location)}</div>
          <h1 class="hero-name">${esc(S.name)}</h1>
          <p class="hero-tag">${esc(S.tagline)}</p>
        </div>
        <div class="pane">
          <p class="hero-sub" style="margin-top:0">${esc(S.subline)}</p>
          <div class="tech-row" style="margin-bottom:0">${pills(e.tech)}</div>
        </div>
        <div class="pane hero-ctas" >
          <button class="cta" data-go="${i + 1}">View Full Journey →</button>
          <button class="cta ghost" data-go="${TL.length - 1}">Contact Me</button>
          <a class="cta ghost" href="${esc(S.github)}" target="_blank" rel="noopener">GitHub</a>
          <a class="cta ghost" href="${esc(S.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
        </div></div>`;
      case "skills": return `<div class="scene-inner">
        ${coords(e, i)}
        <div class="pane"><div class="kicker" style="margin-bottom:8px">${esc(e.date)}</div>
        <h2 class="scene-title">${esc(e.title)}</h2></div>
        <div class="skill-grid">${(e.clusters || []).map(c => `<div class="pane skill-cluster"><h3>${esc(c.name)}</h3><div class="items">${pills(c.items)}</div></div>`).join("")}</div></div>`;
      case "experience": return `<div class="scene-inner">
        ${coords(e, i)}<div class="split">
        <div class="pane"><div class="kicker">${esc(e.date)}</div><h2 class="scene-title">${esc(e.title)}</h2>
        <div class="scene-company">${esc(e.company)}</div><p class="scene-body">${esc(e.body)}</p>
        <div class="tech-row">${pills(e.tech)}</div></div>
        <div class="pane"><ul class="point-list">${(e.points || []).map(p => `<li>${esc(p)}</li>`).join("")}</ul></div>
        </div></div>`;
      case "project": return `<div class="scene-inner proj ${e.featured ? "featured" : ""}">
        ${coords(e, i)}
        <div class="pane"><div class="proj-head"><div class="kicker">Event · ${esc(e.date)}</div></div>
        <h2 class="scene-title">${esc(e.title)}</h2></div>
        <div class="pane"><p class="proj-body" style="margin-top:0">${esc(e.body)}</p>
        ${e.architecture ? `<div class="arch"><div class="arch-label">Architecture</div><div class="arch-flow">${
          e.architecture.map((n, j) => `<span class="arch-node">${esc(n)}</span>${j < e.architecture.length - 1 ? '<span class="arch-link"></span>' : ""}`).join("")}</div></div>` : ""}</div>
        <div class="pane"><div class="tech-row" style="margin-top:0">${pills(e.tech)}</div></div></div>`;
      case "education":
      case "achievement": return `<div class="scene-inner minimal">
        ${coords(e, i)}<div class="pane"><div class="kicker">${esc(e.date)}</div>
        <h2 class="scene-title">${esc(e.title)}</h2>
        ${e.company ? `<div class="scene-company">${esc(e.company)}</div>` : ""}
        ${e.body ? `<p class="scene-body" style="font-size:17px">${esc(e.body)}</p>` : ""}
        ${e.points ? `<ul class="point-list" style="margin-top:24px">${e.points.map(p => `<li>${esc(p)}</li>`).join("")}</ul>` : ""}</div></div>`;
      case "contact": return `<div class="scene-inner">
        ${coords(e, i)}<div class="contact-grid">
        <div class="pane"><div class="kicker">${esc(e.date)}</div><h2 class="scene-title">${esc(e.title)}</h2>
        <p class="scene-body" style="font-size:17px">${esc(e.body)}</p>
        <div class="contact-links">
          <a class="chip" href="mailto:${esc(S.email)}">${esc(S.email)}</a>
          <a class="chip" href="${esc(S.github)}" target="_blank" rel="noopener">GitHub</a>
          <a class="chip" href="${esc(S.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>
          <a class="chip chip-primary" href="${esc(S.resumeUrl)}" download>Resume PDF</a>
        </div></div>
        <form class="pane contact-form" id="contactForm" novalidate>
          <label>Email *</label><input type="email" id="cfEmail" required placeholder="you@company.com" />
          <label>Name</label><input type="text" id="cfName" placeholder="Optional" />
          <label>Message</label><textarea id="cfMsg" rows="3" placeholder="Optional"></textarea>
          <div style="margin-top:22px"><button class="cta" type="submit" id="cfSend">Send Message</button></div>
          <div class="form-status" id="cfStatus"></div>
        </form></div></div>`;
      default: return `<div class="scene-inner">${coords(e, i)}<h2 class="scene-title">${esc(e.title)}</h2><p class="scene-body">${esc(e.body || "")}</p></div>`;
    }
  }

  // build scenes + rail
  TL.forEach((e, i) => {
    const sec = document.createElement("section");
    sec.className = "scene"; sec.dataset.i = i; sec.innerHTML = sceneHTML(e, i);
    stage.appendChild(sec);
  });
  const track = document.createElement("div"); track.className = "rail-track";
  // display order: linear by time — oldest → newest, with NEXT (contact) pinned at the end
  const railOrder = TL.map((e, i) => ({ e, i }))
    .sort((a, b) => {
      const ay = parseInt(a.e.year, 10), by = parseInt(b.e.year, 10);
      const an = isNaN(ay), bn = isNaN(by);       // "NEXT" counts as future
      if (an && bn) return a.i - b.i;
      if (an) return 1;
      if (bn) return -1;
      return ay - by || a.i - b.i;
    });
  railOrder.forEach(({ e, i }, j) => {
    if (j) { const s = document.createElement("span"); s.className = "rail-seg"; track.appendChild(s); }
    const b = document.createElement("button");
    b.className = "rail-node"; b.setAttribute("aria-label", e.title);
    const railLabel = j === 0 ? "Start" : e.year;   // leftmost node = timeline origin
    b.innerHTML = `<span class="rail-year">${esc(railLabel)}</span><span class="rail-dot"></span>
      <span class="rail-tip"><b>${esc(e.title)}</b><span>${esc(e.date)}</span><p>${esc((e.body || e.company || "").slice(0, 90))}</p></span>`;
    b.onclick = () => go(i);
    track.appendChild(b);
    b.dataset.i = i;
  });
  rail.appendChild(track);

  const scenes = [...stage.children];
  // nodes[contentIndex] → button, via the dataset flag we set when building
  const nodes = Array(TL.length).fill(null);
  rail.querySelectorAll(".rail-node").forEach((btn) => { nodes[+btn.dataset.i] = btn; });

  function render(dir) {
    scenes.forEach((s, i) => {
      const on = i === idx;
      s.classList.toggle("active", on);
      s.classList.remove("enter-l", "enter-r", "exit-l", "exit-r");
      if (on) s.classList.add(dir >= 0 ? "enter-l" : "enter-r");
    });
    nodes.forEach((n, i) => n.classList.toggle("active", i === idx));
    yearEl.textContent = TL[idx].year;
    yearEl.parentElement.classList.remove("tick"); void yearEl.offsetWidth;
    yearEl.parentElement.classList.add("tick");
    stageName.textContent = TL[idx].title;
    stageDate.textContent = TL[idx].date;
    fill.style.width = (idx / (TL.length - 1)) * 100 + "%";
    document.title = `${TL[idx].title} — ${S.name}`;
    notifyEra(TL[idx]);
    align3dCards();
  }

  // tell the 3D layer where the .pane cards are (after enter animation settles)
  let alignTimer = null;
  function align3dCards() {
    if (alignTimer) clearTimeout(alignTimer);
    alignTimer = setTimeout(() => {
      try {
        if (!window.Scenes3D || !window.Scenes3D.alignCards) return;
        const rects = [...scenes[idx].querySelectorAll(".pane")].map(el => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        });
        window.Scenes3D.alignCards(rects);
      } catch (_) {}
    }, reduced ? 20 : 300);
  }
  addEventListener("resize", align3dCards);

  function go(i) {
    i = Math.max(0, Math.min(TL.length - 1, i));
    if (i === idx) return;
    const dir = i > idx ? 1 : -1;
    idx = i; render(dir);
  }
  let next = () => go(idx + 1), prev = () => go(idx - 1);   // replaced by navOrder-aware nav below

  // navigation order: rail order (chronological), hero ("now") pinned first, contact last
  const navOrder = (() => {
    const hero = TL.findIndex(e => e.type === "hero");
    const contact = TL.findIndex(e => e.type === "contact");
    const rest = TL.map((e, i) => ({ e, i }))
      .filter(x => x.i !== hero && x.i !== contact && !isNaN(parseInt(x.e.year, 10)))
      .sort((a, b) => parseInt(a.e.year, 10) - parseInt(b.e.year, 10) || a.i - b.i)
      .map(x => x.i);
    return [hero, ...rest, contact].filter(i => i >= 0);
  })();
  next = () => { const p = navOrder.indexOf(idx); go(navOrder[(p + 1) % navOrder.length]); };
  prev = () => { const p = navOrder.indexOf(idx); go(navOrder[(p - 1 + navOrder.length) % navOrder.length]); };

  document.getElementById("nextBtn").onclick = () => next();
  document.getElementById("prevBtn").onclick = () => prev();
  stage.addEventListener("click", (ev) => {
    const g = ev.target.closest("[data-go]"); if (g) go(+g.dataset.go);
  });

  // keyboard
  addEventListener("keydown", (ev) => {
    if (paletteOpen()) { if (ev.key === "Escape") closePalette(); return; }
    if (ev.key === "ArrowRight") next();
    else if (ev.key === "ArrowLeft") prev();
    else if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); openPalette(); }
  });

  // wheel: accumulate deltas, navigate on threshold; let scenes with overflowing content scroll natively
  let wheelAcc = 0, wheelLock = 0;
  addEventListener("wheel", (ev) => {
    if (paletteOpen()) return;
    const sc = document.querySelector(".scene.active");
    const canScroll = sc && sc.scrollHeight > sc.clientHeight + 8;
    const goingDown = ev.deltaY > 0;
    const atEdge = !sc || !canScroll ||
      (goingDown && sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) ||
      (!goingDown && sc.scrollTop <= 4);
    if (!atEdge) return;               // browser handles it as content scroll
    const now = Date.now();
    if (now < wheelLock) return;
    wheelAcc += ev.deltaY;
    if (Math.abs(wheelAcc) > 90) {
      wheelAcc > 0 ? next() : prev();
      wheelAcc = 0; wheelLock = now + 700;
    }
  }, { passive: true });

  // touch swipe + mouse drag
  let startX = null, startY = null, dragging = false;
  const down = (x, y, drag) => { startX = x; startY = y; dragging = drag; };
  const up = (x, y) => {
    if (startX == null) return;
    const dx = x - startX, dy = y - startY;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next() : prev());
    startX = null; dragging = false;
  };
  stage.addEventListener("touchstart", e => down(e.touches[0].clientX, e.touches[0].clientY, false), { passive: true });
  stage.addEventListener("touchend", e => up(e.changedTouches[0].clientX, e.changedTouches[0].clientY), { passive: true });
  stage.addEventListener("mousedown", e => { if (!e.target.closest("input,textarea,a,button")) down(e.clientX, e.clientY, true); });
  addEventListener("mouseup", e => { if (dragging) up(e.clientX, e.clientY); });


  // era mapping for 3D scenes + character
  const ERA_OF = (e) => {
    const map = {
      now: "present", skills: "skills", trajector: "ai",
      "proj-nova": "ai", "proj-rag": "ai", "proj-prreview": "ai",
      acefone: "earlycareer", "proj-paygate": "earlycareer",
      education: "college", achievements: "school", contact: "future",
    };
    return map[e.id] || (e.type === "project" ? "project" : e.type === "experience" ? "earlycareer" : "present");
  };
  const notifyEra = (e) => {
    const era = ERA_OF(e);
    try { window.Scenes3D && window.Scenes3D.setEra && window.Scenes3D.setEra(era); } catch (_) {}
    try { window.Character && window.Character.setEra && window.Character.setEra(era); } catch (_) {}
  };
  // ============ CONTACT FORM ============
  document.addEventListener("submit", (ev) => {
    if (ev.target.id !== "contactForm") return;
    ev.preventDefault();
    const em = document.getElementById("cfEmail"), st = document.getElementById("cfStatus"), btn = document.getElementById("cfSend");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim());
    em.classList.toggle("err", !ok);
    if (!ok) { st.textContent = "Enter a valid email address."; st.className = "form-status bad"; return; }
    // duplicate/spam guard: one send per minute
    const last = +localStorage.getItem("cf_last") || 0;
    if (Date.now() - last < 60000) { st.textContent = "Message already sent recently — try again in a minute."; st.className = "form-status bad"; return; }
    btn.disabled = true; btn.innerHTML = '<span class="spin">◌</span> Sending…';
    st.textContent = ""; st.className = "form-status";
    // Prototype: no network keys client-side. Compose via mailto + log locally.
    // Production: POST to /api/contact (Resend) — see BRIEF.md.
    setTimeout(() => {
      const msgs = JSON.parse(localStorage.getItem("cf_outbox") || "[]");
      msgs.push({ email: em.value.trim(), name: document.getElementById("cfName").value, message: document.getElementById("cfMsg").value, ts: new Date().toISOString() });
      localStorage.setItem("cf_outbox", JSON.stringify(msgs));
      localStorage.setItem("cf_last", Date.now());
      window.location.href = `mailto:${S.email}?subject=Portfolio contact from ${encodeURIComponent(em.value.trim())}&body=${encodeURIComponent(document.getElementById("cfMsg").value || "")}`;
      btn.disabled = false; btn.textContent = "Send Message";
      st.textContent = "Logged. Your mail client will open to deliver it."; st.className = "form-status ok";
    }, 700);
  });

  // ============ TIME JUMP PALETTE ============
  const backdrop = document.getElementById("paletteBackdrop");
  const pIn = document.getElementById("paletteInput");
  const pList = document.getElementById("paletteList");
  let sel = 0;
  const paletteOpen = () => !backdrop.hidden;
  const items = () => TL.map((e, i) => ({ i, label: e.title, hint: `${e.year} · ${e.type}` }))
    .concat([{ i: -1, label: "Download Resume", hint: "PDF", action: () => window.open(S.resumeUrl) },
             { i: -1, label: "Open Admin Dashboard", hint: "EDIT", action: () => window.open("admin.html") }]);
  function openPalette() { backdrop.hidden = false; pIn.value = ""; draw(""); pIn.focus(); }
  function closePalette() { backdrop.hidden = true; }
  function draw(q) {
    const its = items().filter(x => (x.label + " " + x.hint).toLowerCase().includes(q.toLowerCase()));
    sel = 0;
    pList.innerHTML = its.map((x, j) => `<li data-j="${j}" class="${j === 0 ? "sel" : ""}"><span>${esc(x.label)}</span><small>${esc(x.hint)}</small></li>`).join("");
    [...pList.children].forEach((li, j) => li.onclick = () => pick(its[j]));
    pList._items = its;
  }
  function pick(x) { closePalette(); if (!x) return; if (x.i >= 0) go(x.i); else x.action && x.action(); }
  pIn.addEventListener("input", () => draw(pIn.value));
  pIn.addEventListener("keydown", (ev) => {
    const its = pList._items || [];
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      ev.preventDefault();
      sel = Math.max(0, Math.min(its.length - 1, sel + (ev.key === "ArrowDown" ? 1 : -1)));
      [...pList.children].forEach((li, j) => li.classList.toggle("sel", j === sel));
    } else if (ev.key === "Enter") pick(its[sel]);
    else if (ev.key === "Escape") closePalette();
  });
  backdrop.addEventListener("click", (ev) => { if (ev.target === backdrop) closePalette(); });
  document.getElementById("paletteClose").onclick = closePalette;

  render(1);
})();
