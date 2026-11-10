import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, crackIn } from '../lib/motion';
import SectionHeader from './SectionHeader';
import './AI.css';

const aiItems = [
  {
    title: 'OpenAI API Integration',
    desc: 'Practical integration of OpenAI capabilities into business applications for intelligent features and automation.',
  },
  {
    title: 'Hugging Face Ecosystem',
    desc: 'Exploration and integration within the Hugging Face ecosystem for AI-assisted application features.',
  },
  {
    title: 'Replicate & Stable Diffusion',
    desc: 'Experience working with Replicate and the Stable Diffusion ecosystem for generative and AI-powered workflows.',
  },
  {
    title: 'AI-Assisted Business Features',
    desc: 'Building AI-assisted features such as intelligent review responses in ReviewPulse and other application workflows.',
  },
];

export default function AI() {
  return (
    <section id="ai" className="full-section ai-section">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerContainer}
        >
          <SectionHeader
            number="06"
            kicker="Beyond Code"
            title="AI & Intelligent Applications"
            lead="I approach AI as an engineering tool for solving business problems — integrating intelligent capabilities into practical applications rather than treating it as a trend."
          />

          <motion.div className="ai-grid" variants={staggerFast}>
            {aiItems.map((item) => (
              <motion.div key={item.title} className="card ai-card" variants={crackIn}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
