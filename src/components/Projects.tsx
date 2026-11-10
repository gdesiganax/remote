import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, fadeUp, crackIn } from '../lib/motion';
import { projects } from '../data/projects';
import SectionHeader from './SectionHeader';
import './Projects.css';

export default function Projects() {
  return (
    <section id="projects" className="full-section projects">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={staggerContainer}
        >
          <SectionHeader
            number="04"
            kicker="The Battleground"
            title="Featured Projects"
            lead="Selected software products and platforms I have founded, led or built — focused on solving real operational and business problems."
          />

          <motion.div className="projects-grid" variants={staggerFast}>
            {projects.map((p, index) => (
              <motion.article
                key={p.id}
                className={`card project-card ${p.featured ? 'featured' : ''}`}
                variants={crackIn}
              >
                <div className="project-top">
                  <span className="project-tag">{p.tag}</span>
                  {p.featured && <span className="project-badge">Featured</span>}
                </div>

                <h3 className="project-name">{p.name}</h3>
                <p className="project-role">{p.role}</p>
                <p className="project-desc">{p.description}</p>

                <div className="project-features">
                  <span className="features-label">Key capabilities</span>
                  <ul>
                    {p.features.slice(0, 5).map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                    {p.features.length > 5 && (
                      <li className="more">+{p.features.length - 5} more</li>
                    )}
                  </ul>
                </div>

                <div className="project-tech">
                  {p.tech.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>

                <div className="project-links">
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noreferrer" className="project-link">
                      Live Site →
                    </a>
                  )}
                  {p.appUrl && (
                    <a href={p.appUrl} target="_blank" rel="noreferrer" className="project-link">
                      Application →
                    </a>
                  )}
                </div>

                <span className="project-index">0{index + 1}</span>
              </motion.article>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
