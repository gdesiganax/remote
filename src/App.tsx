import { useState, useCallback, useEffect, useRef } from 'react';
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
import { playSlashSound, unlockAudio } from './lib/sound';
import { SECTIONS, prefersReducedMotion } from './lib/site';
import { currentSectionIndex, useSectionScroll, type NavigateOptions } from './lib/useSectionScroll';
import TransitionCounter from './components/TransitionCounter';
import './App.css';

const CURRENT_YEAR = new Date().getFullYear();

/** Section transition timing (keep in sync with --pt-duration in App.css). */
const TRANSITION_MS = 2000;
/** Moment the panels fully cover the screen (25% of the duration) plus a small margin. */
const COVERED_AT = 560;

const getSectionInView = (): string => SECTIONS[currentSectionIndex()].id;

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [transitioning, setTransitioning] = useState(false);
  const [chapterFlash, setChapterFlash] = useState<{ num: string; name: string } | null>(null);
  const lastSectionRef = useRef('home');
  const soundEnabledRef = useRef(false);
  const cooldownRef = useRef(0);
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
    const unlock = () => {
      void unlockAudio();
      soundEnabledRef.current = true;
    };
    const opts = { once: true, passive: true } as const;
    window.addEventListener('pointerdown', unlock, opts);
    window.addEventListener('keydown', unlock, opts);
    window.addEventListener('touchstart', unlock, opts);
    // Also unlock on first real scroll gesture
    window.addEventListener('wheel', unlock, opts);
    window.addEventListener('touchmove', unlock, opts);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('wheel', unlock);
      window.removeEventListener('touchmove', unlock);
    };
  }, []);

  // Scroll-driven section detection + sound
  useEffect(() => {
    if (isLoading) return;

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (navigatingRef.current) return;

        const id = getSectionInView();
        setActiveSection(id);

        if (id !== lastSectionRef.current) {
          lastSectionRef.current = id;
          const now = Date.now();
          if (soundEnabledRef.current && now - cooldownRef.current > 500) {
            cooldownRef.current = now;
            playSlashSound();
          }
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Initial sync without sound
    lastSectionRef.current = getSectionInView();
    setActiveSection(lastSectionRef.current);

    return () => window.removeEventListener('scroll', onScroll);
  }, [isLoading]);

  const handleNavigate = useCallback((id: string, opts: NavigateOptions = {}) => {
    const { align = 'start', focus = true } = opts;
    // Ignore clicks while a transition is already running
    if (navigatingRef.current) return;
    const section = SECTIONS.find((s) => s.id === id);
    const el = document.getElementById(id);
    clearNavTimers();
    void unlockAudio();
    soundEnabledRef.current = true;
    cooldownRef.current = Date.now();
    lastSectionRef.current = id;
    setActiveSection(id);

    const jump = (behavior: ScrollBehavior) => {
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const tall = el.offsetHeight > window.innerHeight;
      // Moving up into a tall section lands at its end, so nothing is skipped
      const y = align === 'end' && tall ? top + el.offsetHeight - window.innerHeight : top;
      window.scrollTo({ top: y, behavior });
    };

    const focusTarget = () => {
      // Move keyboard / screen-reader focus to the section heading area
      if (focus && el) {
        el.setAttribute('tabindex', '-1');
        el.focus({ preventScroll: true });
      }
    };

    // Reduced motion: jump straight there, no slash overlay
    if (prefersReducedMotion()) {
      jump('auto');
      focusTarget();
      return;
    }

    navigatingRef.current = true;
    setTransitioning(true);
    playSlashSound();
    if (section) setChapterFlash({ num: section.num, name: section.name });

    navTimersRef.current.push(
      window.setTimeout(() => {
        // Screen is fully covered here: jump instantly, no visible scroll
        jump('instant');
        focusTarget();
        navTimersRef.current.push(
          window.setTimeout(() => {
            setTransitioning(false);
            setChapterFlash(null);
            navigatingRef.current = false;
          }, TRANSITION_MS - COVERED_AT),
        );
      }, COVERED_AT),
    );
  }, [clearNavTimers]);

  // Scrolling past a section edge (wheel, swipe, keyboard) runs the same transition
  const [reducedMotion] = useState(prefersReducedMotion);
  useSectionScroll({
    enabled: !isLoading && !reducedMotion,
    transitionMs: TRANSITION_MS,
    isNavigating: () => navigatingRef.current,
    navigate: handleNavigate,
  });

  const handleReveal = useCallback(() => {
    window.scrollTo(0, 0);
    setRevealed(true);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setRevealed(true);
    setIsLoading(false);
  }, []);

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
        <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

        <nav className="section-dots" aria-label="Section navigation">
          {SECTIONS.map((s) => (
            <button
              type="button"
              key={s.id}
              className={`dot ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => handleNavigate(s.id)}
              aria-label={`${s.num} ${s.label}`}
              aria-current={activeSection === s.id ? 'location' : undefined}
              title={`${s.num} ${s.label}`}
            />
          ))}
        </nav>

        <main id="main" tabIndex={-1}>
          <Hero onNavigate={handleNavigate} />
          <About />
          <Skills />
          <Projects />
          <Experience onNavigate={handleNavigate} />
          <AI />
          <Creative />
          <Contact />
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
