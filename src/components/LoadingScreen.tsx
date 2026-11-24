import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { playSlashSound, unlockAudio } from '../lib/sound';
import { prefersReducedMotion } from '../lib/site';
import './LoadingScreen.css';

interface LoadingScreenProps {
  /** Called when the exit begins, so the main page can be revealed underneath. */
  onReveal?: () => void;
  /** Called once the exit animation has finished and the screen can unmount. */
  onComplete: () => void;
}

// Compressed WebP of 'Confident White Samurai Portrait.png' (the PNG is kept for social previews)
const BG_IMAGE = '/images/samurai-portrait.webp';
/** Entry film, played full-screen after Enter is pressed (it carries its own katana slash). */
const ENTRY_VIDEO = '/video/new_vid.mp4';
const MIN_DURATION = 2600; // ms the ring takes to fill when everything loads fast
const MAX_WAIT = 8000; // never hold visitors longer than this, even if assets stall
const VIDEO_START_TIMEOUT = 5000; // give up on the film if it has not started by now
const VIDEO_STALL_TIMEOUT = 6000; // ...or if it stops buffering mid-way for this long
const VIDEO_SLASH_AT = 0.8; // s into the film where its slash lands (for the sound effect)
const FADE_MS = 800; // keep in sync with .phase-fading transition
const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Phase = 'loading' | 'ready' | 'entering' | 'playing' | 'fading' | 'slicing';

export default function LoadingScreen({ onReveal, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhaseState] = useState<Phase>('loading');
  const [imageReady, setImageReady] = useState(false);
  const phaseRef = useRef<Phase>('loading');
  const ringRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoFailedRef = useRef(false);
  const exitingRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const [reduced] = useState(prefersReducedMotion);
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);
  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  // Preload the background image
  useEffect(() => {
    const img = new Image();
    const done = () => setImageReady(true);
    img.onload = done;
    img.onerror = done; // never block the site on a missing image
    img.src = BG_IMAGE;
  }, []);

  // Lock page scrolling behind the loading screen (the site underneath is only faded out)
  useEffect(() => {
    const root = document.documentElement;
    const prevRoot = root.style.overflow;
    const prevBody = document.body.style.overflow;
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prevRoot;
      document.body.style.overflow = prevBody;
    };
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

  // Move focus to the Enter button once it is available, and to Skip while the film plays
  useEffect(() => {
    if (phase === 'ready') ringRef.current?.focus({ preventScroll: true });
    if (phase === 'playing') skipRef.current?.focus({ preventScroll: true });
  }, [phase]);

  // Clear pending timers if unmounted mid-transition
  useEffect(() => () => timersRef.current.forEach((t) => window.clearTimeout(t)), []);

  /** Original exit: brighten the samurai, slice the screen open, unmount. */
  const sliceOut = useCallback(
    (brighten: number) => {
      if (exitingRef.current) return;
      exitingRef.current = true;
      later(() => {
        if (!reduced) playSlashSound();
        setPhase('slicing');
        onReveal?.();
        later(onComplete, reduced ? 0 : 1100);
      }, brighten);
    },
    [later, onReveal, onComplete, setPhase, reduced],
  );

  /** Film finished (or skipped): fade the screen away to reveal the portfolio. */
  const fadeOut = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    videoRef.current?.pause();
    setPhase('fading');
    onReveal?.();
    later(onComplete, FADE_MS);
  }, [later, onReveal, onComplete, setPhase]);

  /** Film could not play: fall back to the original slice exit. */
  const videoFailed = useCallback(() => {
    videoFailedRef.current = true;
    if (phaseRef.current === 'playing') {
      videoRef.current?.pause();
      sliceOut(0);
    }
  }, [sliceOut]);

  // Film events: finish → fade out; error/stall → fall back. All removed on unmount.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduced) return;
    let stallTimer = 0;
    let slashPlayed = false;
    const clearStall = () => window.clearTimeout(stallTimer);
    const onWaiting = () => {
      if (phaseRef.current !== 'playing') return;
      clearStall();
      stallTimer = window.setTimeout(fadeOut, VIDEO_STALL_TIMEOUT);
    };
    const onTime = () => {
      clearStall();
      if (!slashPlayed && video.currentTime >= VIDEO_SLASH_AT) {
        slashPlayed = true;
        playSlashSound();
      }
    };

    video.addEventListener('ended', fadeOut);
    video.addEventListener('error', videoFailed);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onWaiting);
    video.addEventListener('playing', clearStall);
    video.addEventListener('timeupdate', onTime);

    video.muted = true; // the film is silent; muted also keeps every browser happy to play it
    if (!video.getAttribute('src')) video.src = ENTRY_VIDEO; // set here so cleanup can release it

    return () => {
      clearStall();
      video.removeEventListener('ended', fadeOut);
      video.removeEventListener('error', videoFailed);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onWaiting);
      video.removeEventListener('playing', clearStall);
      video.removeEventListener('timeupdate', onTime);
      // Stop playback and release the download
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [reduced, fadeOut, videoFailed]);

  const enter = useCallback(() => {
    if (phaseRef.current !== 'ready') return;
    void unlockAudio();
    const video = videoRef.current;

    // Reduced motion, or the film already failed to load: original slice exit
    if (reduced || !video || videoFailedRef.current) {
      setPhase('entering');
      sliceOut(reduced ? 0 : 900);
      return;
    }

    setPhase('playing');
    video.currentTime = 0;
    // Called inside the click, so it counts as a user gesture
    video.play()?.catch(videoFailed);
    // Never get stuck if the film does not start
    later(() => {
      if (phaseRef.current === 'playing' && video.currentTime === 0) videoFailed();
    }, VIDEO_START_TIMEOUT);
  }, [later, reduced, setPhase, sliceOut, videoFailed]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phaseRef.current === 'playing') {
        // During the film: Escape skips; leave Enter/Space to the focused Skip button
        if (e.key === 'Escape') fadeOut();
        return;
      }
      // Enter anywhere; the focused button also handles Space natively
      if (e.key === 'Enter' && !e.repeat) {
        e.preventDefault();
        enter();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enter, fadeOut]);

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

      {/* Entry film: preloaded while the ring fills, shown once Enter is pressed */}
      {!reduced && (
        <div className="ls-video" aria-hidden={phase !== 'playing'}>
          <video
            ref={videoRef}
            className="ls-video-media"
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
          />
          <button
            ref={skipRef}
            type="button"
            className="ls-video-btn ls-skip"
            onClick={fadeOut}
            tabIndex={phase === 'playing' ? 0 : -1}
            aria-label="Skip intro video"
          >
            <span aria-hidden="true">Skip</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 4 10 8-10 8V4z" />
              <path d="M19 5v14" />
            </svg>
          </button>
        </div>
      )}

      <svg className="ls-slash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="-2" y1="62.6" x2="102" y2="37.4" pathLength={1} />
      </svg>
    </div>
  );
}
