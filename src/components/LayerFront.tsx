import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { useDirectorAll } from '../engine/hooks';

export default function LayerFront() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitAngle = useRef(0);
  const mouseSmooth = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      mouseSmooth.current.x = e.clientX / window.innerWidth;
      mouseSmooth.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  useDirectorAll((states) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const skillsState = states.get('skills');
    if (skillsState && containerRef.current) {
      const { vis, exit, p } = skillsState;
      const alpha = vis * Math.max(0, 1 - exit * 2.4);
      containerRef.current.style.opacity = String(alpha);

      orbitAngle.current += 0.003 + p * 0.015;
      const totalAngle = orbitAngle.current + p * 5 * Math.PI + (mouseSmooth.current.x - 0.5) * 0.5;

      const R = Math.min(vw * 0.27, vh * 0.46);
      const tilt = -0.28;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const cosA = Math.cos(totalAngle), sinA = Math.sin(totalAngle);

      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const chips = containerRef.current.querySelectorAll<HTMLElement>('.skill-chip-front');

      chips.forEach((chip, i) => {
        const t = i / (DATA.skills.length - 1);
        const inclination = Math.acos(1 - 2 * t);
        const azimuth = goldenAngle * i;
        const x = R * Math.sin(inclination) * Math.cos(azimuth);
        const y = R * Math.cos(inclination) * 0.78;
        const z = R * Math.sin(inclination) * Math.sin(azimuth);

        // Apply tilt
        const ny = y * cosT - z * sinT;
        const nz = y * sinT + z * cosT;

        // Apply rotation around Y
        const rx = x * cosA + nz * sinA;
        const rz = -x * sinA + nz * cosA;

        if (rz >= 0) {
          chip.style.display = 'block';
          chip.style.transform = `translate3d(${rx}px, ${ny}px, 0)`;
          chip.style.opacity = String(0.7 + 0.3 * (rz / R));
        } else {
          chip.style.display = 'none';
        }
      });
    }
  });

  return (
    <div
      ref={containerRef}
      className="layer-front"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
        }}
      >
        {DATA.skills.map((skill, i) => (
          <div
            key={i}
            className="skill-chip-front font-mono"
            style={{
              position: 'absolute',
              padding: '7px 18px',
              borderRadius: 999,
              background: 'var(--red)',
              color: '#ffffff',
              border: '1px solid var(--red)',
              boxShadow: '0 4px 24px rgba(255,31,31,0.45)',
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              transform: 'translate3d(0,0,0)',
              display: 'none',
            }}
          >
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
}
