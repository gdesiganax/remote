import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, sliceIn, kickerReveal } from '../lib/motion';
import { RESUME_URL, SOCIAL_LINKS } from '../lib/site';
import './Hero.css';

interface HeroProps {
  onNavigate: (id: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section id="home" className="full-section hero" aria-label="Introduction">
      <div className="hero-atmosphere" aria-hidden="true">
        <div className="hero-fog" />
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>

      <div className="container hero-inner">
        <motion.div
          className="hero-content"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p className="hero-chapter" variants={kickerReveal}>
            <span className="chapter-num">01</span>
            <span className="chapter-sep" aria-hidden="true">—</span>
            <span>The Awakening</span>
          </motion.p>

          <motion.div className="hero-badge" variants={fadeUp}>
            <span className="badge-dot" aria-hidden="true" />
            Open to remote software engineering roles
          </motion.div>

          <motion.h1 className="hero-name" variants={fadeUp}>
            Afeez Lukmon Bamidele
            <span className="sr-only">, Full-Stack Software Engineer</span>
          </motion.h1>

          <div className="slice-heading-wrap hero-title-wrap">
            <motion.p className="hero-headline slice-heading" variants={sliceIn}>
              Backend systems and SaaS products,
              <br />
              <span className="accent">built with precision.</span>
            </motion.p>
            <motion.div
              aria-hidden="true"
              className="slice-slash"
              variants={{
                hidden: { scaleX: 0, opacity: 0 },
                visible: {
                  scaleX: 1,
                  opacity: 1,
                  transition: { delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                },
              }}
            />
          </div>

          <motion.p className="hero-role" variants={fadeUp}>
            Full-Stack Software Engineer · Backend &amp; API Development · SaaS · AI Integration
          </motion.p>

          <motion.p className="hero-desc" variants={fadeUp}>
            Founder and lead developer of <strong>ReviewPulse</strong> and <strong>TravelPayy</strong>. I design
            data models, APIs and third-party integrations, including Google, payments and AI, and ship them as
            working products.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp}>
            <button type="button" className="btn btn-primary" onClick={() => onNavigate('projects')}>
              View Case Studies
            </button>
            {RESUME_URL && (
              <a className="btn btn-ghost" href={RESUME_URL} download>
                Download CV
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 4v12M6 10l6 6 6-6M5 20h14" />
                </svg>
              </a>
            )}
            <button type="button" className="btn btn-ghost" onClick={() => onNavigate('contact')}>
              Get in Touch
            </button>
          </motion.div>

          <motion.dl className="hero-meta" variants={fadeUp}>
            <div className="meta-item">
              <dt className="meta-label">Specialism</dt>
              <dd className="meta-value">Backend · SaaS · APIs</dd>
            </div>
            <div className="meta-item">
              <dt className="meta-label">Core stack</dt>
              <dd className="meta-value">PHP · Python / Flask · MySQL</dd>
            </div>
            <div className="meta-item">
              <dt className="meta-label">Availability</dt>
              <dd className="meta-value gold">Remote · International</dd>
            </div>
          </motion.dl>

          <motion.ul className="hero-social" variants={fadeUp} aria-label="Profiles">
            {SOCIAL_LINKS.filter((l) => l.label !== 'Fiverr').map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>
      </div>

      <button
        className="scroll-indicator"
        onClick={() => onNavigate('about')}
        aria-label="Scroll to about section"
      >
        <span aria-hidden="true">Scroll</span>
        <span className="scroll-line" aria-hidden="true" />
      </button>
    </section>
  );
}
