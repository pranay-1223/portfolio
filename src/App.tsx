import { useEffect, useRef, useState } from 'react';
import { initFrames, getManifest } from './engine/frames';
import { initDirector, startDirector } from './engine/director';
import Stage from './components/Stage';
import Chrome from './components/Chrome';
import LayerBack from './components/LayerBack';
import LayerFront from './components/LayerFront';
import Hero from './scenes/Hero';
import About from './scenes/About';
import Work from './scenes/Work';
import Journey from './scenes/Journey';
import Skills from './scenes/Skills';
import Awards from './scenes/Awards';
import Contact from './scenes/Contact';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [preloaderMounted, setPreloaderMounted] = useState(true);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 820);

  useEffect(() => {
    // Load frames
    initFrames((n) => {
      const manifest = getManifest();
      if (manifest) {
        const pct = Math.min(100, Math.round((n / manifest.count) * 100));
        setProgress(pct);
      }
    }).then(() => {
      initDirector();
      // Show preloader finishing
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        startDirector();
        window.dispatchEvent(new Event('intro'));
        // Fully unmount preloader after split animation completes (1.2s)
        setTimeout(() => {
          setPreloaderMounted(false);
        }, 1400);
      }, 400);
    });
  }, []);

  // Custom cursor (desktop only)
  useEffect(() => {
    if (isMobile) return;
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;

      // Check cursor target
      const target = (e.target as HTMLElement)?.closest('[data-cursor]');
      if (target) {
        ring.classList.add('expanded');
        const label = ring.querySelector('.cursor-label');
        if (label) label.textContent = (target as HTMLElement).dataset.cursor || '';
      } else {
        ring.classList.remove('expanded');
      }
    };

    const animate = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMove);
    animate();
    return () => window.removeEventListener('mousemove', onMove);
  }, [isMobile]);

  return (
    <>
      {/* Preloader */}
      {preloaderMounted && (
        <div ref={preloaderRef} className={`preloader ${!loading ? 'done' : ''}`}>
          <div className="preloader-half top" />
          <div className="preloader-half bottom" />
          <div className={`preloader-center ${!loading ? 'done' : ''}`}>
            <span className="font-mono preloader-line" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: '0.12em', transition: 'transform 0.8s cubic-bezier(.16,1,.3,1), opacity 0.6s' }}>
              PRANAY PATEL — PORTFOLIO
            </span>
            <span className="font-anton preloader-counter" style={{ fontSize: 'min(26vw, 40vh)', color: '#fff', lineHeight: 1 }}>
              {String(progress).padStart(3, '0')}
            </span>
            <span className="font-mono preloader-line" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, letterSpacing: '0.12em', transition: 'transform 0.8s cubic-bezier(.16,1,.3,1), opacity 0.6s' }}>
              INITIALIZING DIRECTORS & STAGE
            </span>
          </div>
        </div>
      )}

      {/* Back layer */}
      <LayerBack />

      {/* Canvas */}
      <Stage />

      {/* Front layer */}
      <LayerFront />

      {/* Main content */}
      <main>
        <Hero />
        <About />
        <Work />
        <Journey />
        <Skills />
        <Awards />
        <Contact />
      </main>

      {/* HUD */}
      <Chrome />

      {/* Custom cursor */}
      {!isMobile && (
        <>
          <div ref={cursorDotRef} className="cursor-dot" />
          <div ref={cursorRingRef} className="cursor-ring">
            <span className="cursor-label" />
          </div>
        </>
      )}
    </>
  );
}
