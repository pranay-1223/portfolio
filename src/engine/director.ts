import Lenis from 'lenis';
import gsap from 'gsap';
import { getManifest } from './frames';

/* ─── Types ─── */
export interface SceneDef {
  id: string;
  from: number;
  to: number;
  x: number;
  k: number;
  label: string;
  height: string; // e.g. '230vh'
}
export interface SceneState {
  enter: number;  // 0→1 as it enters viewport
  p: number;      // 0→1 progress through section
  exit: number;   // 0→1 as it leaves viewport
  vis: number;    // combined visibility
  frame: number;  // fractional frame index
  bladeT: number; // blade transition 0→1
}

/* ─── Scene definitions (filled after manifest loads) ─── */
export let SCENES: SceneDef[] = [];

export function buildScenes(shots: { from: number; to: number }[]): void {
  const s1 = shots[0], s2 = shots[1], s3 = shots[2], s4 = shots[3];
  // S4 splits
  const s4len = s4.to - s4.from;
  const s4_60 = Math.round(s4.from + s4len * 0.60);
  const s4_85 = Math.round(s4.from + s4len * 0.85);

  SCENES = [
    { id: 'hero',    from: s1.from, to: s1.to,   x: 0.70, k: 1.0,  label: 'Hello',   height: '230vh' },
    { id: 'about',   from: s2.from, to: s2.to,   x: 0.27, k: 1.0,  label: 'About',   height: '280vh' },
    { id: 'work',    from: s3.from, to: s3.to,   x: 0.77, k: 0.86, label: 'Work',    height: '560vh' },
    { id: 'journey', from: s4.from, to: s4_60,   x: 0.26, k: 1.0,  label: 'Journey', height: '240vh' },
    { id: 'skills',  from: s4_60,   to: s4_85,   x: 0.50, k: 0.98, label: 'Toolkit', height: '280vh' },
    { id: 'awards',  from: s4_85,   to: s4.to,   x: 0.75, k: 1.0,  label: 'Awards',  height: '320vh' },
    { id: 'contact', from: s1.to,   to: s1.from, x: 0.50, k: 1.0,  label: 'Contact', height: '240vh' },
  ];
}

/* ─── Layout cache ─── */
interface LayoutEntry { top: number; height: number; }
const layout = new Map<string, LayoutEntry>();
const sectionEls = new Map<string, HTMLElement>();

export function registerSection(id: string, el: HTMLElement): void {
  sectionEls.set(id, el);
  measureSection(id, el);
}

function measureSection(id: string, el: HTMLElement): void {
  const rect = el.getBoundingClientRect();
  layout.set(id, { top: rect.top + window.scrollY, height: rect.height });
}

function measureAll(): void {
  sectionEls.forEach((el, id) => measureSection(id, el));
}

/* ─── Subscribers ─── */
type Callback = (state: SceneState | Map<string, SceneState>) => void;
const subs = new Map<string, Set<Callback>>();
const allSubs = new Set<Callback>();

export function subscribe(idOrStar: string, cb: Callback): () => void {
  if (idOrStar === '*') {
    allSubs.add(cb);
    return () => { allSubs.delete(cb); };
  }
  if (!subs.has(idOrStar)) subs.set(idOrStar, new Set());
  subs.get(idOrStar)!.add(cb);
  return () => { subs.get(idOrStar)?.delete(cb); };
}

/* ─── State ─── */
const states = new Map<string, SceneState>();
let currentFrame = 0;
let activeSceneIdx = 0;

export function getCurrentFrame(): number { return currentFrame; }
export function getActiveScene(): SceneDef { return SCENES[activeSceneIdx] ?? SCENES[0]; }
export function getState(id: string): SceneState | undefined { return states.get(id); }
export function getAllStates(): Map<string, SceneState> { return states; }

/* ─── Easing ─── */
function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function clamp(v: number, lo = 0, hi = 1): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/* ─── Scroll computation ─── */
function tick(): void {
  const y = window.scrollY;
  const vh = window.innerHeight;
  const lead = 0.78 * vh;
  const span = 0.62 * vh;

  // Find active scene
  let aIdx = 0;
  for (let i = 0; i < SCENES.length; i++) {
    const L = layout.get(SCENES[i].id);
    if (L && y >= L.top - lead) aIdx = i;
  }
  activeSceneIdx = aIdx;

  // Compute per-scene states
  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    const L = layout.get(sc.id);
    if (!L) continue;

    const enter = clamp((y - (L.top - vh)) / vh);
    const p = clamp((y - L.top) / (L.height - vh));
    const exit = clamp((y - (L.top + L.height - vh)) / vh);
    const vis = clamp(Math.min(enter * 1.6, 1 - exit * 2.2));

    // Frame value
    const frameVal = sc.from + (sc.to - sc.from) * p;

    // Blade transition
    let bladeT = 0;
    if (i > 0) {
      const prevL = layout.get(SCENES[i - 1].id);
      if (prevL) {
        bladeT = clamp((y - (L.top - lead)) / span);
        bladeT = easeInOutSine(bladeT);
      }
    }

    const st: SceneState = { enter, p, exit, vis, frame: frameVal, bladeT };
    states.set(sc.id, st);

    // Notify per-scene subscribers
    subs.get(sc.id)?.forEach((cb) => cb(st));
  }

  // Compute current display frame with transitions
  const activeScene = SCENES[aIdx];
  const activeState = states.get(activeScene.id);
  if (activeState) {
    if (activeState.bladeT > 0 && activeState.bladeT < 1 && aIdx > 0) {
      // In transition — interpolate between prev last frame and current first frame
      const prevScene = SCENES[aIdx - 1];
      const prevLast = prevScene.to;
      const curFirst = activeScene.from;
      currentFrame = prevLast + (curFirst - prevLast) * activeState.bladeT;
    } else {
      currentFrame = activeState.frame;
    }
  }

  // Notify all-subs
  allSubs.forEach((cb) => cb(states));
}

/* ─── Lenis + GSAP ─── */
let lenis: Lenis | null = null;

export function getLenis(): Lenis | null { return lenis; }

export function scrollTo(target: string | number, duration = 2.2): void {
  lenis?.scrollTo(target, {
    duration,
    easing: (t: number) => 1 - Math.pow(1 - t, 4), // easeOutQuart
  });
}

export function startDirector(): void {
  if (lenis) {
    lenis.start();
    return;
  }

  history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  lenis = new Lenis({
    lerp: 0.075,
    smoothWheel: true,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
  });

  // ResizeObserver
  const ro = new ResizeObserver(() => measureAll());
  sectionEls.forEach((el) => ro.observe(el));

  // Drive via gsap ticker
  gsap.ticker.lagSmoothing(0);
  gsap.ticker.add((time: number) => {
    lenis!.raf(time * 1000);
    tick();
  });
}

export function initDirector(): void {
  // Build scenes from manifest
  const m = getManifest();
  if (m) {
    buildScenes(m.shots);
  }
}

/** Stop lenis (preloader phase) */
export function stopLenis(): void {
  lenis?.stop();
}
