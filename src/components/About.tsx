import { motion } from 'framer-motion';
import { staggerContainer, slideFromLeft, slideFromRight, crackIn } from '../lib/motion';
import SectionHeader from './SectionHeader';
import './About.css';

export default function About() {
  return (
    <section id="about" className="full-section about">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerContainer}
        >
          <SectionHeader
            number="02"
            kicker="The Engineer"
            title="Behind the Code"
          />

          <div className="about-grid">
            <motion.div className="about-main" variants={slideFromLeft}>
              <p className="about-lead">
                Full-Stack Software Engineer, technology entrepreneur and product developer with
                experience designing, developing and maintaining web applications, SaaS platforms,
                backend systems, database-driven applications and API integrations.
              </p>
              <p>
                I combine hands-on software engineering with product thinking, technical
                problem-solving and business understanding. I do not simply build websites — I
                develop software solutions that address operational challenges, improve productivity
                and help businesses operate more efficiently.
              </p>
              <p className="about-philosophy">
                “Good software is not defined by how complicated it looks, but by how effectively
                it solves real problems.”
              </p>
              <p>
                Founder and technical contributor to software ventures including{' '}
                <strong>ReviewPulse</strong> (SaaS reputation management) and{' '}
                <strong>TravelPayy</strong> (peer-to-peer logistics under ROUTYY Limited).
              </p>
            </motion.div>

            <motion.div className="about-side" variants={slideFromRight}>
              <motion.div className="about-card" variants={crackIn}>
                <span className="about-card-label">Education</span>
                <h3>B.Sc. (Ed.) Computer Science</h3>
                <p>Tai Solarin University of Education, Nigeria</p>
              </motion.div>
              <motion.div className="about-card" variants={crackIn}>
                <span className="about-card-label">Focus</span>
                <h3>Full-Stack · SaaS · Backend</h3>
                <p>API Integration · Database Systems · AI-Powered Applications</p>
              </motion.div>
              <motion.div className="about-card" variants={crackIn}>
                <span className="about-card-label">Location</span>
                <h3>Sagamu, Ogun State</h3>
                <p>Nigeria · Open to remote & international roles</p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
