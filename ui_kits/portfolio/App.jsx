const { useState, useEffect, useCallback } = React;

function App() {
  const stops = window.JOURNEY_STOPS;
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeSection, setActiveSection] = useState("hero");

  const onEnterView = useCallback((idx) => setActiveIdx(idx), []);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView ? window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' }) : null;
  };

  useEffect(() => {
    const sections = ["hero", "journey", "stack", "now"];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { threshold: 0.3 }
    );
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <Nav onJump={jump} active={activeSection} />
      <div className="main">
        <Hero onJourney={() => jump("journey")} />

        <section id="journey" className="section">
          <div className="sec-header">
            <span className="sec-tag">02 · 03 · journey</span>
            <h2 className="sec-title">Every stop, what I did there.</h2>
            <p style={{ marginTop: 14, color: 'var(--text-soft)', maxWidth: 640, fontSize: 16 }}>
              Three chapters. Scroll to walk forward, or tap a dot on the rail to jump. Click any item in the <em>"what I did here"</em> panel to open the details.
            </p>
          </div>
          <div className="journey-shell">
            <JourneyRail stops={stops} activeIdx={activeIdx} />
            <div className="stops">
              {stops.map((s, i) => (
                <Stop key={s.id} stop={s} idx={i} onEnterView={onEnterView} />
              ))}
            </div>
          </div>
        </section>

        <StackMap />
        <Achievements />
        <Education />
        <Now />
        <MailForm />
      </div>
      <footer className="footer">
        Built by Shivam Sharma · 2026 · NCR, India
      </footer>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
