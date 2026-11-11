import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, crackIn } from '../lib/motion';
import { skillTiers } from '../data/skills';
import SectionHeader from './SectionHeader';
import './Skills.css';

export default function Skills() {
  return (
    <section id="skills" className="full-section skills" aria-labelledby="skills-heading">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          <SectionHeader
            id="skills-heading"
            number="03"
            kicker="The Arsenal"
            title="Technical Capabilities"
            lead="Grouped by depth of experience, from the stack I ship production systems with to tools I have explored."
          />

          <motion.div className="skills-grid" variants={staggerFast}>
            {skillTiers.map((tier, i) => (
              <motion.section
                key={tier.id}
                className={`skill-tier card tier-${tier.id}`}
                variants={crackIn}
                aria-labelledby={`tier-${tier.id}`}
              >
                <header className="tier-head">
                  <span className="tier-rank" aria-hidden="true">
                    0{i + 1}
                  </span>
                  <h3 id={`tier-${tier.id}`} className="skill-cat-title">
                    {tier.title}
                  </h3>
                  <p className="tier-summary">{tier.summary}</p>
                </header>

                <dl className="tier-groups">
                  {tier.groups.map((g) => (
                    <div key={g.label} className="tier-group">
                      <dt>{g.label}</dt>
                      <dd>
                        <ul className="skill-chips">
                          {g.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ))}
                </dl>
              </motion.section>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
