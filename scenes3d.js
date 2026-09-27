/* ============ 3D CARD WORLD (Three.js, procedural, no assets) ============
   The 3D scene mirrors the DOM: app.js reports the screen rects of the
   visible .pane cards, and this module hangs an extruded squircle slab
   behind each one, in the era's accent. A small motif per era floats
   in the free space behind. window.Scenes3D.setEra(key),
   window.Scenes3D.alignCards(rects). */
import * as THREE from 'three';
(function () {
  'use strict';
  const BG = 0x12100d;
  const ERA = {
    present:     { c: 0xe8a33d, motif: 'knot' },
    skills:      { c: 0x7aa2c9, motif: 'orbs' },
    ai:          { c: 0xe8a33d, motif: 'hub' },
    earlycareer: { c: 0x97a86b, motif: 'monitor' },
    college:     { c: 0x8398ad, motif: 'spire' },
    school:      { c: 0xd9a76a, motif: 'book' },
    project:     { c: 0xd97a5a, motif: 'panel' },
    future:      { c: 0xe8c35a, motif: 'beacon' },
    ambient:     { c: 0x6f6858, motif: 'none' },
  };

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = matchMedia('(max-width: 860px)').matches;

  let renderer, scene, camera, canvas;
  try {
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;';
    document.body.appendChild(canvas);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.setSize(innerWidth, innerHeight);
    renderer.setClearColor(BG, 1);
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(BG, 9, 30);
    camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 60);
  } catch (e) { try { canvas && canvas.remove(); } catch (_) {} return; }

  scene.add(new THREE.AmbientLight(0xfff2dd, 0.85));
  const key = new THREE.DirectionalLight(0xffe6c0, 1.1); key.position.set(5, 8, 6); scene.add(key);

  // ---------- squircle slab geometry (rounded-rect shape, extruded) ----------
  function rrectShape(w, h, r) {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  const UNIT_SLAB_GEO = new THREE.ExtrudeGeometry(rrectShape(1, 1, 0.16), {
    depth: 0.05, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02,
    bevelSegments: 3, curveSegments: 20,
  });
  UNIT_SLAB_GEO.center();
  const SLAB_EDGE_GEO = new THREE.BufferGeometry().setFromPoints(rrectShape(1, 1, 0.16).getPoints(48));

  function floorGrid() {
    const g = new THREE.Group(), c = 0x2a251d, w = 26, step = 2.2;
    for (let i = -w / 2; i <= w / 2; i += step) {
      const v1 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(i, -3.4, 4), new THREE.Vector3(i, -3.4, -24)]);
      g.add(new THREE.Line(v1, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.45 })));
      const v2 = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-w / 2, -3.4, 4 - (i + w / 2)), new THREE.Vector3(w / 2, -3.4, 4 - (i + w / 2))]);
      g.add(new THREE.Line(v2, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.45 })));
    }
    return g;
  }
  function scatter(n, spread, c, size = 0.05) {
    const arr = [];
    for (let i = 0; i < n; i++) arr.push(new THREE.Vector3((Math.random() - 0.5) * spread, -2.5 + Math.random() * 9, (Math.random() - 0.5) * spread - 5));
    const g = new THREE.BufferGeometry().setFromPoints(arr);
    return new THREE.Points(g, new THREE.PointsMaterial({ color: c, size, transparent: true, opacity: 0.7 }));
  }

  // ---------- small era motifs (one per era, not clutter) ----------
  const L = (c, op = 1) => new THREE.MeshLambertMaterial({ color: c, transparent: op < 1, opacity: op });
  const B = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: op < 1, opacity: op });
  const W = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: op });
  function motif(kind, c) {
    const g = new THREE.Group();
    if (kind === 'knot') {
      const m = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.26, 90, 12), L(0x4a3f2c, 0.95));
      const w = new THREE.Mesh(new THREE.TorusKnotGeometry(0.85, 0.26, 90, 12), W(c, 0.35));
      g.add(m, w); g.userData.tick = (t) => { m.rotation.y = w.rotation.y = t * 0.2; m.rotation.x = w.rotation.x = t * 0.11; };
    } else if (kind === 'orbs') {
      for (let i = 0; i < 4; i++) {
        const o = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 14), W(c, 0.8));
        o.userData.a = (i / 4) * Math.PI * 2; g.add(o);
      }
      g.userData.tick = (t) => g.children.forEach((o, i) => o.position.set(Math.cos(o.userData.a + t * 0.3) * 1.4, Math.sin(o.userData.a + t * 0.3) * 1.4, Math.sin(i) * 0.5));
    } else if (kind === 'hub') {
      const h = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), W(c, 0.9));
      const r = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.03, 8, 48), W(c, 0.5));
      r.rotation.x = 1.1;
      g.add(h, r); g.userData.tick = (t) => { h.rotation.y = t * 0.4; r.rotation.z = t * 0.25; };
    } else if (kind === 'monitor') {
      const f = new THREE.Mesh(new THREE.ExtrudeGeometry(rrectShape(1.9, 1.2, 0.12), { depth: 0.06, bevelEnabled: false, curveSegments: 16 }), L(0x2c2a20, 0.95));
      const s = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.0), B(c, 0.3));
      s.position.z = 0.08; g.add(f, s); g.userData.tick = (t) => { s.material.opacity = 0.22 + 0.1 * Math.sin(t * 1.6); };
    } else if (kind === 'spire') {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.7, 2.6, 6), L(0x33383f, 0.95));
      g.add(m); g.userData.tick = (t) => { m.rotation.y = t * 0.3; };
    } else if (kind === 'book') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 1.2), L(c, 0.9));
      m.rotation.z = 0.12; m.rotation.y = 0.4; g.add(m); g.userData.tick = (t) => { m.rotation.y = 0.4 + Math.sin(t * 0.5) * 0.15; };
    } else if (kind === 'panel') {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.3), W(c, 0.6));
      g.add(m); g.userData.tick = (t) => { m.rotation.y = Math.sin(t * 0.4) * 0.5; };
    } else if (kind === 'beacon') {
      const m = new THREE.Mesh(new THREE.ConeGeometry(1.4, 3.4, 20, 1, true), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.12, side: THREE.DoubleSide }));
      m.rotation.x = Math.PI; g.add(m); g.userData.tick = (t) => { m.material.opacity = 0.09 + 0.05 * Math.sin(t * 1.4); };
    }
    return g;
  }

  // ---------- camera poses ----------
  const POSE = {
    present: { p: [0, 0.6, 8.2], ry: 0, rx: -0.05 },
    ambient: { p: [0, 0, 9], ry: 0, rx: 0 },
  };
  Object.keys(ERA).forEach((k) => { if (!POSE[k]) POSE[k] = POSE.present; });
  const base = { p: new THREE.Vector3(0, 0.6, 8.2), ry: 0, rx: -0.05 };
  const from = { p: new THREE.Vector3(0, 0.6, 8.2), ry: 0, rx: -0.05 };
  let camT = 1, mx = 0, my = 0;
  const pointerFine = matchMedia('(pointer: fine)').matches;
  camera.position.set(0, 0.6, 8.2);

  // ---------- slabs: one per DOM .pane, eased toward card rects ----------
  const PLANE_Z = -3.2;                 // world plane where slabs live
  const MAX_SLABS = 6;
  const slabs = [];
  for (let i = 0; i < MAX_SLABS; i++) {
    const grp = new THREE.Group();
    const body = new THREE.Mesh(UNIT_SLAB_GEO, new THREE.MeshLambertMaterial({ color: 0x241f17, transparent: true, opacity: 0 }));
    const edge = new THREE.Line(SLAB_EDGE_GEO, new THREE.LineBasicMaterial({ color: 0xe8a33d, transparent: true, opacity: 0 }));
    edge.position.z = 0.05;
    grp.add(body, edge);
    grp.visible = false;
    grp.userData = { tx: 0, ty: 0, tw: 1, th: 1, active: false };
    scene.add(grp);
    slabs.push(grp);
  }

  // convert a DOM pixel rect to world coords on PLANE_Z given the CURRENT camera
  const tmpV = new THREE.Vector3();
  function pxToWorld(px, py) {
    tmpV.set((px / innerWidth) * 2 - 1, -(py / innerHeight) * 2 + 1, 0.5).unproject(camera);
    tmpV.sub(camera.position).normalize();
    const t = (PLANE_Z - camera.position.z) / tmpV.z;
    return camera.position.clone().addScaledVector(tmpV, t);
  }

  let motifGroup = null, motifKey = null, ambient = null, activeEra = 'ambient', eraFade = 0, eraColor = new THREE.Color(ERA.ambient.c);
  scene.add(floorGrid());
  ambient = scatter(110, 20, 0x8a7d63, 0.05);
  scene.add(ambient);

  function setEra(key2) {
    try {
      if (!ERA[key2]) key2 = 'present';
      if (activeEra === key2) return;
      activeEra = key2; eraFade = 0;
      const e = ERA[key2];
      eraColor = new THREE.Color(e.c);
      from.p.copy(camera.position); from.ry = camera.userData.ry || 0; from.rx = camera.userData.rx || 0;
      base.p.fromArray(POSE[key2].p); base.ry = POSE[key2].ry; base.rx = POSE[key2].rx;
      camT = 0;
      if (motifGroup) { scene.remove(motifGroup); motifGroup = null; }
      if (e.motif !== 'none' && !ambientOnly) {
        motifGroup = motif(e.motif, e.c);
        motifGroup.position.set(-5.8, 3.9, -10.5);   // free zone, behind/right of content
        motifGroup.scale.setScalar(0.85);
        scene.add(motifGroup); motifKey = key2;
      }
    } catch (e) {}
  }

  let ambientOnly = false;
  try { ambientOnly = mobile || !renderer.capabilities.isWebGL2; } catch (e) { ambientOnly = mobile; }

  // rects: [{x,y,w,h}] in CSS px, from the active scene's .pane elements
  function alignCards(rects) {
    if (ambientOnly) return;
    try {
      const n = Math.min(rects.length, MAX_SLABS);
      for (let i = 0; i < MAX_SLABS; i++) {
        const s = slabs[i], u = s.userData;
        if (i < n) {
          const r = rects[i];
          const c = pxToWorld(r.x + r.w / 2, r.y + r.h / 2);
          const wv = pxToWorld(r.x + r.w, r.y + r.h / 2);
          const hv = pxToWorld(r.x + r.w / 2, r.y + r.h);
          const wDist = Math.max(0.001, c.distanceTo(wv));
          const hDist = Math.max(0.001, c.distanceTo(hv));
          u.tx = c.x; u.ty = c.y;
          u.tw = wDist * 1.03;             // hug the CSS card
          u.th = hDist * 1.03;
          u.active = true;
          s.visible = true;
        } else u.active = false;
      }
    } catch (e) {}
  }

  // ---------- loop ----------
  let last = 0, acc = 0; const STEP = 1 / 30;
  function frame(now) {
    requestAnimationFrame(frame);
    try {
      if (document.hidden) { last = now; return; }
      if (!last) last = now;
      acc += (now - last) / 1000; last = now;
      if (acc < STEP) return; acc %= STEP;
      const t = now / 1000;

      eraFade = Math.min(1, eraFade + 0.04);
      slabs.forEach((s, i) => {
        const u = s.userData;
        const targetOp = u.active ? eraFade : Math.max(0, (u.op || 0) - 0.06);
        u.op = u.active ? targetOp : targetOp;
        const bodyOp = u.op * 0.10, edgeOp = u.op * 0.30;
        s.children[0].material.opacity = bodyOp;
        s.children[0].material.color.lerpColors(new THREE.Color(0x241f17), eraColor, 0.12);
        s.children[1].material.opacity = edgeOp;
        s.children[1].material.color.copy(eraColor);
        s.position.x += (u.tx - s.position.x) * 0.12;
        s.position.y += (u.ty - s.position.y) * 0.12 + Math.sin(t * 0.6 + i * 1.7) * 0.0012;
        s.position.z = PLANE_Z;
        s.scale.x += (u.tw - s.scale.x) * 0.12;
        s.scale.y += (u.th - s.scale.y) * 0.12;
        if (u.op <= 0.01 && !u.active) s.visible = false;
        s.quaternion.copy(camera.quaternion);   // billboard: slab always backs the CSS card
      });

      if (motifGroup) { try { motifGroup.userData.tick && motifGroup.userData.tick(t); } catch (e) {} }
      ambient.rotation.y = t * 0.02;

      if (camT < 1) {
        camT = Math.min(1, camT + 0.03);
        const e = 1 - Math.pow(1 - camT, 3);
        camera.position.lerpVectors(from.p, base.p, e);
        camera.userData.ry = from.ry + (base.ry - from.ry) * e;
        camera.userData.rx = from.rx + (base.rx - from.rx) * e;
      }
      camera.rotation.order = 'YXZ';
      camera.rotation.y = (camera.userData.ry || 0) + (pointerFine ? mx * 0.06 : 0);
      camera.rotation.x = (camera.userData.rx || 0) + (pointerFine ? -my * 0.04 : 0);

      renderer.render(scene, camera);
    } catch (e) {}
  }

  addEventListener('resize', () => {
    try { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); } catch (e) {}
  });
  if (pointerFine) addEventListener('pointermove', (ev) => {
    mx = (ev.clientX / innerWidth - 0.5) * 2; my = (ev.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  window.Scenes3D = { setEra, alignCards };
  if (reduced) { try { canvas.remove(); } catch (e) {} return; }
  setEra('present');
  requestAnimationFrame(frame);
})();
