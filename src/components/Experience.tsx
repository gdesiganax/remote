import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, fadeUp, crackIn } from '../lib/motion';
import { experience } from '../data/experience';
import SectionHeader from './SectionHeader';
import './Experience.css';

export default function Experience() {
  return (
    <section id="experience" className="full-section experience">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.12 }}
          variants={staggerContainer}
        >
          <SectionHeader
            number="05"
            kicker="The Journey"
            title="Professional Experience"
          />

          <motion.div className="timeline" variants={staggerFast}>
            {experience.map((item, index) => (
              <motion.div key={item.id} className="timeline-item" variants={crackIn}>
                <div className="timeline-marker">
                  <span className="marker-dot" />
                  {index < experience.length - 1 && <span className="marker-line" />}
                </div>
                <div className="timeline-content card">
                  <div className="timeline-header">
                    <h3>{item.role}</h3>
                    <span className="company">{item.company}</span>
                  </div>
                  {item.period && <span className="period">{item.period}</span>}
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
