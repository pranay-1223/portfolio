import { useRef, useEffect, useState } from 'react';
import { SCENES, scrollTo, getState } from '../engine/director';
import { DATA } from '../data';
import gsap from 'gsap';

/* ─── HUD Chrome ─── */
export default function Chrome() {
  const navRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const [isMobile] = useState(() => window.innerWidth < 820);

  useEffect(() => {
    const tick = () => {
      const y = window.scrollY;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.round((y / docH) * 100) : 0;

      if (progressRef.current) {
        progressRef.current.textContent = `${String(pct).padStart(3, '0')}%`;
      }
      if (railRef.current) {
        railRef.current.style.height = `${pct}%`;
      }

      // Active nav item
      if (navRef.current) {
        const items = navRef.current.querySelectorAll<HTMLButtonElement>('.nav-item');
        let activeIdx = 0;
        for (let i = 0; i < SCENES.length; i++) {
          const st = getState(SCENES[i].id);
          if (st && st.enter > 0.3) activeIdx = i;
        }
        items.forEach((btn, i) => {
          btn.classList.toggle('active', i === activeIdx);
        });
      }

      // Contact white mode
      const contactState = getState('contact');
      if (hudRef.current && contactState) {
        const isWhite = contactState.bladeT > 0.6;
        hudRef.current.classList.toggle('hud-white', isWhite);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div ref={hudRef} className="hud" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, pointerEvents: 'none' }}>
      {/* Logo */}
      <div className="hud-logo" style={{ position: 'absolute', top: '2.4vh', left: '3vw', pointerEvents: 'auto' }}>
        <span className="font-anton" style={{ fontSize: 28, letterSpacing: '0.02em', color: 'var(--ink)' }}>
          {DATA.firstName}
        </span>
        <span style={{ color: 'var(--red)', fontSize: 14, verticalAlign: 'super', marginLeft: 2 }}>®</span>
      </div>

      {/* Nav pills */}
      {!isMobile && (
        <nav
          ref={navRef}
          className="hud-nav"
          style={{
            position: 'absolute',
            top: '2.4vh',
            right: '3vw',
            display: 'flex',
            gap: 2,
            background: 'rgba(255,255,255,0.62)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: 999,
            padding: '4px 4px',
            pointerEvents: 'auto',
          }}
        >
          {SCENES.map((sc) => (
            <button
              key={sc.id}
              className="nav-item font-mono"
              onClick={() => scrollTo(`#section-${sc.id}`)}
              style={{
                border: 'none',
                background: 'transparent',
                borderRadius: 999,
                padding: '8px 14px',
                fontSize: 11,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                color: 'var(--ink)',
                transition: 'background .3s, color .3s',
              }}
            >
              {sc.label}
            </button>
          ))}
        </nav>
      )}

      {/* Progress */}
      <div
        style={{
          position: 'fixed',
          bottom: '3vh',
          right: '3vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 8,
          pointerEvents: 'none',
        }}
      >
        <span ref={progressRef} className="hud-progress-text font-mono" style={{ fontSize: 11, letterSpacing: '0.04em', color: 'var(--mute)' }}>
          000%
        </span>
        <div className="hud-progress-rail" style={{ width: 2, height: 60, background: 'var(--line)', borderRadius: 1, overflow: 'hidden', position: 'relative' }}>
          <div
            ref={railRef}
            className="hud-progress-line"
            style={{ position: 'absolute', bottom: 0, width: '100%', background: 'var(--red)', borderRadius: 1, transition: 'height 0.1s' }}
          />
        </div>
      </div>
    </div>
  );
}
