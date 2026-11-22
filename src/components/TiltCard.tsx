import { useRef, useCallback } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
}

/** Glass card that 3D-tilts toward cursor ±14° with radial glare */
export default function TiltCard({ children, className = '', style = {}, maxTilt = 14 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotY = (x - 0.5) * maxTilt * 2;
      const rotX = -(y - 0.5) * maxTilt * 2;
      el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.35), transparent 60%)`;
      }
    },
    [maxTilt]
  );

  const onLeave = useCallback(() => {
    const el = cardRef.current;
    if (el) el.style.transform = '';
    if (glareRef.current) glareRef.current.style.background = '';
  }, []);

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24,
        boxShadow: '0 8px 40px rgba(255,31,31,0.08)',
        overflow: 'hidden',
        transition: 'transform 0.4s cubic-bezier(.23,1,.32,1)',
        willChange: 'transform',
        ...style,
      }}
    >
      <div
        ref={glareRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 24,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
}
