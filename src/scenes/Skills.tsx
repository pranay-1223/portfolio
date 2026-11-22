import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { registerSection } from '../engine/director';
import { useDirector } from '../engine/hooks';

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const marqueeTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) registerSection('skills', sectionRef.current);
  }, []);

  useDirector('skills', (st) => {
    if (!frontRef.current) return;
    const { vis, exit, p } = st;
    const alpha = vis * Math.max(0, 1 - exit * 2.4);
    frontRef.current.style.opacity = String(alpha);

    // Marquee moves with scroll
    if (marqueeTrackRef.current) {
      marqueeTrackRef.current.style.transform = `translateX(${-p * 800}px)`;
    }
  });

  const repeatedSkills = Array(6).fill(DATA.skills.join(' ✦ ')).join(' ✦ ');

  return (
    <section
      ref={sectionRef}
      id="section-skills"
      className="scene"
      style={{ height: '280vh' }}
    >
      <div className="scene-sticky">
        <div ref={frontRef} style={{ position: 'absolute', inset: 0, zIndex: 3, opacity: 0 }}>
          {/* Title at top-left */}
          <div style={{ position: 'absolute', left: '5vw', top: '12vh' }}>
            <span className="section-label font-mono">
              <span style={{ color: 'var(--red)' }}>(04)</span> — Toolkit
            </span>
            <h2 style={{ margin: '14px 0 0' }}>
              <span
                className="font-anton"
                style={{ display: 'block', fontSize: 'clamp(36px, 4.2vw, 76px)', lineHeight: 0.92, color: 'var(--ink)' }}
              >
                EVERYTHING
              </span>
              <span
                className="font-anton"
                style={{ display: 'block', fontSize: 'clamp(36px, 4.2vw, 76px)', lineHeight: 0.92, color: 'var(--red)' }}
              >
                IN ORBIT.
              </span>
            </h2>
          </div>

          {/* Red Marquee Tape at bottom: 10vh high, rotated -2deg */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: '-10%',
              right: '-10%',
              height: '10vh',
              background: 'var(--red)',
              transform: 'rotate(-2deg)',
              transformOrigin: 'center center',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              boxShadow: '0 -4px 30px rgba(255,31,31,0.25)',
            }}
          >
            <div
              ref={marqueeTrackRef}
              className="font-anton"
              style={{
                display: 'inline-flex',
                whiteSpace: 'nowrap',
                fontSize: 'clamp(26px, 3.2vw, 52px)',
                color: '#ffffff',
                letterSpacing: '0.03em',
                willChange: 'transform',
              }}
            >
              {repeatedSkills} ✦{' '}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
