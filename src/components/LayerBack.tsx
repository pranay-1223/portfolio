import { useRef, useEffect } from 'react';
import { DATA } from '../data';
import { useDirectorAll } from '../engine/hooks';

export default function LayerBack() {
  const heroBackRef = useRef<HTMLDivElement>(null);
  const aboutBackRef = useRef<HTMLDivElement>(null);
  const workBackRef = useRef<HTMLDivElement>(null);
  const journeyBackRef = useRef<HTMLDivElement>(null);
  const journeyYearRef = useRef<HTMLSpanElement>(null);
  const skillsBackRef = useRef<HTMLDivElement>(null);
  const contactBgRef = useRef<HTMLDivElement>(null);
  const contactTextRef = useRef<HTMLDivElement>(null);

  const introPlayed = useRef(false);
  const orbitAngle = useRef(0);
  const mouseSmooth = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    // Intro animation for Hero letters
    const onIntro = () => {
      if (introPlayed.current) return;
      introPlayed.current = true;
      const letters = heroBackRef.current?.querySelectorAll<HTMLElement>('.hero-letter');
      letters?.forEach((el, i) => {
        el.style.transition = `transform 1.6s cubic-bezier(.16,1,.3,1) ${i * 0.07}s, opacity 1.6s cubic-bezier(.16,1,.3,1) ${i * 0.07}s`;
        el.style.transform = 'translateY(0) rotateX(0)';
        el.style.opacity = '1';
      });
    };
    window.addEventListener('intro', onIntro);

    const onMouse = (e: MouseEvent) => {
      mouseSmooth.current.x = e.clientX / window.innerWidth;
      mouseSmooth.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    return () => {
      window.removeEventListener('intro', onIntro);
      window.removeEventListener('mousemove', onMouse);
    };
  }, []);

  useDirectorAll((states) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 1. HERO BACK
    const heroState = states.get('hero');
    if (heroState && heroBackRef.current) {
      const { exit, p } = heroState;
      const alpha = Math.max(0, 1 - exit * 2.4);
      heroBackRef.current.style.opacity = String(alpha);
      const letters = heroBackRef.current.querySelectorAll<HTMLElement>('.hero-letter');
      letters.forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        el.style.transform = `translateY(${dir * p * 12}px)`;
      });
    }

    // 2. ABOUT BACK
    const aboutState = states.get('about');
    if (aboutState && aboutBackRef.current) {
      const { enter, exit } = aboutState;
      const alpha = Math.min(enter * 1.5, 1) * Math.max(0, 1 - exit * 2.2);
      aboutBackRef.current.style.opacity = String(alpha);
      aboutBackRef.current.style.transform = `translateY(${(1 - Math.min(enter * 1.5, 1)) * 40}px)`;
    }

    // 3. WORK BACK (Grid floor)
    const workState = states.get('work');
    if (workState && workBackRef.current) {
      const { vis, exit, p } = workState;
      const alpha = vis * Math.max(0, 1 - exit * 2.4);
      workBackRef.current.style.opacity = String(alpha * 0.7);
      const grid = workBackRef.current.querySelector<HTMLElement>('.work-grid-inner');
      if (grid) {
        grid.style.backgroundPositionY = `${p * 240}px`;
      }
    }

    // 4. JOURNEY BACK (Year odometer)
    const journeyState = states.get('journey');
    if (journeyState && journeyBackRef.current) {
      const { vis, exit, p } = journeyState;
      const alpha = vis * Math.max(0, 1 - exit * 2.4);
      journeyBackRef.current.style.opacity = String(alpha * 0.45);
      const year = Math.round(DATA.journeyStartYear + (DATA.journeyEndYear - DATA.journeyStartYear) * p);
      if (journeyYearRef.current) {
        journeyYearRef.current.textContent = String(year);
      }
    }

    // 5. SKILLS BACK ORBIT CHIPS (z < 0)
    const skillsState = states.get('skills');
    if (skillsState && skillsBackRef.current) {
      const { vis, exit, p } = skillsState;
      const alpha = vis * Math.max(0, 1 - exit * 2.4);
      skillsBackRef.current.style.opacity = String(alpha);

      // Orbit math: R = min(27vw, 46vh), y squashed by .78, tilt -0.28 rad
      // auto-spins, also spins with scroll x 5, follows mouse
      orbitAngle.current += 0.003 + p * 0.015;
      const totalAngle = orbitAngle.current + p * 5 * Math.PI + (mouseSmooth.current.x - 0.5) * 0.5;

      const R = Math.min(vw * 0.27, vh * 0.46);
      const tilt = -0.28;
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const cosA = Math.cos(totalAngle), sinA = Math.sin(totalAngle);

      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const chips = skillsBackRef.current.querySelectorAll<HTMLElement>('.skill-chip-back');

      chips.forEach((chip, i) => {
        const t = i / (DATA.skills.length - 1);
        const inclination = Math.acos(1 - 2 * t);
        const azimuth = goldenAngle * i;
        let x = R * Math.sin(inclination) * Math.cos(azimuth);
        let y = R * Math.cos(inclination) * 0.78;
        let z = R * Math.sin(inclination) * Math.sin(azimuth);

        // Apply tilt
        const ny = y * cosT - z * sinT;
        const nz = y * sinT + z * cosT;

        // Apply rotation around Y
        const rx = x * cosA + nz * sinA;
        const rz = -x * sinA + nz * cosA;

        if (rz < 0) {
          chip.style.display = 'block';
          chip.style.transform = `translate3d(${rx}px, ${ny}px, 0)`;
          chip.style.opacity = String(0.25 + 0.35 * ((rz + R) / R));
        } else {
          chip.style.display = 'none';
        }
      });
    }

    // 6. CONTACT BACK (Red bg + LET'S TALK)
    const contactState = states.get('contact');
    if (contactState && contactBgRef.current && contactTextRef.current) {
      const { bladeT, enter, exit } = contactState;
      const skew = 0.2 * vh;
      const e = -skew + (vw + 2 * skew) * bladeT;

      if (bladeT >= 0.98) {
        contactBgRef.current.style.visibility = 'visible';
        contactBgRef.current.style.clipPath = 'none';
      } else if (bladeT > 0) {
        contactBgRef.current.style.visibility = 'visible';
        contactBgRef.current.style.clipPath = `polygon(0 0, ${e + skew}px 0, ${e - skew}px 100%, 0 100%)`;
      } else {
        contactBgRef.current.style.visibility = 'hidden';
      }

      const textAlpha = Math.max(0, Math.min(1, enter * 1.8)) * Math.max(0, 1 - exit * 2.4);
      contactTextRef.current.style.opacity = String(textAlpha);
      contactTextRef.current.style.transform = `translateY(${(1 - Math.min(enter * 1.5, 1)) * 30}px)`;
    }
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 820;

  return (
    <div className="layer-back" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {/* Hero Back: Giant First Name */}
      <div
        ref={heroBackRef}
        style={{
          position: 'absolute',
          right: isMobile ? '6vw' : '3vw',
          top: isMobile ? '8.5vh' : '10.5vh',
          fontSize: isMobile ? '24vw' : 'min(18.5vw, 36vh)',
          lineHeight: 0.88,
          textAlign: 'right',
          color: 'var(--red)',
          opacity: 0,
        }}
      >
        {DATA.firstName.split('').map((ch, i) => (
          <span
            key={i}
            className="hero-letter font-anton"
            style={{
              display: 'inline-block',
              transform: 'translateY(115%) rotateX(-80deg)',
              opacity: 0,
            }}
          >
            {ch}
          </span>
        ))}
      </div>

      {/* About Back: Soft red shade */}
      <div
        ref={aboutBackRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(60vw 90vh at 22vw 70vh, rgba(255,31,31,.30), rgba(255,31,31,.10) 55%, transparent 80%),
            linear-gradient(90deg, rgba(255,31,31,0.04), transparent 60%)
          `,
          opacity: 0,
          transition: 'opacity 0.2s',
        }}
      />

      {/* Work Back: Perspective grid floor */}
      <div
        ref={workBackRef}
        style={{
          position: 'absolute',
          inset: 0,
          perspective: 800,
          overflow: 'hidden',
          opacity: 0,
        }}
      >
        <div
          className="work-grid-inner"
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-30%',
            right: '-30%',
            height: '70vh',
            transform: 'rotateX(68deg)',
            transformOrigin: 'bottom center',
            backgroundImage: `
              linear-gradient(rgba(255,31,31,.35) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,31,31,.35) 1px, transparent 1px)
            `,
            backgroundSize: '90px 90px',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 85%)',
          }}
        />
      </div>

      {/* Journey Back: Colossal outlined year */}
      <div
        ref={journeyBackRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
        }}
      >
        <span
          ref={journeyYearRef}
          className="font-anton"
          style={{
            fontSize: '44vh',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '2px var(--red)',
          }}
        >
          {DATA.journeyStartYear}
        </span>
      </div>

      {/* Skills Back: Orbit chips with z < 0 */}
      <div
        ref={skillsBackRef}
        style={{
          position: 'absolute',
          left: isMobile ? '50%' : '50%',
          top: '50%',
          opacity: 0,
        }}
      >
        {DATA.skills.map((skill, i) => (
          <div
            key={i}
            className="skill-chip-back font-mono"
            style={{
              position: 'absolute',
              padding: '6px 16px',
              borderRadius: 999,
              border: '1px solid rgba(255,31,31,0.4)',
              background: 'rgba(255,255,255,0.75)',
              color: 'var(--red)',
              fontSize: 11,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              transform: 'translate3d(0,0,0)',
            }}
          >
            {skill}
          </div>
        ))}
      </div>

      {/* Contact Back: Full red background revealed by blade */}
      <div
        ref={contactBgRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--red)',
          visibility: 'hidden',
        }}
      />

      {/* Contact Back: Giant white LET'S TALK */}
      <div
        ref={contactTextRef}
        style={{
          position: 'absolute',
          top: '10vh',
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          lineHeight: 0.84,
        }}
      >
        <span className="font-anton" style={{ fontSize: 'min(36vh, 26vw)', color: '#fff', textAlign: 'center' }}>
          LET'S
        </span>
        <span className="font-anton" style={{ fontSize: 'min(36vh, 26vw)', color: '#fff', textAlign: 'center' }}>
          TALK
        </span>
      </div>
    </div>
  );
}
