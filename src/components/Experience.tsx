import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, crackIn } from '../lib/motion';
import { experience } from '../data/experience';
import SectionHeader from './SectionHeader';
import './Experience.css';

export default function Experience() {
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
            lead="Technical leadership, product building and web development across my own ventures and client work."
          />

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
