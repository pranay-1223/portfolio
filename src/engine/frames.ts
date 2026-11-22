/* ─── Manifest types ─── */
export interface ShotInfo {
  from: number;
  to: number;
  box: [number, number, number, number]; // x, y, w, h in 1600×900 space
  cx: number; // person horizontal centre 0..1
}
export interface Manifest {
  w: number;
  h: number;
  count: number;
  shots: ShotInfo[];
}

/* ─── Frame loader ─── */
const frames: (HTMLImageElement | null)[] = [];
let manifest: Manifest | null = null;
let loadedCount = 0;
let onProgress: ((n: number) => void) | null = null;
let resolved = false;
let preloadResolve: (() => void) | null = null;
const preloadPromise = new Promise<void>((r) => { preloadResolve = r; });

function base(): string {
  return window.innerWidth < 820 ? './frames/sm/' : './frames/lg/';
}

async function loadFrame(i: number): Promise<void> {
  if (frames[i]) return;
  const img = new Image();
  img.src = `${base()}f${String(i).padStart(3, '0')}.webp`;
  try {
    await img.decode();
    frames[i] = img;
    loadedCount++;
    onProgress?.(loadedCount);
    if (!resolved && manifest && loadedCount >= Math.ceil(manifest.count / 4)) {
      resolved = true;
      preloadResolve?.();
    }
  } catch {
    // frame missing or corrupt — will fall back
  }
}

export function getFrame(i: number): HTMLImageElement | null {
  if (!manifest) return null;
  if (i < 0) i = 0;
  if (i >= manifest.count) i = manifest.count - 1;
  if (frames[i]) return frames[i];
  // fallback: nearest loaded in same shot
  const shot = manifest.shots.find((s) => i >= s.from && i <= s.to);
  if (!shot) return null;
  for (let d = 1; d < manifest.count; d++) {
    if (i - d >= shot.from && frames[i - d]) return frames[i - d];
    if (i + d <= shot.to && frames[i + d]) return frames[i + d];
  }
  return null;
}

export function getManifest(): Manifest | null {
  return manifest;
}

export function getLoadedCount(): number {
  return loadedCount;
}

export async function initFrames(progressCb: (n: number) => void): Promise<void> {
  onProgress = progressCb;
  const resp = await fetch('./frames/manifest.json');
  manifest = (await resp.json()) as Manifest;

  const count = manifest.count;
  frames.length = count;

  // stride order: shot boundaries first, then 8→4→2→1
  const order: number[] = [];
  const added = new Set<number>();
  const add = (n: number) => {
    if (n >= 0 && n < count && !added.has(n)) {
      added.add(n);
      order.push(n);
    }
  };
  // shot boundaries
  for (const s of manifest.shots) {
    add(s.from);
    add(s.to);
  }
  // stride 8
  for (let i = 0; i < count; i += 8) add(i);
  // stride 4
  for (let i = 0; i < count; i += 4) add(i);
  // stride 2
  for (let i = 0; i < count; i += 2) add(i);
  // stride 1
  for (let i = 0; i < count; i++) add(i);

  // load first quarter and wait
  const quarter = Math.ceil(count / 4);
  for (let i = 0; i < Math.min(quarter, order.length); i++) {
    await loadFrame(order[i]);
  }
  await preloadPromise;

  // stream rest in background
  (async () => {
    for (let i = quarter; i < order.length; i++) {
      await loadFrame(order[i]);
    }
  })();
}
