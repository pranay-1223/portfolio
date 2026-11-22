import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { subscribe, type SceneState } from './director';

/** Subscribe to scroll updates without React re-renders. */
export function useDirector(
  sceneId: string,
  callback: (state: SceneState) => void
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    return subscribe(sceneId, (s) => cbRef.current(s as SceneState));
  }, [sceneId]);
}

/** Subscribe to ALL scenes — callback receives entire map */
export function useDirectorAll(
  callback: (states: Map<string, SceneState>) => void
): void {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    return subscribe('*', (s) => cbRef.current(s as Map<string, SceneState>));
  }, []);
}

/** Ref-based mouse position for parallax */
export function useMouse() {
  const pos = useRef({ x: 0.5, y: 0.5 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      pos.current.x = e.clientX / window.innerWidth;
      pos.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return pos;
}

/** Magnetic button effect using gsap.quickTo with elastic easing */
export function useMagnetic<T extends HTMLElement = HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);
  const xTo = useRef<gsap.QuickToFunc | null>(null);
  const yTo = useRef<gsap.QuickToFunc | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    xTo.current = gsap.quickTo(ref.current, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.35)' });
    yTo.current = gsap.quickTo(ref.current, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.35)' });
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current;
      if (!el || !xTo.current || !yTo.current) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      xTo.current((e.clientX - cx) * strength);
      yTo.current((e.clientY - cy) * strength);
    },
    [strength]
  );

  const onLeave = useCallback(() => {
    xTo.current?.(0);
    yTo.current?.(0);
  }, []);

  return { ref, onMove, onLeave };
}
