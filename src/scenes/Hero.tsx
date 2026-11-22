import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { registerSection, scrollTo } from '../engine/director';
import { useDirector, useMagnetic } from '../engine/hooks';

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const introPlayed = useRef(false);

  const magBtn1 = useMagnetic<HTMLAnchorElement>(0.35);
  const magBtn2 = useMagnetic<HTMLAnchorElement>(0.35);

  useEffect(() => {
    if (sectionRef.current) registerSection('hero', sectionRef.current);

    const onIntro = () => {
      if (introPlayed.current) return;
      introPlayed.current = true;
      const lines = frontRef.current?.querySelectorAll<HTMLElement>('.hero-line');
      lines?.forEach((el, i) => {
        el.style.transition = `transform 1.2s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.12}s, opacity 1.2s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.12}s`;
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      });
    };
    window.addEventListener('intro', onIntro);
    return () => window.removeEventListener('intro', onIntro);
  }, []);

  useDirector('hero', (st) => {
    if (!frontRef.current) return;
    const { vis, exit, p } = st;
    frontRef.current.style.opacity = String(vis * Math.max(0, 1 - exit * 2.4));
    if (underlineRef.current) {
      underlineRef.current.style.width = `${Math.min(p * 1.5, 1) * 100}%`;
    }
  });

  return (
    <section
      ref={sectionRef}
      id="section-hero"
      className="scene"
      style={{ height: '230vh' }}
    >
      <div className="scene-sticky">
        <div
          ref={frontRef}
          className="hero-front"
          style={{
            position: 'absolute',
            left: '5vw',
            top: '26vh',
            width: 'min(47vw, 780px)',
            zIndex: 3,
          }}
        >
          <p className="hero-line font-body" style={{ color: 'var(--mute)', marginBottom: 8, opacity: 0, transform: 'translateY(40px)', fontSize: 'clamp(14px, 1.2vw, 18px)' }}>
            {DATA.greetingGrey}{' '}
            <span style={{ color: 'var(--ink)' }}>{DATA.greetingInk}</span>
          </p>

          <h1 style={{ margin: 0, lineHeight: 0.88 }}>
            <span
              className="hero-line font-anton"
              style={{
                display: 'block',
                fontSize: 'clamp(56px, 7.6vw, 156px)',
                color: 'var(--ink)',
                opacity: 0,
                transform: 'translateY(60px)',
                lineHeight: 0.88,
              }}
            >
              {DATA.roleLine1}
            </span>
            <span
              className="hero-line font-anton"
              style={{
                display: 'block',
                fontSize: 'clamp(56px, 7.6vw, 156px)',
                color: 'var(--red)',
                opacity: 0,
                transform: 'translateY(60px)',
                lineHeight: 0.88,
              }}
            >
              {DATA.roleLine2}
            </span>
          </h1>

          <p
            className="hero-line font-body"
            style={{
              marginTop: 28,
              maxWidth: '31em',
              fontSize: 'clamp(16px, 1.35vw, 23px)',
              lineHeight: 1.55,
              color: 'var(--ink)',
              opacity: 0,
              transform: 'translateY(40px)',
              position: 'relative',
            }}
          >
            {DATA.tagline}
            <span
              ref={underlineRef}
              style={{
                position: 'absolute',
                bottom: -2,
                left: 0,
                height: 3,
                width: '0%',
                background: 'var(--red)',
                opacity: 0.85,
                transition: 'width 0.1s',
                borderRadius: 2,
              }}
            />
          </p>

          <div
            className="hero-line"
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 36,
              opacity: 0,
              transform: 'translateY(40px)',
            }}
          >
            <a
              ref={magBtn1.ref}
              onMouseMove={magBtn1.onMove}
              onMouseLeave={magBtn1.onLeave}
              href="#section-work"
              className="btn btn-red"
              data-cursor="Go"
              onClick={(e) => {
                e.preventDefault();
                scrollTo('#section-work');
              }}
            >
              <span className="btn-text-roll">
                <span>See my work ↘</span>
                <span>See my work ↘</span>
              </span>
            </a>

            <a
              ref={magBtn2.ref}
              onMouseMove={magBtn2.onMove}
              onMouseLeave={magBtn2.onLeave}
              href={DATA.resumeUrl}
              className="btn btn-outline"
              data-cursor="PDF"
              target="_blank"
              rel="noopener"
            >
              <span className="btn-text-roll">
                <span>Download résumé</span>
                <span>Download résumé</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
