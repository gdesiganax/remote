import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, crackIn, fadeUp } from '../lib/motion';
import SectionHeader from './SectionHeader';
import './AI.css';

/** AI features shipped in ReviewPulse (OpenAI API). */
const shipped = [
  {
    title: 'AI-drafted review replies',
    desc: 'Suggested responses to Google reviews that the business can edit before posting.',
  },
  {
    title: 'Review analysis',
    desc: 'AI-generated analysis of all the reviews for a business location.',
  },
  {
    title: 'Google post campaigns',
    desc: 'Batches of distinct Google Business Profile posts, generated to a fixed JSON schema and checked against Google’s content rules before scheduling.',
  },
];

const explored = ['Hugging Face', 'Replicate', 'Stable Diffusion'];

const approach = [
  'Structured output (JSON mode), validated before anything is saved or published',
  'Prompts that encode platform rules, such as no links or contact details in Google posts',
  'API keys kept server-side in environment variables',
];

export default function AI() {
  return (
    <section id="ai" className="full-section ai-section" aria-labelledby="ai-heading">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          <SectionHeader
            id="ai-heading"
            number="06"
            kicker="Beyond Code"
            title="AI & Intelligent Applications"
            lead="I treat AI as an engineering tool: integrated where it saves users real time, with the same validation and safeguards as any other part of the system."
          />

          <motion.div variants={fadeUp} className="ai-subhead">
            <span className="status-pill status-live">In production</span>
            <span className="ai-subhead-text">OpenAI API features in ReviewPulse</span>
          </motion.div>

          <motion.div className="ai-grid" variants={staggerFast}>
            {shipped.map((item) => (
              <motion.div key={item.title} className="card ai-card" variants={crackIn}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className="ai-bottom" variants={fadeUp}>
            <div className="ai-panel">
              <h3 className="ai-panel-title">How I integrate AI</h3>
              <ul className="case-list">
                {approach.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
            <div className="ai-panel">
              <h3 className="ai-panel-title">Also explored</h3>
              <ul className="ai-chips">
                {explored.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
              <p className="ai-panel-note">Open-model and generative-image ecosystems I have worked with outside production.</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
