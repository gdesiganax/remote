import { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../lib/theme';
import { useSoundPreference } from '../lib/useSound';
import { RESUME_URL, SECTIONS } from '../lib/site';
import './Navbar.css';

interface NavbarProps {
  onNavigate: (id: string) => void;
  activeSection: string;
}

const MOBILE_QUERY = '(max-width: 1080px)';

export default function Navbar({ onNavigate, activeSection }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const sound = useSoundPreference();
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false);
    if (restoreFocus) toggleRef.current?.focus();
  }, []);

  // Mobile menu: focus management, Escape to close, focus trap, scroll lock
  useEffect(() => {
    if (!menuOpen) return;

    const nav = navRef.current;
    const focusables = () =>
      [
        ...(nav ? Array.from(nav.querySelectorAll<HTMLElement>('a, button')) : []),
        toggleRef.current,
      ].filter((el): el is HTMLElement => !!el);

    focusables()[0]?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu(true);
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // Close if the viewport grows past the mobile breakpoint
    const mq = window.matchMedia(MOBILE_QUERY);
    const onMq = () => {
      if (!mq.matches) setMenuOpen(false);
    };

    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen, closeMenu]);

  const handleClick = (id: string) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner container">
        <a
          href="#home"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            handleClick('home');
          }}
        >
          <span className="logo-text">Afeez Lukmon</span>
        </a>

        <nav
          id="primary-navigation"
          ref={navRef}
          className={`nav-links ${menuOpen ? 'open' : ''}`}
          aria-label="Primary"
        >
          {SECTIONS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`nav-link ${activeSection === item.id ? 'active' : ''}`}
              aria-current={activeSection === item.id ? 'location' : undefined}
              onClick={(e) => {
                e.preventDefault();
                handleClick(item.id);
              }}
            >
              {item.label}
            </a>
          ))}
          {RESUME_URL && (
            <a className="nav-link nav-resume-mobile" href={RESUME_URL} download>
              Download CV
            </a>
          )}
        </nav>

        <div
          className={`nav-backdrop ${menuOpen ? 'open' : ''}`}
          onClick={() => closeMenu(false)}
          aria-hidden="true"
        />

        <div className="nav-actions">
          {RESUME_URL && (
            <a className="nav-resume" href={RESUME_URL} download>
              CV
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 4v12M6 10l6 6 6-6M5 20h14" />
              </svg>
            </a>
          )}

          <button
            type="button"
            className="icon-toggle"
            onClick={sound.toggle}
            aria-pressed={sound.enabled}
            aria-label="Sound effects"
            title={sound.enabled ? 'Mute sound effects' : 'Turn on sound effects'}
          >
            {sound.enabled ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M11 5 6 9H2v6h4l5 4V5z" />
                <path d="m22 9-6 6M16 9l6 6" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className="icon-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            ref={toggleRef}
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => (menuOpen ? closeMenu(false) : setMenuOpen(true))}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
