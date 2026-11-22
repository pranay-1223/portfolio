import React, { useRef, useEffect } from 'react';
import { DATA, type ProjectData } from '../data';
import { registerSection } from '../engine/director';
import { useDirector } from '../engine/hooks';

/* ─── Project visual mocks ─── */
function GaugeMock() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg viewBox="0 0 120 80" style={{ width: '70%' }}>
        <path d="M20,70 A40,40 0 0,1 100,70" fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="8" strokeLinecap="round" />
        <path d="M20,70 A40,40 0 0,1 80,30" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" className="gauge-anim" />
        <text x="60" y="65" textAnchor="middle" fill="#fff" fontSize="16" fontFamily="Anton">98%</text>
      </svg>
    </div>
  );
}

function HeatmapMock() {
  const opacities = [0.2, 0.5, 0.8, 0.3, 0.9, 0.6, 0.4, 0.7, 0.2, 0.85, 0.4, 0.9, 0.3, 0.6, 0.5, 0.75, 0.3, 0.95, 0.4, 0.6, 0.8, 0.3, 0.7, 0.5, 0.85, 0.4, 0.65, 0.9];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, padding: 24, width: '80%', aspectRatio: '7/4' }}>
      {opacities.map((op, i) => (
        <div key={i} style={{ background: `rgba(255,255,255,${op})`, borderRadius: 4, aspectRatio: '1' }} />
      ))}
    </div>
  );
}

function ChatMock() {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12, width: '80%', height: '80%', justifyContent: 'center' }}>
      <div style={{ background: 'rgba(255,255,255,.22)', borderRadius: '16px 16px 16px 4px', padding: '10px 16px', maxWidth: '75%', fontSize: 13, color: '#fff', fontFamily: 'JetBrains Mono' }}>
        Run python pipeline
      </div>
      <div style={{ background: '#ffffff', borderRadius: '16px 16px 4px 16px', padding: '10px 16px', maxWidth: '80%', alignSelf: 'flex-end', fontSize: 13, color: 'var(--red)', fontWeight: 600 }}>
        ✓ 10,000 records processed
      </div>
    </div>
  );
}

const visuals: Record<string, () => React.ReactNode> = {
  gauge: GaugeMock,
  heatmap: HeatmapMock,
  chat: ChatMock,
};

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) registerSection('work', sectionRef.current);
  }, []);

  useDirector('work', (st) => {
    if (!frontRef.current || !deckRef.current) return;
    const { vis, exit, enter, p } = st;
    const alpha = vis * Math.max(0, 1 - exit * 2.4);
    frontRef.current.style.opacity = String(alpha);

    const n = DATA.projects.length; // 3
    // Scroll mapping has a dwell on each card:
    // q = i + easeInOut(frac), d = q - i
    const totalProg = p * (n - 0.2);
    const activeI = Math.min(Math.floor(totalProg), n - 1);
    const frac = totalProg - activeI;
    const q = activeI + easeInOut(Math.min(frac, 1));

    if (counterRef.current) {
      counterRef.current.textContent = `${String(activeI + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
    }
    if (barRef.current) {
      barRef.current.style.width = `${((activeI + 1) / n) * 100}%`;
    }

    const cards = deckRef.current.querySelectorAll<HTMLDivElement>('.work-card');
    cards.forEach((card, i) => {
      const d = q - i;
      if (d < 0) {
        // Upcoming cards: z = d * 300, y = d * 3.2vh, fading
        card.style.transform = `translate3d(0, ${d * 3.2}vh, ${d * 300}px)`;
        card.style.opacity = String(Math.max(0, 1 + d * 0.8));
        card.style.zIndex = String(n - i);
      } else if (d > 0.8) {
        // Leaving cards: z = d * 900, y = -12d vh, rotateX = 28d, opacity = 1 - 1.8d
        const ld = d - 0.8;
        card.style.transform = `translate3d(0, ${-12 * ld}vh, ${ld * 900}px) rotateX(${28 * ld}deg)`;
        card.style.opacity = String(Math.max(0, 1 - 1.8 * ld));
        card.style.zIndex = String(n + i);
      } else {
        // Active card dwell
        card.style.transform = 'translate3d(0, 0, 0) rotateX(0deg)';
        card.style.opacity = '1';
        card.style.zIndex = String(n + 10);
      }
    });

    // Entry: deck comes up from below with rotateY -25deg
    if (enter < 0.6) {
      const entryT = (1 - enter / 0.6);
      deckRef.current.style.transform = `translateY(${entryT * 35}vh) rotateY(${-25 * entryT}deg)`;
    } else {
      deckRef.current.style.transform = 'none';
    }
  });

  return (
    <section
      ref={sectionRef}
      id="section-work"
      className="scene"
      style={{ height: '460vh' }}
    >
      <div className="scene-sticky">
        <div ref={frontRef} style={{ position: 'absolute', inset: 0, zIndex: 3, opacity: 0 }}>
          {/* Header */}
          <div style={{ position: 'absolute', left: '5vw', top: '12vh', display: 'flex', alignItems: 'center', gap: 24 }}>
            <span className="section-label font-mono">
              <span style={{ color: 'var(--red)' }}>(02)</span> — Work
            </span>
            <span
              ref={counterRef}
              className="font-anton"
              style={{ fontSize: 'clamp(24px, 2.5vw, 42px)', color: 'var(--ink)' }}
            >
              01 / 03
            </span>
            <div style={{ width: 140, height: 3, background: 'var(--line)', borderRadius: 2, overflow: 'hidden' }}>
              <div
                ref={barRef}
                style={{ height: '100%', background: 'var(--red)', borderRadius: 2, transition: 'width 0.3s' }}
              />
            </div>
          </div>

          {/* 3D Deck */}
          <div
            ref={deckRef}
            className="work-deck"
            style={{
              position: 'absolute',
              left: '5vw',
              top: '23vh',
              width: 'min(56vw, 940px)',
              height: '55vh',
              perspective: '1500px',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s cubic-bezier(.23,1,.32,1)',
            }}
          >
            {DATA.projects.map((proj, i) => (
              <ProjectCard key={proj.id} project={proj} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: ProjectData; index: number }) {
  const Visual = visuals[project.visual] || GaugeMock;
  return (
    <div
      className="work-card"
      style={{
        position: 'absolute',
        inset: 0,
        background: '#ffffff',
        borderRadius: 30,
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.85fr',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(13,13,13,0.08), 0 2px 8px rgba(13,13,13,0.04)',
        transition: 'transform 0.4s cubic-bezier(.23,1,.32,1), opacity 0.3s',
        willChange: 'transform, opacity',
      }}
    >
      {/* Left Column */}
      <div
        style={{
          padding: 'clamp(24px, 3.2vw, 44px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
          <span className="font-anton" style={{ fontSize: 'clamp(44px, 4.8vw, 76px)', color: 'rgba(13,13,13,0.12)', lineHeight: 1 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.04em' }}>
            {project.category}
          </span>
        </div>

        <h3 className="font-anton" style={{ fontSize: 'clamp(32px, 3.5vw, 64px)', lineHeight: 0.95, color: 'var(--ink)', margin: 0 }}>
          {project.name}
        </h3>

        <p className="font-body" style={{ fontSize: 'clamp(14px, 1.1vw, 17px)', color: 'var(--mute)', margin: 0, lineHeight: 1.5 }}>
          {project.description}
        </p>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
          {project.chips.map((chip) => (
            <span
              key={chip}
              className="font-mono"
              style={{
                fontSize: 10,
                padding: '6px 14px',
                border: '1px solid var(--line)',
                borderRadius: 999,
                color: 'var(--ink)',
                background: 'rgba(13,13,13,0.02)',
              }}
            >
              {chip}
            </span>
          ))}
        </div>

        <a
          href={project.github}
          target="_blank"
          rel="noopener"
          className="font-mono"
          data-cursor="Open"
          style={{
            fontSize: 12,
            color: 'var(--red)',
            textDecoration: 'none',
            letterSpacing: '0.04em',
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 600,
          }}
        >
          View on GitHub ↗
        </a>
      </div>

      {/* Right Column: Visual Mock */}
      <div
        className="work-visual"
        style={{
          background: 'var(--red)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0 30px 30px 0',
        }}
      >
        <Visual />
      </div>
    </div>
  );
}
