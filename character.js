/* character.js — symbolic "aging guide" avatar that evolves with the timeline.
   Zero-dependency vanilla JS. Loaded via <script defer src="character.js"></script> after app.js.
   Exposes: window.Character = { setEra(eraKey) } */
(function () {
  'use strict';

  var ACCENT = '#e8a33d';
  var FAINT = 'rgba(232,163,61,0.14)';

  var LABELS = {
    school: 'SCHOOL · 2017',
    college: 'COLLEGE · 2017–2021',
    earlycareer: 'EARLY CAREER · 2021–2023',
    ai: 'AI · 2023—NOW',
    present: 'AI · 2023—NOW',
    future: 'FUTURE',
    default: 'TIME TRAVELER'
  };

  /* ---- Minimalist architectural line-art figure variants (viewBox 0 0 100 120) ---- */
  function baseFigure(extra) {
    return '' +
      '<circle cx="50" cy="16" r="8" fill="none" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
      '<line x1="50" y1="24" x2="50" y2="66" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
      '<line x1="50" y1="34" x2="30" y2="52" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
      '<line x1="50" y1="34" x2="70" y2="52" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
      '<line x1="50" y1="66" x2="36" y2="102" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
      '<line x1="50" y1="66" x2="64" y2="102" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
      '<line x1="26" y1="112" x2="74" y2="112" stroke="' + ACCENT + '" stroke-width="0.8" opacity="0.35"/>' +
      (extra || '');
  }

  var VARIANTS = {
    school: {
      // small figure with backpack, curious tilt
      scale: 0.8,
      svg: '<g transform="rotate(2 50 100)">' + baseFigure(
        '<rect x="58" y="34" width="18" height="26" rx="3" fill="' + FAINT + '" stroke="' + ACCENT + '" stroke-width="1.2"/>' +
        '<line x1="58" y1="42" x2="76" y2="42" stroke="' + ACCENT + '" stroke-width="1" opacity="0.6"/>' +
        '<circle cx="50" cy="12" r="8" fill="none" stroke="' + ACCENT + '" stroke-width="1" opacity="0.5" stroke-dasharray="3 3"/>'
      ) + '</g>'
    },
    college: {
      svg: baseFigure(
        // open book held in front
        '<path d="M32 58 L44 62 L44 76 L32 72 Z" fill="' + FAINT + '" stroke="' + ACCENT + '" stroke-width="1.2"/>' +
        '<path d="M56 62 L68 58 L68 72 L56 76 Z" fill="' + FAINT + '" stroke="' + ACCENT + '" stroke-width="1.2"/>' +
        '<line x1="44" y1="62" x2="44" y2="76" stroke="' + ACCENT + '" stroke-width="1"/>' +
        // subtle mortarboard hint
        '<line x1="40" y1="7" x2="60" y2="7" stroke="' + ACCENT + '" stroke-width="1.4" opacity="0.55"/>'
      )
    },
    earlycareer: {
      // upright stride, briefcase + ID badge
      svg: '<g transform="translate(0,-2)">' + baseFigure(
        '<rect x="66" y="62" width="22" height="16" rx="2" fill="' + FAINT + '" stroke="' + ACCENT + '" stroke-width="1.2"/>' +
        '<path d="M71 62 v-4 h12 v4" fill="none" stroke="' + ACCENT + '" stroke-width="1.2"/>' +
        '<rect x="44" y="40" width="7" height="10" rx="1" fill="none" stroke="' + ACCENT + '" stroke-width="1" opacity="0.8"/>' +
        '<line x1="47.5" y1="40" x2="47.5" y2="36" stroke="' + ACCENT + '" stroke-width="0.8" opacity="0.8"/>'
      ) + '</g>'
    },
    ai: {
      // orbital ring / node halo, confident stance, faint glow
      svg: '<ellipse cx="50" cy="16" rx="18" ry="9" fill="none" stroke="' + ACCENT + '" stroke-width="1" opacity="0.7" transform="rotate(-18 50 16)"/>' +
        '<circle cx="68" cy="10" r="2.4" fill="' + ACCENT + '" opacity="0.85"/>' +
        '<circle cx="32" cy="22" r="1.8" fill="' + ACCENT + '" opacity="0.6"/>' +
        '<circle cx="50" cy="60" r="26" fill="none" stroke="' + ACCENT + '" stroke-width="0.6" opacity="0.25"/>' +
        baseFigure('')
    },
    future: {
      // forward-looking, translucent, beacon accent
      opacity: 0.75,
      svg: '<line x1="50" y1="4" x2="50" y2="8" stroke="' + ACCENT + '" stroke-width="1.2"/>' +
        '<circle cx="50" cy="3" r="2" fill="' + ACCENT + '" opacity="0.9"/>' +
        '<line x1="50" y1="34" x2="76" y2="42" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
        '<circle cx="78" cy="41" r="2.2" fill="none" stroke="' + ACCENT + '" stroke-width="1.2"/>' +
        '<circle cx="50" cy="16" r="8" fill="none" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
        '<line x1="50" y1="24" x2="50" y2="66" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
        '<line x1="50" y1="34" x2="30" y2="52" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
        '<line x1="50" y1="66" x2="38" y2="102" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
        '<line x1="50" y1="66" x2="68" y2="98" stroke="' + ACCENT + '" stroke-width="1.6"/>' +
        '<line x1="26" y1="112" x2="74" y2="112" stroke="' + ACCENT + '" stroke-width="0.8" opacity="0.35"/>'
    },
    default: { svg: baseFigure('') }
  };

  var eraAlias = { aipresent: 'ai', present: 'ai' };

  function resolveVariant(key) {
    if (!key) return VARIANTS.default;
    var k = String(key).toLowerCase().replace(/[^a-z]/g, '');
    if (eraAlias[k]) k = eraAlias[k];
    return VARIANTS[k] || VARIANTS.default;
  }

  function labelFor(key) {
    if (!key) return LABELS.default;
    var k = String(key).toLowerCase().replace(/[^a-z]/g, '');
    if (eraAlias[k]) k = eraAlias[k];
    return LABELS[k] || LABELS.default;
  }

  /* ---------- inject styles ---------- */
  function injectStyles() {
    var css =
      '.chr-root{position:fixed;left:5vw;bottom:90px;width:100px;z-index:20;pointer-events:none;' +
      'transform-origin:bottom center;filter:drop-shadow(0 0 6px rgba(232,163,61,0.10));}' +
      '.chr-stage{position:relative;width:100px;height:132px;overflow:visible;}' +
      '.chr-fig{position:absolute;left:0;bottom:14px;width:100px;height:120px;opacity:1;}' +
      '.chr-fig svg{display:block;width:100%;height:100%;}' +
      '.chr-label{position:absolute;left:0;right:0;bottom:0;text-align:center;font-family:var(--mono,ui-monospace,monospace);' +
      'font-size:9px;letter-spacing:0.2em;color:' + ACCENT + ';opacity:0.45;text-transform:uppercase;white-space:nowrap;}' +
      '@keyframes chr-walk-in{0%{transform:translateX(-40px);opacity:0;}' +
      '25%{transform:translateX(-30px) translateY(-2px);opacity:1;}' +
      '50%{transform:translateX(-18px) translateY(0);}' +
      '75%{transform:translateX(-6px) translateY(-2px);}' +
      '100%{transform:translateX(0) translateY(0);opacity:1;}}' +
      '@keyframes chr-walk-out{0%{transform:translateX(0);opacity:1;}' +
      '100%{transform:translateX(-40px);opacity:0;}}' +
      '@keyframes chr-breathe{0%,100%{transform:scaleY(0.99);}50%{transform:scaleY(1.01);}}' +
      '.chr-fig.chr-enter{animation:chr-walk-in 450ms cubic-bezier(.33,1,.68,1) forwards;}' +
      '.chr-fig.chr-exit{animation:chr-walk-out 450ms cubic-bezier(.55,0,1,.45) forwards;}' +
      '.chr-fig.chr-idle{animation:chr-breathe 5.5s ease-in-out infinite;transform-origin:bottom center;}' +
      '.chr-fig.chr-fade{transition:opacity 250ms ease;opacity:0;}' +
      '@media (prefers-reduced-motion: reduce){' +
      '.chr-fig.chr-enter,.chr-fig.chr-exit,.chr-fig.chr-idle{animation:none !important;}}' +
      '@media (max-width:860px){.chr-root{left:auto;right:4vw;bottom:86px;transform:scale(0.7);' +
      'transform-origin:bottom right;}}';
    var style = document.createElement('style');
    style.setAttribute('data-chr', '');
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ---------- mount ---------- */
  function mount(root) {
    var el = document.createElement('div');
    el.className = 'chr-root';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="chr-stage">' +
        '<div class="chr-fig" data-role="fig"></div>' +
        '<div class="chr-label" data-role="label"></div>' +
      '</div>';
    root.appendChild(el);
    return {
      fig: el.querySelector('[data-role="fig"]'),
      label: el.querySelector('[data-role="label"]')
    };
  }

  var reducedMotion = false;
  try {
    reducedMotion = typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* silent */ }

  var currentKey = null;

  function renderSvg(v) {
    var scale = v.scale || 1;
    var opacity = v.opacity != null ? v.opacity : 1;
    return '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" ' +
      'fill="none" style="opacity:' + opacity + '">' +
      (scale !== 1
        ? '<g transform="translate(50,120) scale(' + scale + ') translate(-50,-120)">' + v.svg + '</g>'
        : v.svg) +
      '</svg>';
  }

  function setEra(eraKey) {
    if (eraKey === currentKey) return;
    currentKey = eraKey;
    var nodes = window.__chrNodes;
    if (!nodes || !nodes.fig || !nodes.fig.isConnected) {
      var root = document && document.body;
      if (!root) return;
      nodes = mount(root);
      window.__chrNodes = nodes;
    }
    var v = resolveVariant(eraKey);
    var oldFig = nodes.fig;

    nodes.label.textContent = labelFor(eraKey);

    if (reducedMotion) {
      // static swap
      oldFig.innerHTML = renderSvg(v);
      oldFig.classList.remove('chr-enter', 'chr-exit', 'chr-idle', 'chr-fade');
      return;
    }

    // new figure enters walking from the left
    var newFig = document.createElement('div');
    newFig.className = 'chr-fig';
    newFig.innerHTML = renderSvg(v);
    nodes.fig.parentNode.insertBefore(newFig, oldFig.nextSibling);
    nodes.fig = newFig;

    oldFig.classList.remove('chr-idle', 'chr-enter');
    oldFig.classList.add('chr-exit');
    newFig.classList.add('chr-enter');

    setTimeout(function () {
      oldFig.classList.add('chr-fade');
      if (oldFig.parentNode) oldFig.parentNode.removeChild(oldFig);
      newFig.classList.remove('chr-enter');
      newFig.classList.add('chr-idle');
    }, 450);
  }

  function init() {
    var root = document && document.body;
    if (!root) { window.Character = { setEra: function () {} }; return; }
    injectStyles();
    window.__chrNodes = mount(root);
    setEra('default');
  }

  window.Character = { setEra: setEra };

  if (document && document.body) init();
  else if (document) {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  }
})();
