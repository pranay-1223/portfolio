import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { registerSection, scrollTo } from '../engine/director';
import { useDirector } from '../engine/hooks';

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) registerSection('contact', sectionRef.current);
  }, []);

  useDirector('contact', (st) => {
    if (!frontRef.current) return;
    const { vis, exit } = st;
    const alpha = vis * Math.max(0, 1 - exit * 2.4);
    frontRef.current.style.opacity = String(alpha);
  });

  const links = [
    { label: DATA.githubLabel, url: DATA.github },
    { label: DATA.linkedinLabel, url: DATA.linkedin },
    { label: DATA.resumeLabel, url: DATA.resumeUrl },
  ];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

  return (
    <section
      ref={sectionRef}
      id="section-contact"
      className="scene"
      style={{ height: '240vh' }}
    >
      <div className="scene-sticky">
        <div
          ref={frontRef}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            opacity: 0,
          }}
        >
          {/* Email — bottom left */}
          <div
            style={{
              position: 'absolute',
              left: isMobile ? '6vw' : '5vw',
              bottom: '15vh',
            }}
          >
            <span
              className="font-mono"
              style={{
                display: 'block',
                fontSize: 11,
                letterSpacing: '0.04em',
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 10,
              }}
            >
              (06) — GET IN TOUCH
            </span>

            <a
              href={`mailto:${DATA.email}`}
              data-cursor="Write"
              className="contact-email-link"
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
            >
              <span
                className="font-anton"
                style={{
                  fontSize: 'clamp(34px, 3.7vw, 74px)',
                  lineHeight: 0.95,
                  color: '#ffffff',
                }}
              >
                {DATA.emailName}
              </span>
              <span
                className="contact-domain font-anton"
                style={{
                  fontSize: 'clamp(34px, 3.7vw, 74px)',
                  lineHeight: 0.95,
                  color: isMobile ? '#ffffff' : 'var(--ink)',
                }}
              >
                {DATA.emailDomain}
              </span>
              <span
                className="email-wipe-line"
                style={{
                  display: 'block',
                  height: 3,
                  background: '#ffffff',
                  width: '0%',
                  transition: 'width 0.4s cubic-bezier(.23,1,.32,1)',
                  marginTop: 8,
                  borderRadius: 2,
                }}
              />
            </a>
          </div>

          {/* Links — bottom right */}
          <div
            style={{
              position: 'absolute',
              right: isMobile ? '6vw' : '5vw',
              bottom: isMobile ? '30vh' : '15vh',
              display: 'flex',
              flexDirection: 'column',
              minWidth: 200,
            }}
          >
            {links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener"
                data-cursor="Open"
                className="contact-social-link"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.25)',
                  textDecoration: 'none',
                  color: '#ffffff',
                }}
              >
                <span
                  className="font-body"
                  style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.02em' }}
                >
                  {link.label}
                </span>
                <span className="social-arrow" style={{ fontSize: 18, transition: 'transform 0.3s' }}>
                  ↗
                </span>
              </a>
            ))}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '3.5vh',
              left: isMobile ? '6vw' : '5vw',
              right: isMobile ? '6vw' : '5vw',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              className="font-mono"
              style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.04em' }}
            >
              © {new Date().getFullYear()} {DATA.fullName}
            </span>

            <button
              className="font-mono"
              data-cursor="Go"
              onClick={() => scrollTo(0)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 11,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              Back to top ↑
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
