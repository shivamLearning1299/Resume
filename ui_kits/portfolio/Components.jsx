const { useState, useEffect, useRef } = React;

// ============ Nav ============
function Nav({ onJump, active }) {
  const links = [
    { id: "hero", label: "start" },
    { id: "journey", label: "journey" },
    { id: "stack", label: "stack" },
    { id: "now", label: "now" }
  ];
  return (
    <nav className="nav">
      <span className="nav-logo" onClick={() => onJump("hero")}>Shyvam.</span>
      <ul className="nav-links">
        {links.map(l => (
          <li key={l.id}>
            <button className={active === l.id ? "active" : ""} onClick={() => onJump(l.id)}>{l.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ============ Avatar ============
function Avatar({ interactive = true }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!interactive || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const x = (e.clientX - cx) / (r.width / 2);
    const y = (e.clientY - cy) / (r.height / 2);
    setTilt({ x: x * 8, y: -y * 8 });
  };
  const handleLeave = () => setTilt({ x: 0, y: 0 });
  return (
    <div className="avatar-wrap" ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div className="avatar-ring avatar-ring-2"></div>
      <div className="avatar-ring"></div>
      <div className="avatar-glow"></div>
      <div className="avatar-img" style={{ transform: `perspective(800px) rotateY(0deg) rotateX(0deg)` }}>
        <img src={window.AVATAR_SRC} alt="Shivam Sharma" style={{ objectFit: 'cover', width: '214px' }} />
      </div>
      <div className="avatar-badge">🇮🇳 NCR</div>
    </div>
  );
}

// ============ Hero ============
function Hero({ onJourney }) {
  return (
    <section id="hero" className="section hero">
      <div className="hero-inner">
        <div>
          <div className="hero-badge">Available for new opportunities</div>
          <h1 className="hero-name">Shivam<br/><span className="hl">Sharma.</span></h1>
          <p className="hero-sub">Software Developer · Backend Engineer · AI Systems</p>
          <p className="hero-desc">
            Software Developer with 4+ years building scalable backend systems.
            Specializing in Node.js, PHP &amp; Python — with hands-on experience building
            AI agents, payment integrations, and high-throughput data pipelines.
          </p>
          <div className="hero-ctas">
            <a href="mailto:shivam12061999@gmail.com" className="btn btn-primary">Get in touch</a>
            <button className="btn btn-secondary" onClick={onJourney}>Walk the journey ↓</button>
          </div>
        </div>
        <Avatar />
      </div>
    </section>
  );
}

// ============ Journey Rail ============
function JourneyRail({ stops, activeIdx }) {
  // progress height: between dots
  const pct = stops.length > 1 ? (activeIdx / (stops.length - 1)) * 100 : 0;
  return (
    <div className="journey-rail">
      <div className="rail-line"></div>
      <div className="rail-progress" style={{ height: `calc((100% - 40px) * ${pct / 100})` }}></div>
      <div className="rail-dots">
        {stops.map((s, i) => (
          <a
            href={"#" + s.id}
            key={s.id}
            className={`rail-dot ${i < activeIdx ? 'visited' : ''} ${i === activeIdx ? 'active' : ''}`}
            title={s.title}
          >
            <span className="rail-dot-label">{s.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ============ Stop (one journey chapter) ============
function Stop({ stop, idx, onEnterView }) {
  const [openIdx, setOpenIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            onEnterView(idx);
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [idx, onEnterView]);
  return (
    <section id={stop.id} className={`stop ${inView ? 'in-view' : ''}`} ref={ref}>
      <div className="stop-chapter">
        <span className="chapter-num">{stop.chapter}</span>
        <span className="chapter-rule"></span>
        <span className="chapter-num" style={{ color: 'var(--muted)' }}>{stop.period}</span>
      </div>
      <h2 className="stop-title">
        {stop.title}<span className="accent">{stop.titleAccent}</span>
      </h2>
      <div className="stop-role">{stop.role}</div>
      <div className="stop-grid">
        <div>
          <div className="stop-narrative">
            {stop.narrative.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <div className="stop-stack">
            {stop.stack.map((t) => <span key={t} className="stack-tag">{t}</span>)}
          </div>
        </div>
        <aside className="did-panel">
          <div className="did-head">
            <span className="did-tick"></span>
            <span className="did-title">// what I did here</span>
          </div>
          <ul className="did-list">
            {stop.did.map((d, i) => (
              <li
                key={i}
                className={`did-item ${openIdx === i ? 'open' : ''}`}
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
              >
                <div className="did-item-top">
                  <span className="did-item-arrow">▸</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: 'var(--text)', fontWeight: 500 }}>{d.h}</strong>
                  </div>
                </div>
                <div className="did-item-detail">{d.d}</div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

// ============ Stack Map (interactive tech grid) ============
function StackMap() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const groups = [
    { id: "all", label: "all" },
    { id: "lang", label: "languages" },
    { id: "framework", label: "frameworks" },
    { id: "db", label: "databases" },
    { id: "cloud", label: "cloud & infra" },
    { id: "integration", label: "integrations" },
    { id: "ai", label: "ai" },
    { id: "ops", label: "ops" }
  ];
  const items = window.TECH_STACK.filter(t => filter === "all" || t.group === filter);
  return (
    <section id="stack" className="section">
      <div className="sec-header">
        <span className="sec-tag">04. stack</span>
        <h2 className="sec-title">Tools of the trade.</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setFilter(g.id)}
            className="stack-tag"
            style={{
              cursor: 'pointer',
              borderColor: filter === g.id ? 'var(--accent)' : undefined,
              color: filter === g.id ? 'var(--accent)' : undefined,
              background: filter === g.id ? 'rgba(79,142,247,0.08)' : undefined
            }}
          >
            // {g.label}
          </button>
        ))}
      </div>
      <div className="stack-map">
        {items.map(t => (
          <div
            key={t.n}
            className={`stack-cell ${selected === t.n ? 'selected' : ''}`}
            onClick={() => setSelected(selected === t.n ? null : t.n)}
          >
            <span className="emoji">{t.e}</span>
            <span className="n">{t.n}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============ Achievements ============
function Achievements() {
  return (
    <section id="wins" className="section">
      <div className="sec-header">
        <span className="sec-tag">05. recognition</span>
        <h2 className="sec-title">Wins worth naming.</h2>
      </div>
      <div className="ach-grid">
        <div className="ach-card">
          <div className="ach-icon">🏆</div>
          <div className="ach-body">
            <div className="ach-title">GEM Award — Going Extra Mile</div>
            <div className="ach-desc">Awarded twice (2023 &amp; 2024) at Acefone Software for exceptional engineering contributions and going beyond expectations.</div>
          </div>
        </div>
        <div className="ach-card">
          <div className="ach-icon">🎓</div>
          <div className="ach-body">
            <div className="ach-title">B.Tech CSE — JIIT Noida</div>
            <div className="ach-desc">Computer Science &amp; Engineering, July 2018 – May 2022. GPA 7.3.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============ Education ============
function Education() {
  const schools = [
    { icon: "🏫", name: "Aster Public School", level: "Class XII", detail: "2016–2017 · 95%", color: "var(--accent)" },
    { icon: "🏫", name: "Aster Public School", level: "Class X", detail: "CGPA 10 / 10", color: "var(--accent3)" },
    { icon: "🎓", name: "JIIT Noida", level: "B.Tech — CSE", detail: "Jul 2018 – May 2022 · GPA 7.3", color: "var(--accent2)" }
  ];
  return (
    <section id="education" className="section">
      <div className="sec-header">
        <span className="sec-tag">06. education</span>
        <h2 className="sec-title">Where it started.</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 640 }}>
        {schools.map((s, i) => (
          <div key={i} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
            padding: '22px 28px', display: 'flex', alignItems: 'center', gap: 20,
            transition: 'border-color 0.2s', cursor: 'default'
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = s.color}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <span style={{ fontSize: 28 }}>{s.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>{s.name}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s.color, marginTop: 3 }}>{s.level}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textAlign: 'right', lineHeight: 1.6 }}>{s.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============ Mail Form ============
function MailForm() {
  const [msg, setMsg] = useState('');
  const [name, setName] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!msg.trim()) return;
    setSending(true);
    // Compose mailto link and open it
    const subject = encodeURIComponent(`Portfolio message${name ? ' from ' + name : ''}`);
    const body = encodeURIComponent(`${name ? 'From: ' + name + '\n\n' : ''}${msg}`);
    window.open(`mailto:shivam12061999@gmail.com?subject=${subject}&body=${body}`, '_blank');
    setTimeout(() => { setSending(false); setSent(true); }, 600);
  };

  const inputStyle = {
    width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
    borderRadius: 10, padding: '12px 16px', color: 'var(--text)',
    fontFamily: 'var(--font-body)', fontSize: 14, outline: 'none',
    transition: 'border-color 0.2s', resize: 'none'
  };

  return (
    <section id="mail" className="section">
      <div className="sec-header">
        <span className="sec-tag">08. say something</span>
        <h2 className="sec-title">Drop me a note.</h2>
      </div>
      <div style={{ maxWidth: 560 }}>
        <p style={{ marginBottom: 28, color: 'var(--text-soft)', fontSize: 15 }}>
          Liked what you saw? Have a role in mind? Or just want to say hi — I read every message.
        </p>
        {sent ? (
          <div style={{
            background: 'rgba(6,214,160,0.08)', border: '1px solid rgba(6,214,160,0.35)',
            borderRadius: 16, padding: '32px 28px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
              Your mail app is <span style={{ background: 'var(--grad-success)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ready to send.</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>Hit send in your mail client — I'll reply soon.</div>
            <button className="btn btn-secondary" style={{ marginTop: 20, cursor: 'pointer' }} onClick={() => { setSent(false); setMsg(''); setName(''); }}>Write another</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              placeholder="Your name (optional)"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
            <textarea
              placeholder="What's on your mind?"
              rows={5}
              value={msg}
              onChange={e => setMsg(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(79,142,247,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
            <button
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start', opacity: msg.trim() ? 1 : 0.5, cursor: msg.trim() ? 'pointer' : 'default' }}
              onClick={handleSend}
              disabled={sending || !msg.trim()}
            >
              {sending ? 'Opening mail…' : 'Send message ✉️'}
            </button>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
              // opens your mail client · sends to shivam12061999@gmail.com
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Avatar, Hero, JourneyRail, Stop, StackMap, Achievements, Education, MailForm, Now });

// ============ Now (contact) ============
function Now() {
  const [hovered, setHovered] = useState(-1);
  return (
    <section id="now" className="section">
      <div className="sec-header">
        <span className="sec-tag">06. now</span>
        <h2 className="sec-title">Let's connect.</h2>
      </div>
      <div className="now-grid">
        <div>
          <p className="now-intro">
            I'm actively exploring new opportunities — backend, full-stack, or AI / systems engineering roles.
            If you think there's a fit, feel free to reach out. I respond to every message.
          </p>
          <div className="contact-links">
            {window.CONTACTS.map((c, i) => (
              <a
                key={i}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="contact-link"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(-1)}
              >
                <span className="ic">{c.ic}</span>
                <div>
                  <div>{c.text}</div>
                  <div className="lbl">{c.lbl}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 28 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 14 }}>// availability</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, lineHeight: 1.15, marginBottom: 12 }}>
              Open to <span className="highlight" style={{ background: 'var(--grad-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>new</span> roles.
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.7 }}>
              Remote, Gurgaon, or anywhere along the NCR belt. Prefer companies with interesting systems problems and reasonable people.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
              {['Backend', 'AI/Systems', 'Full-stack', 'Remote'].map(t => (
                <span key={t} className="stack-tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { Nav, Avatar, Hero, JourneyRail, Stop, StackMap, Achievements, Now });
