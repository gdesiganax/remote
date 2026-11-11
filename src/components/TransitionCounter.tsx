import { useEffect, useRef } from 'react';

interface Props {
  /** ms after mount when counting starts (the screen is covered by then) */
  startMs: number;
  /** ms after mount when it reaches 100 */
  endMs: number;
}

/**
 * Subtle "Loading 1 → 100" readout shown during the section transition.
 * Writes to the DOM directly so counting never re-renders the page.
 */
export default function TransitionCounter({ startMs, endMs }: Props) {
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(Math.max((now - t0 - startMs) / (endMs - startMs), 0), 1);
      // Linear so every step from 1 to 100 is readable while the label is visible
      if (numRef.current) numRef.current.textContent = String(Math.max(1, Math.round(p * 100)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startMs, endMs]);

  return (
    <span className="flash-count">
      Loading <span ref={numRef} className="flash-count-num">1</span>
    </span>
  );
}
