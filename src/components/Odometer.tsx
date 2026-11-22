import { useRef, useEffect } from 'react';

interface OdometerProps {
  value: number;
  decimals?: number;
  suffix?: string;
  progress: number; // 0→1 scroll progress
  className?: string;
}

/** Mechanical odometer: digit columns 0-9,0 that roll. Lowest digit snaps with smoothstep .55–1 */
export default function Odometer({ value, decimals = 0, suffix = '', progress, className = '' }: OdometerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const targetStr = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
    const digits = ref.current.querySelectorAll<HTMLDivElement>('.odo-col');

    digits.forEach((col, i) => {
      const targetDigit = parseInt(targetStr.replace('.', '')[i] ?? '0', 10);
      // smoothstep for lowest digit
      const isLowest = i === digits.length - 1;
      let p = progress;
      if (isLowest) {
        p = p < 0.55 ? 0 : (p - 0.55) / 0.45;
        p = p * p * (3 - 2 * p); // smoothstep
      }
      const currentDigit = targetDigit * p;
      col.style.transform = `translateY(${-currentDigit * 100}%)`;
    });
  }, [progress, value, decimals]);

  const targetStr = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  const chars = targetStr.replace('.', '').split('');
  const dotIdx = targetStr.indexOf('.');

  return (
    <div ref={ref} className={`odometer ${className}`} style={{ display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
      {chars.map((_, i) => (
        <span key={i} style={{ display: 'inline-flex', flexDirection: 'column', position: 'relative' }}>
          {dotIdx > 0 && i === dotIdx && (
            <span className="odo-dot font-anton" style={{ position: 'absolute', left: '-0.3em', bottom: 0 }}>.</span>
          )}
          <span className="odo-col font-anton" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.4s cubic-bezier(.23,1,.32,1)' }}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d, j) => (
              <span key={j} style={{ lineHeight: 1 }}>{d}</span>
            ))}
          </span>
        </span>
      ))}
      {suffix && <span className="font-anton" style={{ lineHeight: 1 }}>{suffix}</span>}
    </div>
  );
}
