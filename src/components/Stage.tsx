import { useRef, useEffect } from 'react';
import {
  getCurrentFrame,
  getActiveScene,
  SCENES,
  getState,
  type SceneDef,
} from '../engine/director';
import { getFrame, getManifest, getLoadedCount, type Manifest } from '../engine/frames';
import { useMouse } from '../engine/hooks';
import gsap from 'gsap';

/* ─── Helpers ─── */
function clamp(v: number, lo = 0, hi = 1) {
  return v < lo ? lo : v > hi ? hi : v;
}
function findShot(manifest: Manifest, f: number) {
  for (const s of manifest.shots) {
    if (f >= s.from && f <= s.to) return s;
  }
  return manifest.shots[0];
}

/* ─── Component ─── */
export default function Stage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useMouse();
  const mouseSmooth = useRef({ x: 0, y: 0 });
  const lastKey = useRef('');
  const isMobile = useRef(window.innerWidth < 820);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      isMobile.current = window.innerWidth < 820;
      lastKey.current = ''; // force redraw
    }
    resize();
    window.addEventListener('resize', resize);

    // Draw loop via gsap ticker
    const draw = () => {
      const manifest = getManifest();
      if (!manifest) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const f = getCurrentFrame();
      const loaded = getLoadedCount();
      const active = getActiveScene();

      // Mouse parallax
      const tx = (mouse.current.x - 0.5) * 14;
      const ty = (mouse.current.y - 0.5) * 14;
      mouseSmooth.current.x += (tx - mouseSmooth.current.x) * 0.06;
      mouseSmooth.current.y += (ty - mouseSmooth.current.y) * 0.06;

      // Key check
      const key = `${f.toFixed(2)}_${vw}_${vh}_${loaded}_${active.id}`;
      if (key === lastKey.current) return;
      lastKey.current = key;

      ctx.clearRect(0, 0, vw, vh);

      // Determine if we're in a blade transition
      const aIdx = SCENES.indexOf(active);
      const bladeState = getState(active.id);
      const bladeT = bladeState?.bladeT ?? 0;

      if (bladeT > 0 && bladeT < 1 && aIdx > 0) {
        // Blade transition
        const prevScene = SCENES[aIdx - 1];
        const prevF = prevScene.to;
        const curF = active.from;

        const skew = 0.2 * vh;
        const e = -skew + (vw + 2 * skew) * bladeT;
        const isContact = active.id === 'contact';

        // Draw outgoing (previous scene)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(e + skew, 0);
        ctx.lineTo(vw, 0);
        ctx.lineTo(vw, vh);
        ctx.lineTo(e - skew, vh);
        ctx.closePath();
        ctx.clip();
        ctx.globalAlpha = 1 - 0.35 * bladeT;
        drawPerson(ctx, prevScene, prevF, vw, vh, 60 * bladeT);
        ctx.restore();

        // Draw incoming (current scene)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(e + skew, 0);
        ctx.lineTo(0, 0);
        ctx.lineTo(0, vh);
        ctx.lineTo(e - skew, vh);
        ctx.closePath();
        ctx.clip();
        ctx.globalAlpha = 1;
        drawPerson(ctx, active, curF, vw, vh, -60 * (1 - bladeT));
        ctx.restore();

        // Blade line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(e + skew, 0);
        ctx.lineTo(e - skew, vh);
        ctx.strokeStyle = isContact ? '#ffffff' : '#ff1f1f';
        ctx.lineWidth = 3;
        ctx.shadowColor = isContact ? '#ffffff' : '#ff1f1f';
        ctx.shadowBlur = 24;
        ctx.stroke();

        // Gradient trail
        const grad = ctx.createLinearGradient(e - 90, 0, e, 0);
        grad.addColorStop(0, 'rgba(255,31,31,0)');
        grad.addColorStop(1, isContact ? 'rgba(255,255,255,0.12)' : 'rgba(255,31,31,0.12)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(e + skew - 90, 0);
        ctx.lineTo(e + skew, 0);
        ctx.lineTo(e - skew, vh);
        ctx.lineTo(e - skew - 90, vh);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Normal — draw current scene's frame
        drawPerson(ctx, active, f, vw, vh, 0);
      }
    };

    function drawPerson(
      ctx: CanvasRenderingContext2D,
      scene: SceneDef,
      f: number,
      vw: number,
      vh: number,
      shiftX: number
    ) {
      const manifest = getManifest()!;
      const shot = findShot(manifest, scene.from);
      const box = shot.box;
      const cx = shot.cx;

      const floorF = Math.floor(clamp(f, shot.from, shot.to));
      const fracF = f - Math.floor(f);

      const mob = isMobile.current;
      const k = scene.k;
      let scale: number;
      if (mob) {
        scale = Math.min((vh * 0.74) / 900, (vw * 1.05) / box[2]);
      } else {
        scale = (vh * k) / 900;
      }

      const x = mob ? 0.5 : scene.x;
      const offY = vh - 900 * scale;
      const offX = x * vw - cx * 1600 * scale;

      const drawX = offX + box[0] * scale + mouseSmooth.current.x + shiftX;
      const drawY = offY + box[1] * scale + mouseSmooth.current.y;
      const drawW = box[2] * scale;
      const drawH = box[3] * scale;

      const img1 = getFrame(floorF);
      if (img1) {
        ctx.drawImage(img1, drawX, drawY, drawW, drawH);
      }

      // Fractional blend for silky motion
      if (fracF > 0.01) {
        const nextF = Math.min(floorF + 1, shot.to);
        const img2 = getFrame(nextF);
        if (img2 && img2 !== img1) {
          ctx.save();
          ctx.globalAlpha = fracF;
          ctx.drawImage(img2, drawX, drawY, drawW, drawH);
          ctx.restore();
        }
      }
    }

    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="stage-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}
