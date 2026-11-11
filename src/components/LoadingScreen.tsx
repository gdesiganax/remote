import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { playSlashSound, unlockAudio } from '../lib/sound';
import { prefersReducedMotion } from '../lib/site';
import './LoadingScreen.css';

interface LoadingScreenProps {
  /** Called when the slice begins, so the main page can be revealed underneath. */
  onReveal?: () => void;
  /** Called once the slice animation has finished and the screen can unmount. */
  onComplete: () => void;
}

// Compressed WebP of 'Confident White Samurai Portrait.png' (the PNG is kept for social previews)
const BG_IMAGE = '/images/samurai-portrait.webp';
const MIN_DURATION = 2600; // ms the ring takes to fill when everything loads fast
const MAX_WAIT = 8000; // never hold visitors longer than this, even if assets stall
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Phase = 'loading' | 'ready' | 'entering' | 'slicing';

export default function LoadingScreen({ onReveal, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhaseState] = useState<Phase>('loading');
  const [imageReady, setImageReady] = useState(false);
  const phaseRef = useRef<Phase>('loading');
  const ringRef = useRef<HTMLButtonElement>(null);
  const timersRef = useRef<number[]>([]);
  const [reduced] = useState(prefersReducedMotion);
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  // Preload the background image
  useEffect(() => {
    const img = new Image();
    const done = () => setImageReady(true);
    img.onload = done;
    img.onerror = done; // never block the site on a missing image
    img.src = BG_IMAGE;
  }, []);

  // Fill the ring: time-based, but holds near the end until assets are ready
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = reduced ? 400 : MIN_DURATION;

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const timedOut = now - start > MAX_WAIT;
      const ready = imageReady || timedOut;
      const target = ready ? eased * 100 : Math.min(eased * 100, 92);
      setProgress(target);

      if (ready && t >= 1) {
        setProgress(100);
        setPhase('ready');
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [imageReady, setPhase, reduced]);

  // Move focus to the Enter button once it is available
  useEffect(() => {
    if (phase === 'ready') ringRef.current?.focus({ preventScroll: true });
  }, [phase]);

  // Clear pending timers if unmounted mid-transition
  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  const enter = useCallback(() => {
    if (phaseRef.current !== 'ready') return;
    setPhase('entering');
    void unlockAudio();

    // 1) Brighten the samurai, 2) slice the screen open, 3) unmount
    const brighten = reduced ? 0 : 900;
    const slice = reduced ? 0 : 1100;
    timersRef.current.push(
      window.setTimeout(() => {
        if (!reduced) playSlashSound();
        setPhase('slicing');
        onReveal?.();
        timersRef.current.push(window.setTimeout(onComplete, slice));
      }, brighten),
    );
  }, [onReveal, onComplete, setPhase, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Enter anywhere; the focused button also handles Space natively
      if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter]);

  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);
  const bgStyle = { '--ls-bg': `url("${BG_IMAGE}")` } as CSSProperties;

  // Shared visual layer, rendered into both halves so the slice splits it cleanly
  const scene = (
    <>
      <div className={`ls-image ${imageReady ? 'visible' : ''}`} style={bgStyle} />
      <div className="ls-vignette" />
    </>
  );

  return (
    <div
      className={`loading-screen phase-${phase} ${reduced ? 'reduced' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Afeez Lukmon portfolio intro"
    >
      <div className="ls-half ls-half-top">{scene}</div>
      <div className="ls-half ls-half-bottom">{scene}</div>

      <div className="corner top-left" />
      <div className="corner top-right" />
      <div className="corner bottom-left" />
      <div className="corner bottom-right" />

      <div className="ls-content">
        <button
          ref={ringRef}
          type="button"
          className="ls-ring"
          onClick={enter}
          disabled={phase !== 'ready'}
          aria-label={phase === 'ready' ? 'Enter site' : `Loading ${Math.floor(progress)}%`}
        >
          <svg viewBox="0 0 120 120" className="ls-ring-svg" aria-hidden="true">
            <circle className="ls-ring-track" cx="60" cy="60" r={RADIUS} />
            <circle
              className="ls-ring-fill"
              cx="60"
              cy="60"
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <span className="ls-ring-label">
            {phase === 'loading' ? (
              <span className="ls-percent">{Math.floor(progress)}%</span>
            ) : (
              <span className="ls-enter">ENTER</span>
            )}
          </span>
        </button>

        <p className="ls-name">AFEEZ LUKMON</p>
        <p className={`ls-hint ${phase === 'ready' ? 'visible' : ''}`}>
          Press <kbd>Enter</kbd> or tap the circle to begin
        </p>
        <p className="sr-only" aria-live="polite">
          {phase === 'ready' ? 'Loaded. Press Enter to open the portfolio.' : ''}
        </p>
      </div>

      <svg className="ls-slash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="-2" y1="62.6" x2="102" y2="37.4" pathLength={1} />
      </svg>
    </div>
  );
}
