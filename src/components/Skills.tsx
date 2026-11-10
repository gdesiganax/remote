import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, fadeUp, crackIn } from '../lib/motion';
import { skillCategories } from '../data/skills';
import SectionHeader from './SectionHeader';
import './Skills.css';

export default function Skills() {
  return (
    <section id="skills" className="full-section skills">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <SectionHeader
            number="03"
            kicker="The Arsenal"
            title="Technical Capabilities"
            lead="Practical engineering skills organised by domain. Focused on building reliable systems, SaaS products and intelligent applications."
          />

          <motion.div className="skills-grid" variants={staggerFast}>
            {skillCategories.map((cat) => (
              <motion.div key={cat.id} className="skill-category card" variants={crackIn}>
                <h3 className="skill-cat-title">{cat.title}</h3>
                <ul className="skill-list">
                  {cat.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
