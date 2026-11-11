import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, crackIn, fadeUp } from '../lib/motion';
import { SOCIAL_LINKS } from '../lib/site';
import SectionHeader from './SectionHeader';
import './Creative.css';

const focusAreas = [
  {
    title: 'Brand identity',
    desc: 'Visual identities and brand assets that stay consistent across products and channels.',
  },
  {
    title: 'Marketing & social graphics',
    desc: 'Campaign, social media and promotional material designed for clarity and reach.',
  },
  {
    title: 'Print & layout',
    desc: 'Print-ready layouts and marketing collateral with attention to typography and hierarchy.',
  },
];

const tools = ['Adobe Photoshop', 'Adobe InDesign', 'Canva'];

const fiverr = SOCIAL_LINKS.find((l) => l.label === 'Fiverr');

export default function Creative() {
  return (
    <section id="creative" className="full-section creative" aria-labelledby="creative-heading">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <SectionHeader
            id="creative-heading"
            number="07"
            kicker="The Creative Edge"
            title="Design & Visual Communication"
            lead="A complementary skill alongside engineering. Practical graphic design experience helps me build interfaces and products that are clear, consistent and on-brand."
          />

          <motion.div className="creative-grid" variants={staggerFast}>
            {focusAreas.map((f) => (
              <motion.div key={f.title} className="card creative-card" variants={crackIn}>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="creative-footer" variants={fadeUp}>
            <div>
              <span className="creative-label">Tools</span>
              <ul className="creative-tools">
                {tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <p className="creative-note">
              How it shows up in my engineering: cleaner interface decisions, consistent product branding and
              smoother handover between design and code.
            </p>
            {fiverr && (
              <a className="project-link creative-link" href={fiverr.href} target="_blank" rel="noopener noreferrer">
                View design profile on Fiverr <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
