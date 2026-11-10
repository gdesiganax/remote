import { motion } from 'framer-motion';
import { fadeUp, staggerContainer, sliceIn, kickerReveal } from '../lib/motion';
import './Hero.css';

interface HeroProps {
  onNavigate: (id: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section id="home" className="full-section hero">
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
            <span className="chapter-sep">—</span>
            <span>The Awakening</span>
          </motion.p>

          <motion.div className="hero-badge" variants={fadeUp}>
            <span className="badge-dot" />
            Available for remote opportunities
          </motion.div>

          <motion.p className="hero-name" variants={fadeUp}>
            Afeez Lukmon Bamidele
          </motion.p>

          <div className="slice-heading-wrap hero-title-wrap">
            <motion.h1 className="hero-headline slice-heading" variants={sliceIn}>
              Building digital systems
              <br />
              <span className="accent">with precision.</span>
            </motion.h1>
            <motion.div
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
            Full-Stack Software Engineer · Backend Systems · SaaS · API & AI Integration
          </motion.p>

          <motion.p className="hero-desc" variants={fadeUp}>
            I design, engineer and develop digital products, backend systems and intelligent
            applications that transform ideas into functional business solutions.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp}>
            <button className="btn btn-primary" onClick={() => onNavigate('projects')}>
              Explore My Work
            </button>
            <button className="btn btn-ghost" onClick={() => onNavigate('contact')}>
              Let’s Connect
            </button>
          </motion.div>

          <motion.div className="hero-meta" variants={fadeUp}>
            <div className="meta-item">
              <span className="meta-label">Location</span>
              <span className="meta-value">Sagamu, Nigeria</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Focus</span>
              <span className="meta-value">Full-Stack · SaaS · AI</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Status</span>
              <span className="meta-value gold">Open to opportunities</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <button
        className="scroll-indicator"
        onClick={() => onNavigate('about')}
        aria-label="Scroll to about section"
      >
        <span>Scroll</span>
        <div className="scroll-line" />
      </button>
    </section>
  );
}
