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
const INTRO_VIDEO = '/video/intro_vid.mp4';
const VIDEO_START_TIMEOUT = 8000; // give up on the intro if it has not started playing by now
const VIDEO_STALL_TIMEOUT = 10000; // ...or if it stops buffering mid-way for this long
const VIDEO_FADE_MS = 700; // keep in sync with the .ls-video transition

/** Phones (portrait, or landscape with a short screen) get the portrait image instead of the film. */
const MOBILE_QUERY = '(max-width: 768px), (pointer: coarse) and (max-height: 500px)';

/** Skip the intro film on mobile and for reduced-motion and data-saver visitors. */
function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined' || prefersReducedMotion()) return false;
  if (window.matchMedia?.(MOBILE_QUERY).matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !conn?.saveData;
}

/** Jump a paused video to its final frame (bounded wait, so Skip never hangs). */
function seekToEnd(video: HTMLVideoElement): Promise<void> {
  return new Promise((resolve) => {
    if (!(video.duration > 0) || !Number.isFinite(video.duration)) return resolve();
    const done = () => {
      window.clearTimeout(timer);
      video.removeEventListener('seeked', done);
      resolve();
    };
    const timer = window.setTimeout(done, 1500);
    video.addEventListener('seeked', done);
    video.currentTime = Math.max(0, video.duration - 0.05);
  });
}

/** Snapshot the frame currently shown by the video as an object URL (null if unavailable). */
async function captureFrame(video: HTMLVideoElement): Promise<string | null> {
  if (video.readyState < 2 || !video.videoWidth) return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.9));
    if (!blob) return null;
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    await img.decode().catch(() => {}); // decoded before it is shown → no flash
    return url;
  } catch {
    return null;
  }
}
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
  // Intro film: plays first; the ring/text only appear once it ends (or is skipped / fails)
  const [videoActive, setVideoActive] = useState(shouldPlayIntro);
  const [videoLeaving, setVideoLeaving] = useState(false);
  const [videoEnding, setVideoEnding] = useState(false); // controls hide at once on skip/end
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const videoDoneRef = useRef(!videoActive);
  const mountedRef = useRef(true);
  // Final frame of the film, shown behind the ENTER ring (and split by the slice)
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const frameUrlRef = useRef<string | null>(null);
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

  // Release the captured final frame when the screen unmounts
  useEffect(() => () => {
    if (frameUrlRef.current) URL.revokeObjectURL(frameUrlRef.current);
  }, []);

  /**
   * End the intro film and hand over to the normal intro. When it finished (or was
   * skipped), its final frame stays on screen as the backdrop behind the ENTER ring.
   */
  const finishVideo = useCallback(async (mode: 'end' | 'skip' | 'fail') => {
    if (videoDoneRef.current) return;
    videoDoneRef.current = true;
    setVideoEnding(true);
    const video = videoRef.current;
    let url: string | null = null;
    if (video) {
      video.pause();
      video.muted = true;
      if (mode === 'skip') await seekToEnd(video);
      if (mode !== 'fail') url = await captureFrame(video);
    }
    if (!mountedRef.current) {
      if (url) URL.revokeObjectURL(url);
      return;
    }
    if (url) {
      frameUrlRef.current = url;
      setFrameUrl(url);
    }
    setVideoLeaving(true);
    timersRef.current.push(window.setTimeout(() => setVideoActive(false), VIDEO_FADE_MS));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Start the intro film muted (autoplay-safe) and watch for anything that would leave it stuck
  useEffect(() => {
    const video = videoRef.current;
    if (!videoActive || !video) return;
    let stallTimer = 0;
    const onFail = () => void finishVideo('fail');
    const onEnded = () => void finishVideo('end');
    const startTimer = window.setTimeout(onFail, VIDEO_START_TIMEOUT);
    const clearStall = () => window.clearTimeout(stallTimer);

    const onPlaying = () => {
      window.clearTimeout(startTimer);
      clearStall();
    };
    const onWaiting = () => {
      clearStall();
      stallTimer = window.setTimeout(onFail, VIDEO_STALL_TIMEOUT);
    };
    const onTime = () => {
      clearStall();
      if (video.duration > 0) setVideoProgress(video.currentTime / video.duration);
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onWaiting);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onFail);

    video.muted = true; // set the property too: the attribute alone is not enough everywhere
    if (!video.getAttribute('src')) video.src = INTRO_VIDEO; // set here so cleanup can release it
    let cancelled = false;
    // Autoplay blocked (e.g. iOS low-power mode) → go straight on to the normal intro
    video.play()?.catch(() => {
      if (!cancelled) onFail();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(startTimer);
      clearStall();
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onWaiting);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onFail);
      // Stop playback and release the download
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [videoActive, finishVideo]);

  // Keyboard users can reach the video controls straight away
  useEffect(() => {
    skipRef.current?.focus({ preventScroll: true });
  }, []);

  const toggleVideoSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setVideoMuted(nextMuted);
    // Some browsers pause when unmuting; this click is a user gesture, so resume
    if (!nextMuted && video.paused && !video.ended) void video.play().catch(() => {});
  }, []);

  // Fill the ring: time-based, but holds near the end until assets are ready
  useEffect(() => {
    if (videoActive && !videoLeaving) return; // wait for the intro film
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
  }, [imageReady, setPhase, reduced, videoActive, videoLeaving]);

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
      if (!videoDoneRef.current) {
        // During the film: Escape skips; leave Enter/Space to the focused control
        if (e.key === 'Escape') void finishVideo('skip');
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
  }, [enter, finishVideo]);

  const dashOffset = CIRCUMFERENCE * (1 - progress / 100);
  const bgStyle = { '--ls-bg': `url("${BG_IMAGE}")` } as CSSProperties;

  // Shared visual layer, rendered into both halves so the slice splits it cleanly
  const scene = (
    <>
      {frameUrl ? (
        <div className="ls-frame" style={{ '--ls-frame': `url("${frameUrl}")` } as CSSProperties} />
      ) : (
        <div className={`ls-image ${imageReady ? 'visible' : ''}`} style={bgStyle} />
      )}
      <div className="ls-vignette" />
    </>
  );

  return (
    <div
      className={`loading-screen phase-${phase} ${reduced ? 'reduced' : ''} ${videoActive && !videoLeaving ? 'video-playing' : ''} ${frameUrl ? 'has-frame' : ''}`}
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

      {videoActive && (
        <div className={`ls-video ${videoLeaving ? 'leaving' : ''}`}>
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
          <div className="ls-video-overlay" aria-hidden="true" />

          <div className={`ls-video-controls ${videoEnding ? 'hidden' : ''}`}>
            <button
              type="button"
              className={`ls-video-btn ls-icon-btn ls-sound ${videoMuted ? '' : 'on'}`}
              onClick={toggleVideoSound}
              aria-pressed={!videoMuted}
              aria-label="Intro video sound"
              title={videoMuted ? 'Turn sound on' : 'Mute'}
            >
              {videoMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path d="m22 9-6 6M16 9l6 6" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="M11 5 6 9H2v6h4l5 4V5z" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
                </svg>
              )}
            </button>

            <button
              ref={skipRef}
              type="button"
              className="ls-video-btn ls-skip"
              onClick={() => void finishVideo('skip')}
              aria-label="Skip intro video"
            >
              <span className="ls-video-btn-label" aria-hidden="true">Skip</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 4 10 8-10 8V4z" />
                <path d="M19 5v14" />
              </svg>
            </button>
          </div>

          <div className="ls-video-progress" aria-hidden="true">
            <span style={{ transform: `scaleX(${videoProgress})` }} />
          </div>
        </div>
      )}

      <svg className="ls-slash" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="-2" y1="62.6" x2="102" y2="37.4" pathLength={1} />
      </svg>
    </div>
  );
}
