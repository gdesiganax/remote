import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { MotionConfig } from 'framer-motion';
import LoadingScreen from './components/LoadingScreen';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import AI from './components/AI';
import Creative from './components/Creative';
import Contact from './components/Contact';
import TransitionCounter from './components/TransitionCounter';
import { playSlashSound, unlockAudio } from './lib/sound';
import { SECTIONS, prefersReducedMotion } from './lib/site';
import './App.css';

const CURRENT_YEAR = new Date().getFullYear();

/** Section transition timing (keep in sync with --pt-duration in App.css). */
const TRANSITION_MS = 2000;
/** Moment the panels fully cover the screen (25% of the duration) plus a small margin. */
const COVERED_AT = 560;

const isSection = (id: string) => SECTIONS.some((s) => s.id === id);

/** Start on the page named in the URL hash (e.g. /#projects), otherwise Home. */
function initialPage(): string {
  const hash = typeof window === 'undefined' ? '' : window.location.hash.slice(1);
  return isSection(hash) ? hash : 'home';
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [transitioning, setTransitioning] = useState(false);
  const [chapterFlash, setChapterFlash] = useState<{ num: string; name: string } | null>(null);
  const pageRef = useRef(page);
  const navigatingRef = useRef(false);
  const navTimersRef = useRef<number[]>([]);

  const clearNavTimers = useCallback(() => {
    navTimersRef.current.forEach((t) => window.clearTimeout(t));
    navTimersRef.current = [];
  }, []);

  // Clear any pending navigation timeouts on unmount
  useEffect(() => clearNavTimers, [clearNavTimers]);

  // Unlock audio on first user interaction (required by browsers)
  useEffect(() => {
    const unlock = () => void unlockAudio();
    const opts = { once: true, passive: true } as const;
    window.addEventListener('pointerdown', unlock, opts);
    window.addEventListener('keydown', unlock, opts);
    window.addEventListener('touchstart', unlock, opts);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  /** Show a page: swap it in, start at its top and move focus to it. */
  const showPage = useCallback((id: string) => {
    pageRef.current = id;
    setPage(id);
    window.history.replaceState(null, '', id === 'home' ? window.location.pathname : `#${id}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Focus the new page after it renders, for keyboard and screen-reader users
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) {
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    });
  }, []);

  const handleNavigate = useCallback(
    (id: string) => {
      if (navigatingRef.current || !isSection(id)) return;
      // Same page: just return to its top
      if (id === pageRef.current) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const section = SECTIONS.find((s) => s.id === id);
      clearNavTimers();
      void unlockAudio();

      // Reduced motion: switch instantly, no overlay
      if (prefersReducedMotion()) {
        showPage(id);
        return;
      }

      navigatingRef.current = true;
      setTransitioning(true);
      playSlashSound();
      if (section) setChapterFlash({ num: section.num, name: section.name });

      navTimersRef.current.push(
        window.setTimeout(() => {
          // Screen is fully covered here: swap pages out of sight
          showPage(id);
          navTimersRef.current.push(
            window.setTimeout(() => {
              setTransitioning(false);
              setChapterFlash(null);
              navigatingRef.current = false;
            }, TRANSITION_MS - COVERED_AT),
          );
        }, COVERED_AT),
      );
    },
    [clearNavTimers, showPage],
  );

  // Hash links (e.g. a pasted /#contact URL or an in-page href) open that page
  useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (isSection(id) && id !== pageRef.current) handleNavigate(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [handleNavigate]);

  const handleReveal = useCallback(() => {
    window.scrollTo(0, 0);
    setRevealed(true);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setRevealed(true);
    setIsLoading(false);
  }, []);

  // Every page stays mounted (so form input and expanded case studies survive
  // switching); only the current one is shown.
  const pages: Record<string, ReactNode> = {
    home: <Hero onNavigate={handleNavigate} />,
    about: <About />,
    skills: <Skills />,
    projects: <Projects />,
    experience: <Experience onNavigate={handleNavigate} />,
    ai: <AI />,
    creative: <Creative />,
    contact: <Contact />,
  };

  return (
    <MotionConfig reducedMotion="user">
      {isLoading && <LoadingScreen onReveal={handleReveal} onComplete={handleLoadComplete} />}

      <div className={`page-transition ${transitioning ? 'active' : ''}`} aria-hidden="true">
        <div className="pt-panel pt-panel-a" />
        <div className="pt-panel pt-panel-b" />
        <svg className="pt-seam" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="-2" y1="62.6" x2="102" y2="37.4" pathLength={1} />
        </svg>
        {chapterFlash && (
          <div className="chapter-flash">
            <span className="flash-num">{chapterFlash.num}</span>
            <span className="flash-name">{chapterFlash.name}</span>
            <TransitionCounter startMs={620} endMs={1380} />
          </div>
        )}
      </div>

      <div className={`app ${revealed ? '' : 'hidden'}`} inert={!revealed}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Navbar onNavigate={handleNavigate} activeSection={page} />

        <main id="main" tabIndex={-1}>
          {SECTIONS.map((s) => (
            <div key={s.id} className="page" hidden={page !== s.id}>
              {pages[s.id]}
            </div>
          ))}
        </main>

        <footer className="footer">
          <div className="container footer-inner">
            <p>© {CURRENT_YEAR} Afeez Lukmon Bamidele. Engineering ideas into reality</p>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}

export default App;
