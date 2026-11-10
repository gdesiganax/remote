import { useState, useCallback, useEffect, useRef } from 'react';
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
import './App.css';

const SECTIONS = [
  { id: 'home', num: '01', name: 'The Awakening' },
  { id: 'about', num: '02', name: 'The Engineer' },
  { id: 'skills', num: '03', name: 'The Arsenal' },
  { id: 'projects', num: '04', name: 'The Battleground' },
  { id: 'experience', num: '05', name: 'The Journey' },
  { id: 'ai', num: '06', name: 'Beyond Code' },
  { id: 'creative', num: '07', name: 'The Creative Edge' },
  { id: 'contact', num: '08', name: 'The Final Chapter' },
];

function getSectionInView(): string {
  const mid = window.innerHeight * 0.4;
  let current = SECTIONS[0].id;
  for (const s of SECTIONS) {
    const el = document.getElementById(s.id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.top <= mid && rect.bottom > mid) {
      current = s.id;
      break;
    }
  }
  return current;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [transitioning, setTransitioning] = useState(false);
  const [chapterFlash, setChapterFlash] = useState<{ num: string; name: string } | null>(null);
  const lastSectionRef = useRef('home');
  const soundEnabledRef = useRef(false);
  const cooldownRef = useRef(0);
  const navigatingRef = useRef(false);

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

  const handleNavigate = useCallback((id: string) => {
    const section = SECTIONS.find((s) => s.id === id);
    navigatingRef.current = true;
    setTransitioning(true);
    void unlockAudio();
    soundEnabledRef.current = true;
    playSlashSound();
    cooldownRef.current = Date.now();
    lastSectionRef.current = id;

    if (section) {
      setChapterFlash({ num: section.num, name: section.name });
    }

    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      setActiveSection(id);
      setTimeout(() => {
        setTransitioning(false);
        setChapterFlash(null);
        navigatingRef.current = false;
      }, 650);
    }, 420);
  }, []);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}

      <div className={`page-transition ${transitioning ? 'active' : ''}`}>
        <div className="slash-blade" />
        <div className="slash-blade secondary" />
        <div className="slash-crack" />
        <div className="slash-crack alt" />
        <div className="slash-ink" />
        {chapterFlash && (
          <div className="chapter-flash">
            <span className="flash-num">{chapterFlash.num}</span>
            <span className="flash-name">{chapterFlash.name}</span>
          </div>
        )}
      </div>

      <div className={`app ${isLoading ? 'hidden' : ''}`}>
        <Navbar onNavigate={handleNavigate} activeSection={activeSection} />

        <nav className="section-dots" aria-label="Section navigation">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`dot ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => handleNavigate(s.id)}
              aria-label={`Go to ${s.name}`}
              title={`${s.num} ${s.name}`}
            />
          ))}
        </nav>

        <main>
          <Hero onNavigate={handleNavigate} />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <AI />
          <Creative />
          <Contact />
        </main>

        <footer className="footer">
          <div className="container footer-inner">
            <span className="footer-kanji">侍</span>
            <p>© {new Date().getFullYear()} Afeez Lukmon Bamidele — Built with precision</p>
          </div>
        </footer>
      </div>
    </>
  );
}

export default App;
