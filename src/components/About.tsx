import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, slideFromLeft, crackIn } from '../lib/motion';
import SectionHeader from './SectionHeader';
import './About.css';

const facts = [
  { label: 'Role', value: 'Full-Stack Software Engineer', note: 'Backend · SaaS · API & AI integration' },
  { label: 'Ventures', value: 'ReviewPulse · TravelPayy', note: 'Founder and technical lead' },
  { label: 'Education', value: 'B.Sc. (Ed.) Computer Science', note: 'Tai Solarin University of Education' },
  { label: 'Based in', value: 'Ogun, Nigeria', note: 'Open to remote and international roles' },
];

const principles = [
  {
    title: 'Product thinking',
    desc: 'Start from the business problem, then choose the simplest architecture that solves it well.',
  },
  {
    title: 'Reliable backends',
    desc: 'Clean data models, safe payment and API flows, and integrations that fail gracefully.',
  },
  {
    title: 'End-to-end ownership',
    desc: 'From database design and APIs to the interface and the release.',
  },
];

export default function About() {
  return (
    <section id="about" className="full-section about" aria-labelledby="about-heading">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          <SectionHeader id="about-heading" number="02" kicker="The Engineer" title="Behind the Code" />

          <div className="about-grid">
            <motion.div className="about-main" variants={slideFromLeft}>
              <p className="about-lead">
                I am a full-stack software engineer and technology entrepreneur. I design, build and maintain web
                applications, SaaS platforms, backend systems and API integrations.
              </p>
              <p>
                My work combines hands-on engineering with product thinking. As founder and technical lead of{' '}
                <strong>ReviewPulse</strong>, a reputation-management SaaS, and <strong>TravelPayy</strong>, a
                peer-to-peer logistics platform under ROUTYY Limited, I take products from idea to working software.
              </p>
              <blockquote className="about-philosophy">
                <p>
                  Good software is not defined by how complicated it looks, but by how effectively it solves real
                  problems.
                </p>
              </blockquote>
            </motion.div>

            <motion.dl className="about-facts card" variants={crackIn}>
              {facts.map((f) => (
                <div key={f.label} className="about-fact">
                  <dt>{f.label}</dt>
                  <dd>
                    <span className="fact-value">{f.value}</span>
                    <span className="fact-note">{f.note}</span>
                  </dd>
                </div>
              ))}
            </motion.dl>
          </div>

          <motion.ul className="about-principles" variants={staggerFast} aria-label="How I work">
            {principles.map((p, i) => (
              <motion.li key={p.title} className="principle" variants={crackIn}>
                <span className="principle-num" aria-hidden="true">
                  0{i + 1}
                </span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </section>
  );
}
