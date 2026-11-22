import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { registerSection } from '../engine/director';
import { useDirector } from '../engine/hooks';

export default function Awards() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const cylinderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) registerSection('awards', sectionRef.current);
  }, []);

  useDirector('awards', (st) => {
    if (!frontRef.current || !cylinderRef.current) return;
    const { vis, exit, enter, p } = st;
    const alpha = vis * Math.max(0, 1 - exit * 2.4);
    frontRef.current.style.opacity = String(alpha);

    // Counter cards flip in using rotateX -100 -> 0, staggered
    const counterCards = frontRef.current.querySelectorAll<HTMLDivElement>('.award-counter-card');
    counterCards.forEach((card, i) => {
      const cardEnter = Math.max(0, Math.min(1, (enter * 1.8 - i * 0.12) / 0.5));
      const rotX = (1 - cardEnter) * -100;
      card.style.transform = `rotateX(${rotX}deg)`;
      card.style.opacity = String(cardEnter);
    });

    // Certifications cylinder rotation:
    // translateZ(-360px) rotateX(-14deg) rotateY(-p * (360 - 360/N))
    const N = DATA.certifications.length;
    const rotY = -p * (360 - 360 / N);
    cylinderRef.current.style.transform = `translateZ(-360px) rotateX(-14deg) rotateY(${rotY}deg)`;
  });

  const N = DATA.certifications.length;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

  return (
    <section
      ref={sectionRef}
      id="section-awards"
      className="scene"
      style={{ height: '320vh' }}
    >
      <div className="scene-sticky">
        <div
          ref={frontRef}
          style={{
            position: 'absolute',
            left: isMobile ? '6vw' : '5vw',
            right: isMobile ? '6vw' : '5vw',
            top: '10vh',
            bottom: '6vh',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            opacity: 0,
          }}
        >
          {/* Header */}
          <div>
            <span className="section-label font-mono">
              <span style={{ color: 'var(--red)' }}>(05)</span> — Awards & Recognitions
            </span>
          </div>

          {/* Left Column / Row: Four flip-in counter cards */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              perspective: 1000,
            }}
          >
            {DATA.counters.map((c, i) => {
              const isRed = c.color === 'red';
              return (
                <div
                  key={i}
                  className="award-counter-card"
                  style={{
                    flex: isMobile ? '1 1 42%' : '1 1 25%',
                    background: isRed ? 'var(--red)' : 'var(--ink)',
                    color: '#ffffff',
                    borderRadius: 22,
                    padding: '24px 20px',
                    textAlign: 'center',
                    transformOrigin: 'bottom center',
                    boxShadow: isRed ? '0 12px 32px rgba(255,31,31,0.25)' : '0 12px 32px rgba(13,13,13,0.15)',
                    willChange: 'transform, opacity',
                  }}
                >
                  <span
                    className="font-anton"
                    style={{ fontSize: 'clamp(36px, 4.2vw, 64px)', lineHeight: 1, display: 'block' }}
                  >
                    {c.value}
                    {c.suffix ? (
                      <span style={{ fontSize: '0.8em', color: isRed ? '#ffffff' : 'var(--red)', marginLeft: 2 }}>
                        {c.suffix}
                      </span>
                    ) : null}
                  </span>
                  <span
                    className="font-mono"
                    style={{
                      display: 'block',
                      fontSize: 11,
                      letterSpacing: '0.06em',
                      marginTop: 8,
                      opacity: 0.8,
                      textTransform: 'uppercase',
                    }}
                  >
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Certifications Cylinder Ring */}
          <div
            style={{
              height: '42vh',
              perspective: 1600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isMobile ? 'scale(0.7)' : 'none',
              transformOrigin: 'center center',
            }}
          >
            <div
              ref={cylinderRef}
              style={{
                position: 'relative',
                width: 290,
                height: 178,
                transformStyle: 'preserve-3d',
                transform: 'translateZ(-360px) rotateX(-14deg) rotateY(0deg)',
                willChange: 'transform',
              }}
            >
              {DATA.certifications.map((cert, i) => {
                const rotY = (360 / N) * i;
                const isThird = i % 3 === 0;

                return (
                  <div
                    key={`card-${i}`}
                    style={{
                      position: 'absolute',
                      width: 290,
                      height: 178,
                      transformStyle: 'preserve-3d',
                      transform: `rotateY(${rotY}deg) translateZ(360px)`,
                    }}
                  >
                    {/* Front Face: white, every third card red, title, issuer, ✓ seal */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        borderRadius: 20,
                        background: isThird ? 'var(--red)' : '#ffffff',
                        color: isThird ? '#ffffff' : 'var(--ink)',
                        boxShadow: '0 16px 40px rgba(13,13,13,0.08), 0 2px 6px rgba(13,13,13,0.04)',
                        border: isThird ? 'none' : '1px solid var(--line)',
                        padding: '24px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: 10,
                            letterSpacing: '0.04em',
                            opacity: 0.7,
                            textTransform: 'uppercase',
                          }}
                        >
                          {cert.issuer}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            background: isThird ? 'rgba(255,255,255,0.2)' : 'rgba(255,31,31,0.1)',
                            color: isThird ? '#ffffff' : 'var(--red)',
                            fontSize: 14,
                            fontWeight: 'bold',
                          }}
                        >
                          ✓
                        </span>
                      </div>

                      <h4
                        className="font-anton"
                        style={{
                          fontSize: 'clamp(18px, 1.8vw, 22px)',
                          lineHeight: 1.15,
                          margin: '8px 0',
                          textAlign: 'left',
                        }}
                      >
                        {cert.title}
                      </h4>

                      <span
                        className="font-mono"
                        style={{
                          fontSize: 10,
                          letterSpacing: '0.05em',
                          opacity: isThird ? 0.8 : 0.5,
                        }}
                      >
                        CREDENTIAL #{String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Back Face: light red gradient, rotateY 180, backface hidden */}
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        borderRadius: 20,
                        transform: 'rotateY(180deg)',
                        background: 'linear-gradient(135deg, rgba(255,31,31,0.25), rgba(255,31,31,0.08))',
                        border: '1px solid rgba(255,31,31,0.2)',
                        boxShadow: 'inset 0 0 20px rgba(255,31,31,0.1)',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
