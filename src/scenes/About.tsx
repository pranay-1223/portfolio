import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { registerSection } from '../engine/director';
import { useDirector } from '../engine/hooks';
import TiltCard from '../components/TiltCard';

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const wordsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) registerSection('about', sectionRef.current);
  }, []);

  useDirector('about', (st) => {
    if (!frontRef.current) return;
    const { vis, exit, p } = st;
    const alpha = vis * Math.max(0, 1 - exit * 2.4);
    frontRef.current.style.opacity = String(alpha);

    // Word-by-word reveal
    if (wordsRef.current) {
      const words = wordsRef.current.querySelectorAll<HTMLSpanElement>('.mword');
      const total = words.length;
      words.forEach((w, i) => {
        const wordP = (p * total * 1.4 - i) / 1;
        const t = Math.max(0, Math.min(1, wordP));
        w.style.opacity = String(0.1 + 0.9 * t);
        w.style.transform = `translateY(${(1 - t) * 0.25}em)`;
        w.style.filter = `blur(${(1 - t) * 4}px)`;
      });
    }
  });

  const manifestoWords = DATA.manifesto.split(/(\*[^*]+\*|\s+)/).filter(Boolean);

  return (
    <section
      ref={sectionRef}
      id="section-about"
      className="scene"
      style={{ height: '280vh' }}
    >
      <div className="scene-sticky">
        <div
          ref={frontRef}
          className="about-front"
          style={{
            position: 'absolute',
            left: '50vw',
            right: '5vw',
            top: '15vh',
            bottom: '7vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 3,
            opacity: 0,
          }}
        >
          {/* Label */}
          <span className="section-label font-mono">
            <span style={{ color: 'var(--red)' }}>(01)</span> — About me
          </span>

          {/* Manifesto paragraph */}
          <div
            ref={wordsRef}
            className="manifesto-text font-body"
            style={{
              fontSize: 'clamp(18px, 1.6vw, 28px)',
              lineHeight: 1.45,
              fontWeight: 600,
              letterSpacing: '-0.02em',
            }}
          >
            {manifestoWords.map((word, i) => {
              const isKeyword = word.startsWith('*') && word.endsWith('*');
              const text = isKeyword ? word.slice(1, -1) : word;
              if (word.match(/^\s+$/)) return <span key={i}> </span>;
              return (
                <span
                  key={i}
                  className="mword"
                  style={{
                    display: 'inline-block',
                    color: isKeyword ? 'var(--red)' : 'var(--ink)',
                    opacity: 0.1,
                    marginRight: '0.22em',
                    willChange: 'opacity, transform, filter',
                  }}
                >
                  {text}
                </span>
              );
            })}
          </div>

          {/* Glass stat cards */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {DATA.stats.map((stat, i) => {
              const hasItems = 'items' in stat && Array.isArray(stat.items);
              return (
                <TiltCard
                  key={i}
                  style={{
                    flex: '1 1 180px',
                    padding: '24px 20px',
                    minWidth: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.04em',
                      color: 'var(--mute)',
                      textTransform: 'uppercase',
                      lineHeight: 1.4,
                    }}
                  >
                    {stat.label}
                    {hasItems && (
                      <span style={{ color: 'var(--red)', fontWeight: 700, marginLeft: 6 }}>
                        ({stat.items.length})
                      </span>
                    )}
                  </span>

                  {hasItems ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                      {stat.items.map((item) => (
                        <span
                          key={item}
                          className="font-body"
                          style={{
                            fontSize: 'clamp(12px, 0.95vw, 14px)',
                            fontWeight: 600,
                            color: 'var(--ink)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            lineHeight: 1.25,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: '50%',
                              background: 'var(--red)',
                              flexShrink: 0,
                            }}
                          />
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="font-anton"
                      style={{
                        fontSize: 'clamp(36px, 4vw, 64px)',
                        marginTop: 8,
                        lineHeight: 1,
                        color: 'var(--ink)',
                      }}
                    >
                      {stat.value}
                    </div>
                  )}
                </TiltCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
