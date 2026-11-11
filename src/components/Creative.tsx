import { motion } from 'framer-motion';
import { staggerContainer,  crackIn } from '../lib/motion';
import SectionHeader from './SectionHeader';
import './Creative.css';

export default function Creative() {
  return (
    <section id="creative" className="full-section creative">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <SectionHeader
            number="07"
            kicker="The Creative Edge"
            title="Visual Communication"
          />

          <motion.div className="creative-content" variants={crackIn}>
            <p className="creative-lead">
              In addition to software engineering, I have practical experience in graphic design
              and visual communication. This secondary capability strengthens my ability to approach
              software products with a clearer understanding of user experience, branding and
              visual presentation.
            </p>

            <div className="creative-tools">
              <span>Adobe Photoshop</span>
              <span>Adobe InDesign</span>
              <span>Canva</span>
              <span>Brand Identity</span>
              <span>Social Media Graphics</span>
              <span>Print Design</span>
              <span>Marketing Materials</span>
            </div>

            <p className="creative-note">
              This remains a complementary strength. My primary professional identity is Full-Stack
              Software Engineer.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
