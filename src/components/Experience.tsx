import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, crackIn, fadeUp } from '../lib/motion';
import { experience } from '../data/experience';
import SectionHeader from './SectionHeader';
import { APPS_BUILT, clientCapabilities } from '../data/development';
import './Experience.css';

interface ExperienceProps {
  onNavigate?: (id: string) => void;
}

export default function Experience({ onNavigate }: ExperienceProps) {
  return (
    <section id="experience" className="full-section experience" aria-labelledby="experience-heading">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08 }}
          variants={staggerContainer}
        >
          <SectionHeader
            id="experience-heading"
            number="05"
            kicker="The Journey"
            title="Professional Experience"
            lead={`My experience goes beyond employment: alongside the roles below, I have independently delivered ${APPS_BUILT} web applications for businesses in different industries.`}
          />

          <motion.section className="client-work card" variants={crackIn} aria-labelledby="client-work-heading">
            <div className="client-work-intro">
              <span className="client-work-label">Independent client development</span>
              <h3 id="client-work-heading">{APPS_BUILT} applications, delivered end to end</h3>
              <p>
                As an independent developer I take client projects from requirements to a working system on my own,
                covering architecture, database, backend and interface. Recent examples include a camp management system for
                a client in North Carolina, USA, and a business portal for a UK biotechnology company.
              </p>
              <a
                className="project-link"
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  if (onNavigate) onNavigate('projects');
                  else document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                See the case studies <span aria-hidden="true">→</span>
              </a>
            </div>
            <ul className="client-capabilities" aria-label="Capabilities">
              {clientCapabilities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </motion.section>

          <motion.h3 className="experience-subhead" variants={fadeUp}>
            Employment &amp; ventures
          </motion.h3>

          <motion.ol className="timeline" variants={staggerFast}>
            {experience.map((item) => (
              <motion.li key={item.id} className="timeline-item" variants={crackIn}>
                <div className="timeline-meta">
                  <span className="company">{item.company}</span>
                  {item.period && <span className="period">{item.period}</span>}
                </div>
                <div className="timeline-content">
                  <h3>{item.role}</h3>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>
    </section>
  );
}
