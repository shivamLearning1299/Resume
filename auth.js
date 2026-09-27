/* ============ ADMIN LOGIN GATE (frontend-only) ============
   Default password: "shivam2026"  ← change via admin dashboard "Change password"
   Hash stored here; a localStorage override (auth_hash) wins if the user
   changed it in the dashboard. Session flag lives in sessionStorage.
   Note: this is a deterrent gate, not server-grade security — fine for a
   static site; real protection comes when we add the Next.js backend. */
(function () {
  "use strict";
  const DEFAULT_HASH = "969d2e0a9b6e2b7a5b8cf5c4d1c62b8d7b4e0a2f3d1c0b9a8f7e6d5c4b3a2f100".slice(0, 64); // placeholder, replaced below
  const SESSION_KEY = "adm_auth_ok";
  const HASH_KEY = "auth_hash";

  async function sha256(text) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }

  async function currentHash() {
    return localStorage.getItem(HASH_KEY) || await sha256("shivam2026");
  }

  window.AUTH = {
    isAuthed: () => sessionStorage.getItem(SESSION_KEY) === "1",
    logout: () => { sessionStorage.removeItem(SESSION_KEY); location.reload(); },
    setPassword: async (pw) => { localStorage.setItem(HASH_KEY, await sha256(pw)); },
    check: async (pw) => (await sha256(pw)) === await currentHash(),
    gate: async () => {
      if (window.AUTH.isAuthed()) return true;
      const style = document.createElement("style");
      style.textContent = `
        .auth-wall{position:fixed;inset:0;z-index:100;background:var(--bg,#12100d);
          display:flex;align-items:center;justify-content:center;font-family:var(--font,system-ui);color:var(--ink,#e8edf2)}
        .auth-box{width:300px;text-align:center}
        .auth-box h2{font-family:var(--mono,monospace);font-size:11px;letter-spacing:.3em;
          text-transform:uppercase;color:var(--accent,#e8a33d);margin-bottom:8px;font-weight:500}
        .auth-box p{font-size:13px;color:var(--ink-faint,#5c6873);margin-bottom:24px}
        .auth-box input{width:100%;background:transparent;border:none;border-bottom:1px solid var(--line,rgba(232,237,242,.09));
          color:inherit;font-size:16px;padding:9px 2px;outline:none;text-align:center;letter-spacing:.08em}
        .auth-box input:focus{border-bottom-color:var(--accent,#e8a33d)}
        .auth-box button{margin-top:22px;width:100%;padding:11px;font-size:13px;border:1px solid var(--ink,#e8edf2);
          background:var(--ink,#e8edf2);color:var(--bg,#12100d);cursor:pointer;border-radius:2px}
        .auth-box button:hover{background:var(--accent,#e8a33d);border-color:var(--accent,#e8a33d)}
        .auth-err{font-family:var(--mono,monospace);font-size:11px;color:#e06464;margin-top:14px;min-height:14px}
        .auth-box .back{display:block;margin-top:18px;font-family:var(--mono,monospace);font-size:10px;
          letter-spacing:.2em;color:var(--ink-faint,#5c6873);text-decoration:none}
        .auth-box .back:hover{color:var(--accent,#e8a33d)}`;
      document.head.appendChild(style);
      document.body.innerHTML = "";
      const wall = document.createElement("div");
      wall.className = "auth-wall";
      wall.innerHTML = `<div class="auth-box">
        <h2>Admin Access</h2><p>This area edits live site content.</p>
        <form id="authForm"><input type="password" id="authPw" placeholder="password" autofocus autocomplete="current-password" />
        <button type="submit">Unlock</button><div class="auth-err" id="authErr"></div></form>
        <a class="back" href="index.html">← back to site</a></div>`;
      document.body.appendChild(wall);
      document.getElementById("authForm").onsubmit = async (ev) => {
        ev.preventDefault();
        const pw = document.getElementById("authPw").value;
        if (await window.AUTH.check(pw)) { sessionStorage.setItem(SESSION_KEY, "1"); location.reload(); }
        else document.getElementById("authErr").textContent = "Wrong password.";
      };
      return false;
    },
  };
})();
