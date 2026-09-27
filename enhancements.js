/* enhancements.js — ambient layer, live timestamp, parallax, magnetic hover.
   Zero-dependency, fully guarded, loaded after app.js. */
(function () {
  'use strict';

  var reduceMotion = false;
  try {
    var rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion = rmQuery.matches;
    if (typeof rmQuery.addEventListener === 'function') {
      rmQuery.addEventListener('change', function (e) { reduceMotion = e.matches; });
    }
  } catch (e) { /* noop */ }

  var isFinePointer = false;
  try {
    isFinePointer = window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(hover: none)').matches;
  } catch (e) { /* noop */ }

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* ------------------------------------------------------------------ *
   * 1) Ambient particle canvas
   * ------------------------------------------------------------------ */
  function initAmbient() {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.id = 'ambient-layer';
    canvas.style.cssText =
      'position:fixed;inset:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:-1;opacity:.5;';
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var W = 0, H = 0;
    var particles = [];
    var COUNT = 40;
    var LINK_DIST = 120;
    var lastFrame = 0;
    var rafId = null;
    var running = false;

    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: 1 + Math.random() * 1.5
        });
      }
    }

    function tick(ts) {
      rafId = null;
      if (!running) return;
      if (ts - lastFrame < 1000 / 30) { // throttle to ~30fps
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastFrame = ts;

      ctx.clearRect(0, 0, W, H);

      var i, j, p;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }

      // connecting lines
      ctx.strokeStyle = 'rgba(232,163,61,0.12)';
      ctx.lineWidth = 1;
      for (i = 0; i < particles.length; i++) {
        for (j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            var alpha = 0.12 * (1 - Math.sqrt(d2) / LINK_DIST);
            ctx.strokeStyle = 'rgba(232,163,61,' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // dots
      ctx.fillStyle = 'rgba(232,163,61,0.25)';
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduceMotion || document.hidden) return;
      running = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      ctx.clearRect(0, 0, W, H);
    }

    function sync() {
      if (reduceMotion || document.hidden) stop();
      else start();
    }

    window.addEventListener('resize', function () {
      resize();
      if (reduceMotion) { ctx.clearRect(0, 0, W, H); }
    });
    document.addEventListener('visibilitychange', sync);

    resize();
    seed();
    sync();
  }

  /* ------------------------------------------------------------------ *
   * 2) Live timestamp in topbar
   * ------------------------------------------------------------------ */
  function initTimestamp() {
    var host = document.querySelector('.topbar-center');
    if (!host) return;

    var el = document.createElement('div');
    el.id = 'live-timestamp';
    el.style.cssText =
      'font-family:var(--mono);font-size:10px;letter-spacing:.18em;' +
      'color:var(--ink);opacity:.55;margin-top:4px;white-space:nowrap;';
    host.appendChild(el);

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function update() {
      var now = new Date();
      var h = pad(now.getHours()), m = pad(now.getMinutes()), s = pad(now.getSeconds());
      var zone = '';
      try {
        var parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
          .formatToParts(now);
        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === 'timeZoneName') { zone = parts[i].value; break; }
        }
      } catch (e) { /* noop */ }
      el.textContent = 'LOCAL ' + h + ':' + m + ':' + s + (zone ? ' ' + zone : '');
    }

    update();
    setInterval(update, 1000);
  }

  /* ------------------------------------------------------------------ *
   * 3) Parallax on active .scene-inner (desktop pointer only)
   * ------------------------------------------------------------------ */
  function initParallax() {
    if (!isFinePointer) return;

    var targetX = 0, targetY = 0;
    var pending = false;

    function currentInner() {
      var active = document.querySelector('.scene.active') ||
        document.querySelector('.scene.is-active');
      if (active) {
        var inner = active.querySelector('.scene-inner');
        if (inner) return inner;
      }
      var single = document.querySelector('.scene-inner');
      return single || null;
    }

    function apply() {
      pending = false;
      var inner = currentInner();
      if (!inner) return;
      if (reduceMotion) {
        inner.style.transform = '';
        return;
      }
      inner.style.transform =
        'translate3d(' + targetX.toFixed(2) + 'px,' + targetY.toFixed(2) + 'px,0)';
    }

    function schedule() {
      if (pending) return;
      pending = true;
      requestAnimationFrame(apply);
    }

    document.addEventListener('mousemove', function (e) {
      var nx = (e.clientX / window.innerWidth) * 2 - 1;   // -1..1
      var ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetX = nx * 8;
      targetY = ny * 8;
      schedule();
    });

    document.addEventListener('mouseleave', function () {
      targetX = 0; targetY = 0;
      schedule();
    });
  }

  /* ------------------------------------------------------------------ *
   * 4) Magnetic hover for .cta and .chip
   * ------------------------------------------------------------------ */
  function initMagnetic() {
    if (!isFinePointer) return;

    var MAX = 6;
    var bound = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

    function attach(el) {
      if (!el || (bound && bound.has(el))) return;
      if (bound) bound.add(el);

      el.style.willChange = 'transform';
      el.style.transition = 'transform .18s ease-out';

      var rafId = null;
      var tx = 0, ty = 0;

      function render() {
        rafId = null;
        if (reduceMotion) { el.style.transform = ''; return; }
        el.style.transform = 'translate3d(' + tx + 'px,' + ty + 'px,0)';
      }

      function schedule() {
        if (!rafId) rafId = requestAnimationFrame(render);
      }

      el.addEventListener('mousemove', function (e) {
        if (reduceMotion) return;
        var rect = el.getBoundingClientRect();
        tx = Math.max(-MAX, Math.min(MAX,
          (e.clientX - (rect.left + rect.width / 2)) * 0.25));
        ty = Math.max(-MAX, Math.min(MAX,
          (e.clientY - (rect.top + rect.height / 2)) * 0.25));
        schedule();
      });

      el.addEventListener('mouseleave', function () {
        tx = 0; ty = 0;
        schedule();
      });
    }

    function bindAll() {
      var els = document.querySelectorAll('.cta, .chip');
      for (var i = 0; i < els.length; i++) attach(els[i]);
    }

    bindAll();

    // Rebind if the app re-renders scenes dynamically.
    if (typeof MutationObserver !== 'undefined' && document.body) {
      var debounce = null;
      new MutationObserver(function () {
        if (debounce) return;
        debounce = setTimeout(function () {
          debounce = null;
          bindAll();
        }, 120);
      }).observe(document.body, { childList: true, subtree: true });
    }
  }

  ready(function () {
    try { initAmbient(); } catch (e) { /* noop */ }
    try { initTimestamp(); } catch (e) { /* noop */ }
    try { initParallax(); } catch (e) { /* noop */ }
    try { initMagnetic(); } catch (e) { /* noop */ }
  });
})();
