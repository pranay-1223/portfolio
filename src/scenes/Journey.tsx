import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { registerSection } from '../engine/director';
import { useDirector } from '../engine/hooks';

export default function Journey() {
  const sectionRef = useRef<HTMLElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (sectionRef.current) registerSection('journey', sectionRef.current);
  }, []);

  useDirector('journey', (st) => {
    if (!frontRef.current) return;
    const { vis, exit, p } = st;
    const alpha = vis * Math.max(0, 1 - exit * 2.4);
    frontRef.current.style.opacity = String(alpha);

    // Red SVG line draws from bottom up: pathLength=1 and dashoffset
    // At p=0, dashoffset=1 (hidden). At p=1, dashoffset=0 (fully drawn from bottom to top).
    if (lineRef.current) {
      lineRef.current.style.strokeDashoffset = String(Math.max(0, 1 - p * 1.1));
    }

    // Items reveal from the bottom with rotateY -55deg -> 0
    // items: index 2 is bottom (2020), index 1 is middle (2022), index 0 is top (2024)
    const items = frontRef.current.querySelectorAll<HTMLDivElement>('.journey-item');
    const totalItems = items.length;
    items.forEach((item, i) => {
      // Reverse index for revealing from the bottom up:
      const bottomUpIdx = (totalItems - 1) - i;
      const threshold = bottomUpIdx / totalItems;
      const itemProgress = Math.max(0, Math.min(1, (p - threshold * 0.6) / 0.35));

      item.style.transform = `rotateY(${(1 - itemProgress) * -55}deg)`;
      item.style.opacity = String(itemProgress);

      const node = item.querySelector<HTMLDivElement>('.journey-node');
      if (node) {
        node.style.background = itemProgress > 0.8 ? 'var(--red)' : '#ffffff';
        node.style.boxShadow = itemProgress > 0.8 ? '0 0 12px rgba(255,31,31,0.6)' : 'none';
      }
    });
  });

  return (
    <section
      ref={sectionRef}
      id="section-journey"
      className="scene"
      style={{ height: '240vh' }}
    >
      <div className="scene-sticky">
        <div
          ref={frontRef}
          className="journey-front"
          style={{
            position: 'absolute',
            right: '5vw',
            top: '15vh',
            bottom: '8vh',
            width: 'min(44vw, 560px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            zIndex: 3,
            opacity: 0,
          }}
        >
          <span className="section-label font-mono">
            <span style={{ color: 'var(--red)' }}>(03)</span> — Journey
          </span>

          <h2 style={{ margin: '14px 0 36px' }}>
            <span
              className="font-anton"
              style={{ display: 'block', fontSize: 'clamp(36px, 4vw, 72px)', lineHeight: 0.92, color: 'var(--ink)' }}
            >
              LEARNING
            </span>
            <span
              className="font-anton"
              style={{ display: 'block', fontSize: 'clamp(36px, 4vw, 72px)', lineHeight: 0.92, color: 'var(--red)' }}
            >
              OUT LOUD.
            </span>
          </h2>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 36 }}>
            {/* Grey 1px track */}
            <div
              style={{
                position: 'absolute',
                left: 11,
                top: 10,
                bottom: 30,
                width: 1,
                background: 'var(--line)',
              }}
            />

            {/* Red SVG line drawing from bottom up */}
            <svg
              style={{
                position: 'absolute',
                left: 10,
                top: 10,
                width: 3,
                height: 'calc(100% - 40px)',
                overflow: 'visible',
              }}
            >
              <line
                ref={lineRef}
                x1="1"
                y1="100%"
                x2="1"
                y2="0"
                stroke="var(--red)"
                strokeWidth="2.5"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>

            {DATA.journey.map((item, i) => (
              <div
                key={i}
                className="journey-item"
                style={{
                  position: 'relative',
                  marginBottom: 44,
                  transformOrigin: 'left center',
                  transform: 'rotateY(-55deg)',
                  opacity: 0,
                  transition: 'transform 0.4s cubic-bezier(.23,1,.32,1), opacity 0.4s',
                }}
              >
                {/* Node */}
                <div
                  className="journey-node"
                  style={{
                    position: 'absolute',
                    left: -32,
                    top: 6,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    border: '2px solid var(--red)',
                    background: '#ffffff',
                    transition: 'background 0.3s, box-shadow 0.3s',
                  }}
                />

                <span
                  className="font-mono"
                  style={{ fontSize: 12, color: 'var(--red)', letterSpacing: '0.04em', fontWeight: 600 }}
                >
                  {item.year}
                </span>

                <h4
                  className="font-anton"
                  style={{ fontSize: 'clamp(24px, 2.4vw, 42px)', margin: '4px 0 6px', color: 'var(--ink)', lineHeight: 1 }}
                >
                  {item.title}
                </h4>

                <span className="font-body" style={{ fontSize: 15, color: 'var(--mute)' }}>
                  {item.org}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
