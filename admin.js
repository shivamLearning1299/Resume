/* ==========================================================
 * Timeline Override Admin — vanilla JS, no dependencies.
 *
 * State model: a deep copy of {site, timeline} from the
 * globals on data.js (already merged with any saved
 * overrides). On Save we validate + write to localStorage
 * under "tl_overrides". The main site merges that key at
 * load, so overrides take effect on the next page view.
 * ========================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "tl_overrides";
  var OUTBOX_KEY = "cf_outbox";

  /* ---------- helpers ---------- */
  function $(sel) { return document.querySelector(sel); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }
  function slugify(str) {
    return String(str || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
  }

  /* ---------- status ---------- */
  var statusEl = $("#admStatus");
  var statusTimer = null;
  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.className = "adm-status" + (kind ? " " + kind : "");
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(function () {
      statusEl.textContent = "";
      statusEl.className = "adm-status";
    }, 4000);
  }

  /* ---------- working state ---------- */
  var TYPES = ["hero", "skills", "experience", "project", "education", "achievement", "contact"];
  var SITE_FIELDS = ["name", "role", "tagline", "subline", "location", "email", "github", "linkedin", "resumeUrl"];

  var state = {
    site: deepCopy(window.SITE || {}),
    timeline: deepCopy(window.TIMELINE || [])
  };

  /* ==========================================================
   * 1. Site settings
   * ========================================================== */
  function renderSiteFields() {
    var container = $("#admSiteFields");
    container.innerHTML = "";
    SITE_FIELDS.forEach(function (key) {
      var field = el("div", "adm-field");
      field.appendChild(el("label", null, key));
      var input = document.createElement("input");
      input.type = key === "resumeUrl" ? "text" : (key.indexOf("Url") >= 0 || key === "github" || key === "linkedin" ? "url" : "text");
      input.value = state.site[key] || "";
      input.dataset.siteKey = key;
      input.addEventListener("input", function () {
        state.site[key] = input.value;
      });
      field.appendChild(input);
      container.appendChild(field);
    });
  }

  /* ==========================================================
   * 2. Timeline events
   * ========================================================== */

  /** Build a label/ input pair. change(ev) fires on input. */
  function makeField(labelText, value, change, opts) {
    opts = opts || {};
    var field = el("div", "adm-field" + (opts.cls ? " " + opts.cls : ""));
    field.appendChild(el("label", null, labelText));
    var input;
    if (opts.textarea) {
      input = document.createElement("textarea");
      input.value = value;
    } else if (opts.select) {
      input = document.createElement("select");
      opts.select.forEach(function (optVal) {
        var o = document.createElement("option");
        o.value = optVal;
        o.textContent = optVal;
        input.appendChild(o);
      });
      input.value = value;
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.value = value;
    }
    input.addEventListener("input", function () { change(input.value, input); });
    if (opts.hint) field.appendChild(el("div", "adm-hint", opts.hint));
    field.appendChild(input);
    return field;
  }

  function renderEvents() {
    var container = $("#admEvents");
    container.innerHTML = "";

    state.timeline.forEach(function (ev, idx) {
      var card = el("div", "adm-event");

      /* --- header (click to expand) --- */
      var head = el("div", "adm-event-head");
      head.appendChild(el("span", "adm-ev-type", (ev.type || "?") + " · " + (ev.year || "?")));
      head.appendChild(el("span", "adm-ev-title", ev.title || "(untitled)"));
      head.appendChild(el("span", "adm-caret", "▶"));
      head.addEventListener("click", function () {
        card.classList.toggle("adm-open");
      });
      card.appendChild(head);

      /* --- body with editable fields --- */
      var body = el("div", "adm-event-body");
      var grid = el("div", "adm-ev-grid");

      grid.appendChild(makeField("id", ev.id || "", function (v, input) {
        ev.id = v;
        clearInvalid(input);
      }));
      grid.appendChild(makeField("type", ev.type || "experience", function (v) {
        ev.type = v;
        head.querySelector(".adm-ev-type").textContent = v + " · " + (ev.year || "?");
      }, { select: TYPES }));
      grid.appendChild(makeField("year", ev.year || "", function (v) {
        ev.year = v;
        head.querySelector(".adm-ev-type").textContent = (ev.type || "?") + " · " + (v || "?");
      }));
      grid.appendChild(makeField("date", ev.date || "", function (v) { ev.date = v; }));
      grid.appendChild(makeField("title (required)", ev.title || "", function (v, input) {
        ev.title = v;
        head.querySelector(".adm-ev-title").textContent = v || "(untitled)";
        clearInvalid(input);
      }, { cls: "adm-ev-full" }));
      grid.appendChild(makeField("company", ev.company || "", function (v) { ev.company = v; }));
      grid.appendChild(makeField("body", ev.body || "", function (v) { ev.body = v; }, { textarea: true, cls: "adm-ev-full" }));
      grid.appendChild(makeField("points (one per line)", (ev.points || []).join("\n"), function (v) {
        ev.points = v.split("\n").map(function (s) { return s.trim(); }).filter(Boolean);
      }, { textarea: true, cls: "adm-ev-full" }));
      grid.appendChild(makeField("tech (comma-separated)", (ev.tech || []).join(", "), function (v) {
        ev.tech = v.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      }, { cls: "adm-ev-full" }));
      grid.appendChild(makeField("architecture (comma-separated)", (ev.architecture || []).join(", "), function (v) {
        ev.architecture = v.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
      }, { cls: "adm-ev-full" }));

      /* featured checkbox */
      var check = el("div", "adm-check");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!ev.featured;
      cb.addEventListener("change", function () { ev.featured = cb.checked; });
      check.appendChild(cb);
      check.appendChild(el("span", null, "Featured"));
      grid.appendChild(check);

      /* clusters JSON (skills) */
      grid.appendChild(makeField("clusters (JSON, for skills)", JSON.stringify(ev.clusters || [], null, 2), function (v, input) {
        try {
          ev.clusters = JSON.parse(v);
          clearInvalid(input);
        } catch (e) {
          markInvalid(input);
        }
      }, { textarea: true, cls: "adm-ev-full", hint: "Array of { name, items[] }. Invalid JSON is flagged red until fixed." }));

      body.appendChild(grid);

      /* --- per-event actions --- */
      var actions = el("div", "adm-ev-actions");
      var upBtn = el("button", "adm-btn", "↑ Move up");
      var downBtn = el("button", "adm-btn", "↓ Move down");
      var delBtn = el("button", "adm-btn adm-btn-danger", "Delete");
      upBtn.addEventListener("click", function () { moveEvent(idx, -1); });
      downBtn.addEventListener("click", function () { moveEvent(idx, 1); });
      delBtn.addEventListener("click", function () {
        if (confirm("Delete event \"" + (ev.title || ev.id || "untitled") + "\"?")) {
          state.timeline.splice(idx, 1);
          renderEvents();
          setStatus("Event deleted — press Save to persist.", "");
        }
      });
      actions.appendChild(upBtn);
      actions.appendChild(downBtn);
      actions.appendChild(delBtn);
      body.appendChild(actions);

      card.appendChild(body);
      container.appendChild(card);
    });
  }

  function markInvalid(input) { input.classList.add("adm-invalid"); }
  function clearInvalid(input) { input.classList.remove("adm-invalid"); }

  function moveEvent(idx, delta) {
    var target = idx + delta;
    if (target < 0 || target >= state.timeline.length) return;
    var tmp = state.timeline[idx];
    state.timeline[idx] = state.timeline[target];
    state.timeline[target] = tmp;
    renderEvents();
    /* re-open the moved card at its new position */
    var cards = document.querySelectorAll("#admEvents .adm-event");
    if (cards[target]) cards[target].classList.add("adm-open");
    setStatus("Order changed — press Save to persist.", "");
  }

  /* ==========================================================
   * 3. Add event
   * ========================================================== */
  $("#admAddEvent").addEventListener("click", function () {
    state.timeline.push({
      id: "",
      type: "experience",
      year: new Date().getFullYear().toString(),
      date: "",
      title: "",
      company: "",
      body: "",
      points: [],
      tech: [],
      architecture: [],
      featured: false,
      clusters: []
    });
    renderEvents();
    var cards = document.querySelectorAll("#admEvents .adm-event");
    cards[cards.length - 1].classList.add("adm-open");
    cards[cards.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
  });

  /* ==========================================================
   * 4. Save / Reset / Export / Import
   * ========================================================== */

  /**
   * Validate every event. Ensures id/type/title; auto-generates
   * an id from the title when blank. Returns list of errors.
   */
  function validate() {
    var errors = [];
    var seen = {};
    state.timeline.forEach(function (ev, i) {
      var label = "Event " + (i + 1);
      if (!ev.title || !ev.title.trim()) {
        errors.push(label + ": title is required.");
      }
      if (!ev.type || TYPES.indexOf(ev.type) < 0) {
        errors.push(label + ": type must be one of " + TYPES.join(", ") + ".");
      }
      if (!ev.id || !ev.id.trim()) {
        ev.id = slugify(ev.title); // auto-generate before save
      }
      if (seen[ev.id]) {
        errors.push(label + " (\"" + ev.id + "\"): duplicate id — must be unique.");
      }
      seen[ev.id] = true;
      if (ev.clusters && !Array.isArray(ev.clusters)) {
        errors.push(label + ": clusters must be a JSON array.");
      }
    });
    return errors;
  }

  $("#admSave").addEventListener("click", function () {
    var errBox = $("#admErr");
    errBox.style.display = "none";

    /* flag any invalid clusters fields */
    var jsonInvalid = document.querySelectorAll("#admEvents textarea.adm-invalid").length > 0;
    var errors = validate();
    if (jsonInvalid) errors.unshift("Clusters JSON is invalid in at least one event.");
    if (errors.length) {
      errBox.innerHTML = errors.map(function (e) { return "• " + e; }).join("<br>");
      errBox.style.display = "block";
      setStatus("Save failed — fix errors below.", "adm-err");
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ site: state.site, timeline: state.timeline }));
    renderEvents(); // reflect auto-generated ids
    setStatus("Saved ✓ (" + localStorage.getItem(STORAGE_KEY).length + " bytes)", "adm-ok");
  });

  $("#admReset").addEventListener("click", function () {
    if (!confirm("Reset everything to defaults? This removes your saved overrides.")) return;
    localStorage.removeItem(STORAGE_KEY);
    setStatus("Overrides removed — reload to see defaults.", "adm-ok");
    /* re-render from fresh globals after stripping overrides */
    state.site = {};
    state.timeline = [];
    renderSiteFields();
    renderEvents();
    setTimeout(function () { location.reload(); }, 600);
  });

  $("#admExport").addEventListener("click", function () {
    var blob = new Blob([JSON.stringify({ site: state.site, timeline: state.timeline }, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "overrides.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    setStatus("Exported overrides.json", "adm-ok");
  });

  $("#admImportBtn").addEventListener("click", function () {
    $("#admImportFile").click();
  });
  $("#admImportFile").addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        if (!data || typeof data !== "object") throw new Error("not an object");
        if (data.site) state.site = data.site;
        if (Array.isArray(data.timeline)) state.timeline = data.timeline;
        renderSiteFields();
        renderEvents();
        setStatus("Imported ✓ — review, then press Save to persist.", "adm-ok");
      } catch (err) {
        setStatus("Import failed: invalid JSON.", "adm-err");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // allow re-importing the same file
  });

  /* ==========================================================
   * 5. Outbox (contact submissions from cf_outbox)
   * ========================================================== */
  function renderOutbox() {
    var container = $("#admOutbox");
    container.innerHTML = "";
    var items = [];
    try {
      items = JSON.parse(localStorage.getItem(OUTBOX_KEY) || "[]");
    } catch (e) { /* ignore corrupt data */ }
    if (!items.length) {
      container.appendChild(el("div", "adm-outbox-empty", "No submissions yet."));
      return;
    }
    items.forEach(function (item) {
      var ts = item.ts || item.time || "";
      var from = item.name || item.email || "unknown";
      var msg = item.message || item.body || JSON.stringify(item);
      container.appendChild(el("div", "adm-outbox-item", (ts ? "[" + ts + "] " : "") + from + "\n" + msg));
    });
  }
  $("#admClearOutbox").addEventListener("click", function () {
    if (!confirm("Clear all contact submissions?")) return;
    localStorage.removeItem(OUTBOX_KEY);
    renderOutbox();
    setStatus("Outbox cleared.", "adm-ok");
  });

  /* ---------- init ---------- */
  renderSiteFields();
  renderEvents();
  renderOutbox();
})();

/* ---- injected: logout + password + resume upload ---- */
(function () {
  var hdr = document.querySelector(".adm-top") || document.body;
  // change password
  var pwBtn = document.createElement("button");
  pwBtn.className = "adm-btn"; pwBtn.textContent = "Change password"; pwBtn.type = "button";
  pwBtn.onclick = function () {
    var p1 = prompt("New password (min 6 chars):");
    if (!p1 || p1.length < 6) return;
    if (p1 !== prompt("Repeat new password:")) return alert("Passwords did not match.");
    window.AUTH.setPassword(p1).then(function(){ alert("Password updated."); });
  };
  var loBtn = document.createElement("button");
  loBtn.className = "adm-btn"; loBtn.textContent = "Log out"; loBtn.type = "button";
  loBtn.onclick = function () { window.AUTH.logout(); };
  hdr.appendChild(pwBtn); hdr.appendChild(loBtn);
})();

/* ---- injected: resume upload (stored locally, served as data URL) ---- */
(function () {
  function addResumeControl() {
    var host = document.querySelector(".adm-section") || document.body;
    var box = document.createElement("div");
    box.className = "adm-resume";
    box.style.cssText = "margin-top:18px;padding-top:14px;border-top:1px dashed var(--line,rgba(232,237,242,.15));";
    var cur = localStorage.getItem("resume_blob_name") || window.SITE.resumeUrl;
    box.innerHTML = '<div style="font-family:var(--mono,monospace);font-size:10px;letter-spacing:.25em;text-transform:uppercase;color:var(--accent,#e8a33d);margin-bottom:10px">Resume file</div>' +
      '<div style="font-size:12px;color:var(--ink-dim,#9aa7b2);margin-bottom:10px">Current: <span id="admResumeName">' +
      (window.SITE._resumeUploaded ? "Uploaded: " + cur : cur + " (bundled file)") + '</span></div>';
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = "application/pdf"; inp.style.fontSize = "12px";
    inp.onchange = function () {
      var f = inp.files[0];
      if (!f) return;
      if (f.size > 4 * 1024 * 1024) return alert("PDF too large for local storage (max ~4 MB). Keep the bundled file or host it.");
      var r = new FileReader();
      r.onload = function () {
        localStorage.setItem("resume_blob", r.result);
        localStorage.setItem("resume_blob_name", f.name);
        window.SITE.resumeUrl = r.result;
        document.getElementById("admResumeName").textContent = "Uploaded: " + f.name;
        alert("Resume stored. All Download Resume links now serve this file.");
      };
      r.readAsDataURL(f);
    };
    var clr = document.createElement("button");
    clr.className = "adm-btn"; clr.type = "button"; clr.textContent = "Revert to bundled file";
    clr.style.marginLeft = "10px";
    clr.onclick = function () {
      localStorage.removeItem("resume_blob"); localStorage.removeItem("resume_blob_name");
      location.reload();
    };
    box.appendChild(inp); box.appendChild(clr);
    host.appendChild(box);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addResumeControl);
  else addResumeControl();
})();
