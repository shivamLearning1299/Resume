/* ============================================================
   SUMMARY MODE — overlay one-pager, zero dependencies.
   Loaded last (deferred). Reads window.SITE / window.TIMELINE.
   ============================================================ */
(function () {
  "use strict";

  var S = window.SITE || {};
  var T = Array.isArray(window.TIMELINE) ? window.TIMELINE : [];

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function tag(txt) { return el("span", "sum-tag", txt); }
  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- styles ---------- */
  var CSS = `
  .sum-btn{ display:none; }
  /* big centered hero button, injected under the hero pane */
  .sum-hero-btn{
    display:flex; align-items:center; gap:14px; margin:22px auto 0;
    font-family:var(--mono,monospace); font-size:13px; letter-spacing:.18em;
    color:#12100d; background:var(--accent,#e8a33d);
    border:1px solid var(--accent,#e8a33d); padding:16px 34px; cursor:pointer;
    text-transform:uppercase; font-weight:600;
    border-radius:22px; corner-shape:squircle;
    box-shadow:0 10px 34px rgba(232,163,61,.28), 0 0 0 6px rgba(232,163,61,.08);
    transition:transform .25s cubic-bezier(.22,.9,.28,1), box-shadow .25s;
  }
  .sum-hero-btn:hover{
    transform:translateY(-3px) scale(1.02);
    box-shadow:0 16px 44px rgba(232,163,61,.4), 0 0 0 8px rgba(232,163,61,.12);
  }
  .sum-hero-btn .sum-hero-icon{ font-size:20px; line-height:1; }
  @supports not (corner-shape: squircle){ .sum-hero-btn{ border-radius:26px; } }

  .sum-overlay{
    position:fixed; inset:0; z-index:60; overflow-y:auto;
    background:var(--bg,#12100d); color:var(--ink,#e8edf2);
    font-family:var(--font,system-ui,sans-serif);
    opacity:0; transition:opacity .25s ease;
  }
  .sum-overlay.sum-open{ opacity:1; }
  .sum-overlay.sum-instant{ transition:none; }
  body.sum-locked{ overflow:hidden; }

  .sum-close{
    position:fixed; top:22px; right:26px; z-index:61;
    font-family:var(--mono,monospace); font-size:14px;
    color:var(--ink-dim,#8b97a3); background:transparent;
    border:1px solid var(--line,#22303a); width:38px; height:38px;
    cursor:pointer; transition:color .2s,border-color .2s;
  }
  .sum-close:hover{ color:var(--accent,#e8a33d); border-color:var(--accent,#e8a33d); }

  .sum-wrap{
    max-width:1080px; margin:0 auto; padding:96px 32px 120px;
    display:flex; gap:64px; align-items:flex-start;
  }
  .sum-rail{ flex:0 0 240px; position:sticky; top:96px; }
  .sum-main{ flex:1; min-width:0; max-width:760px; }

  .sum-rail h1{
    font-size:30px; font-weight:700; line-height:1.15; margin:0 0 8px;
    letter-spacing:-.01em;
  }
  .sum-rail-role{ font-family:var(--mono,monospace); font-size:12px; color:var(--accent,#e8a33d); letter-spacing:.12em; text-transform:uppercase; margin-bottom:12px; }
  .sum-rail-tag{ font-size:14px; color:var(--ink-dim,#8b97a3); line-height:1.5; margin:0 0 28px; }
  .sum-rail-links{ display:flex; flex-direction:column; gap:8px; margin-bottom:32px; }
  .sum-rail-links a{
    font-family:var(--mono,monospace); font-size:12px; letter-spacing:.1em;
    color:var(--ink,#e8edf2); text-decoration:none;
    border-bottom:1px solid transparent; width:fit-content;
  }
  .sum-rail-links a:hover{ color:var(--accent,#e8a33d); border-bottom-color:var(--accent,#e8a33d); }
  .sum-cta{
    display:inline-block; font-family:var(--mono,monospace); font-size:11px;
    letter-spacing:.2em; text-transform:uppercase; text-decoration:none;
    color:var(--bg,#12100d); background:var(--accent,#e8a33d);
    padding:12px 20px; transition:opacity .2s;
  }
  .sum-cta:hover{ opacity:.85; }

  .sum-section{ padding:44px 0 56px; border-top:1px solid var(--line,#22303a); }
  .sum-section:first-child{ border-top:none; padding-top:8px; }
  .sum-label{
    font-family:var(--mono,monospace); font-size:11px; letter-spacing:.25em;
    text-transform:uppercase; color:var(--accent,#e8a33d); margin:0 0 18px;
  }
  .sum-section h2{
    font-size:26px; font-weight:700; letter-spacing:-.01em; margin:0 0 20px;
  }
  .sum-prose{ font-size:16px; line-height:1.7; color:var(--ink,#e8edf2); margin:0 0 10px; }
  .sum-meta{ font-family:var(--mono,monospace); font-size:12px; color:var(--ink-dim,#8b97a3); letter-spacing:.06em; }

  .sum-cluster{ margin-bottom:20px; }
  .sum-cluster-name{ font-family:var(--mono,monospace); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--ink-dim,#8b97a3); margin:0 0 10px; }
  .sum-tags{ display:flex; flex-wrap:wrap; gap:8px; }
  .sum-tag{
    font-family:var(--mono,monospace); font-size:11px; letter-spacing:.05em;
    border:1px solid var(--line,#22303a); padding:5px 10px;
    color:var(--ink,#e8edf2);
  }

  .sum-item{ margin-bottom:32px; }
  .sum-item:last-child{ margin-bottom:0; }
  .sum-item-head{ display:flex; justify-content:space-between; align-items:baseline; gap:16px; flex-wrap:wrap; margin-bottom:4px; }
  .sum-item-title{ font-size:18px; font-weight:600; margin:0; }
  .sum-item-co{ color:var(--ink-dim,#8b97a3); font-weight:400; }
  .sum-item-date{ font-family:var(--mono,monospace); font-size:11px; letter-spacing:.12em; color:var(--accent,#e8a33d); white-space:nowrap; }
  .sum-item-body{ font-size:15px; line-height:1.65; color:var(--ink,#e8edf2); margin:8px 0 10px; }
  .sum-points{ margin:0; padding-left:18px; }
  .sum-points li{ font-size:14px; line-height:1.6; color:var(--ink-dim,#8b97a3); margin-bottom:4px; }
  .sum-item .sum-tags{ margin-top:10px; }

  .sum-closing{ font-size:20px; font-weight:600; line-height:1.4; margin:18px 0 0; }
  .sum-contact-links{ display:flex; flex-wrap:wrap; gap:24px; }
  .sum-contact-links a{ font-family:var(--mono,monospace); font-size:13px; letter-spacing:.08em; color:var(--ink,#e8edf2); text-decoration:none; border-bottom:1px solid var(--line,#22303a); padding-bottom:3px; }
  .sum-contact-links a:hover{ color:var(--accent,#e8a33d); border-bottom-color:var(--accent,#e8a33d); }

  @media (max-width:800px){
    .sum-wrap{ flex-direction:column; gap:40px; padding-top:80px; }
    .sum-rail{ position:static; flex:none; }
  }
  `;

  var style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  /* ---------- topbar button ---------- */
  var topbar = document.querySelector(".topbar");
  var btn = el("button", "sum-btn", "Summary");
  btn.type = "button";
  btn.setAttribute("aria-label", "Open summary");
  if (topbar) {
    topbar.appendChild(btn);
  } else {
    document.body.appendChild(btn);
    btn.style.position = "fixed";
    btn.style.zIndex = "50";
  }

  /* big centered button on the home (hero) scene */
  function mountHeroButton() {
    var existing = document.querySelector(".sum-hero-btn");
    if (existing) existing.remove();
    var hero = document.querySelector('.scene[data-i="0"] .scene-inner');
    if (!hero) return;
    var heroBtn = el("button", "sum-hero-btn");
    heroBtn.type = "button";
    heroBtn.innerHTML = '<span class="sum-hero-icon">⚡</span><span>1-Minute Summary for Recruiters</span>';
    heroBtn.setAttribute("aria-label", "Open one-minute summary");
    heroBtn.addEventListener("click", function () { openSummary(); });
    hero.appendChild(heroBtn);
  }
  /* scenes are re-rendered in place; app.js calls render() on nav — hook via MutationObserver on class changes */
  var stageRoot = document.getElementById("stage");
  if (stageRoot) {
    var lastIdx = null;
    setInterval(function () {
      var active = stageRoot.querySelector(".scene.active");
      var i = active ? active.getAttribute("data-i") : null;
      if (i !== lastIdx) { lastIdx = i; if (i === "0") mountHeroButton(); }
    }, 250);
    mountHeroButton();
  }

  /* ---------- overlay (built lazily on first open) ---------- */
  var overlay = null;
  var lastFocus = null;

  function dataByType(t) { return T.filter(function (e) { return e && e.type === t; }); }

  function section(label, title) {
    var sec = el("section", "sum-section");
    if (label) sec.appendChild(el("p", "sum-label", label));
    if (title) sec.appendChild(el("h2", null, title));
    return sec;
  }

  function buildContent() {
    var root = el("div", "sum-overlay");
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Summary of " + (S.name || "portfolio"));

    var close = el("button", "sum-close", "\u2715");
    close.type = "button";
    close.setAttribute("aria-label", "Close summary");
    close.addEventListener("click", closeSummary);
    root.appendChild(close);
    root._closeBtn = close;

    var wrap = el("div", "sum-wrap");

    // left rail
    var rail = el("aside", "sum-rail");
    rail.appendChild(el("h1", null, S.name || "Portfolio"));
    if (S.role) rail.appendChild(el("p", "sum-rail-role", S.role));
    if (S.tagline) rail.appendChild(el("p", "sum-rail-tag", S.tagline));
    var links = el("nav", "sum-rail-links");
    if (S.email) {
      links.appendChild(el("a", null, S.email)).href = "mailto:" + S.email;
    }
    if (S.github) {
      var g = links.appendChild(el("a", null, "GitHub"));
      g.href = S.github; g.target = "_blank"; g.rel = "noopener";
    }
    if (S.linkedin) {
      var l = links.appendChild(el("a", null, "LinkedIn"));
      l.href = S.linkedin; l.target = "_blank"; l.rel = "noopener";
    }
    if (links.children.length) rail.appendChild(links);
    if (S.resumeUrl) {
      var cta = el("a", "sum-cta", "Download Resume");
      cta.href = S.resumeUrl;
      cta.setAttribute("download", "");
      rail.appendChild(cta);
    }
    wrap.appendChild(rail);

    // main column
    var main = el("main", "sum-main");

    // About
    var about = section("01 \u00B7 Profile");
    if (S.subline) about.appendChild(el("p", "sum-prose", S.subline));
    var meta = [];
    if (S.location) meta.push(S.location);
    if (S.experience) meta.push(S.experience + " experience");
    if (meta.length) about.appendChild(el("p", "sum-meta", meta.join(" \u00B7 ")));
    main.appendChild(about);

    // Core stacks
    var skills = dataByType("skills")[0];
    if (skills && Array.isArray(skills.clusters) && skills.clusters.length) {
      var sec = section("02 \u00B7 Core stacks");
      skills.clusters.forEach(function (c) {
        if (!c || !Array.isArray(c.items) || !c.items.length) return;
        var block = el("div", "sum-cluster");
        block.appendChild(el("p", "sum-cluster-name", c.name || "Stack"));
        var tags = el("div", "sum-tags");
        c.items.forEach(function (it) { tags.appendChild(tag(it)); });
        block.appendChild(tags);
        sec.appendChild(block);
      });
      main.appendChild(sec);
    }

    // Selected work
    var work = dataByType("experience");
    if (work.length) {
      var wsec = section("03 \u00B7 Selected work");
      work.forEach(function (e) {
        var item = el("article", "sum-item");
        var head = el("div", "sum-item-head");
        var t = el("h3", "sum-item-title", e.title || "");
        if (e.company) t.appendChild(el("span", "sum-item-co", " \u2014 " + e.company));
        head.appendChild(t);
        head.appendChild(el("span", "sum-item-date", e.date || e.year || ""));
        item.appendChild(head);
        if (e.body) item.appendChild(el("p", "sum-item-body", e.body));
        if (Array.isArray(e.points) && e.points.length) {
          var ul = el("ul", "sum-points");
          e.points.slice(0, 2).forEach(function (p) {
            ul.appendChild(el("li", null, p));
          });
          item.appendChild(ul);
        }
        wsec.appendChild(item);
      });
      main.appendChild(wsec);
    }

    // Major projects (featured first)
    var projects = dataByType("project").slice().sort(function (a, b) {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
    if (projects.length) {
      var psec = section("04 \u00B7 Major projects");
      projects.forEach(function (e) {
        var item = el("article", "sum-item");
        var head = el("div", "sum-item-head");
        head.appendChild(el("h3", "sum-item-title", e.title || "Project"));
        head.appendChild(el("span", "sum-item-date", e.date || e.year || ""));
        item.appendChild(head);
        if (e.body) item.appendChild(el("p", "sum-item-body", String(e.body).split("\n")[0]));
        if (Array.isArray(e.tech) && e.tech.length) {
          var tags = el("div", "sum-tags");
          e.tech.forEach(function (t) { tags.appendChild(tag(t)); });
          item.appendChild(tags);
        }
        psec.appendChild(item);
      });
      main.appendChild(psec);
    }

    // Education & achievements
    var edu = dataByType("education").concat(dataByType("achievement"));
    if (edu.length) {
      var esec = section("05 \u00B7 Education & achievements");
      edu.forEach(function (e) {
        var item = el("article", "sum-item");
        var head = el("div", "sum-item-head");
        var t = el("h3", "sum-item-title", e.title || "");
        if (e.company) t.appendChild(el("span", "sum-item-co", " \u2014 " + e.company));
        head.appendChild(t);
        head.appendChild(el("span", "sum-item-date", e.date || e.year || ""));
        item.appendChild(head);
        if (e.body) item.appendChild(el("p", "sum-item-body", e.body));
        esec.appendChild(item);
      });
      main.appendChild(esec);
    }

    // Contact
    var csec = section("06 \u00B7 Contact");
    var row = el("div", "sum-contact-links");
    if (S.email) row.appendChild(el("a", null, S.email)).href = "mailto:" + S.email;
    if (S.github) {
      var g2 = row.appendChild(el("a", null, "GitHub"));
      g2.href = S.github; g2.target = "_blank"; g2.rel = "noopener";
    }
    if (S.linkedin) {
      var l2 = row.appendChild(el("a", null, "LinkedIn"));
      l2.href = S.linkedin; l2.target = "_blank"; l2.rel = "noopener";
    }
    csec.appendChild(row);
    if (S.tagline) csec.appendChild(el("p", "sum-closing", "\u201C" + S.tagline + "\u201D"));
    main.appendChild(csec);

    wrap.appendChild(main);
    root.appendChild(wrap);

    // backdrop click (click on overlay itself, not content)
    root.addEventListener("click", function (ev) {
      if (ev.target === root) closeSummary();
    });

    return root;
  }

  function openSummary() {
    if (overlay) return;
    lastFocus = document.activeElement;
    overlay = buildContent();
    if (reducedMotion()) overlay.classList.add("sum-instant");
    document.body.appendChild(overlay);
    document.body.classList.add("sum-locked");
    requestAnimationFrame(function () {
      overlay.classList.add("sum-open");
    });
    overlay._closeBtn.focus();
    document.addEventListener("keydown", onKey, true);
  }

  function closeSummary() {
    if (!overlay) return;
    document.removeEventListener("keydown", onKey, true);
    var o = overlay;
    overlay = null;
    document.body.classList.remove("sum-locked");
    if (reducedMotion()) {
      o.remove();
    } else {
      o.classList.remove("sum-open");
      setTimeout(function () { o.remove(); }, 260);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(ev) {
    if (ev.key === "Escape") {
      ev.preventDefault();
      closeSummary();
    } else if (ev.key === "Tab" && overlay) {
      // light focus trap
      var focusables = overlay.querySelectorAll("button, a[href]");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (ev.shiftKey && document.activeElement === first) {
        ev.preventDefault(); last.focus();
      } else if (!ev.shiftKey && document.activeElement === last) {
        ev.preventDefault(); first.focus();
      }
    }
  }

  btn.addEventListener("click", function () {
    if (overlay) closeSummary(); else openSummary();
  });

  /* ---------- "s" shortcut ---------- */
  document.addEventListener("keydown", function (ev) {
    if ((ev.key || "").toLowerCase() !== "s") return;
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var ae = document.activeElement;
    if (ae) {
      var tag = ae.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || ae.isContentEditable) return;
      // don't hijack while a command palette is open
      if (ae.closest && ae.closest(".palette, .cmdk, .command-palette, [data-palette]")) return;
    }
    if (!overlay && document.querySelector(".palette.open, .cmdk.open, .command-palette.open, [data-palette].open")) return;
    if (overlay) {
      // typing "s" inside overlay shouldn't toggle unless not in an input (checked above)
      closeSummary();
    } else {
      openSummary();
    }
  });
})();
