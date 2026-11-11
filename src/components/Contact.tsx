import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, crackIn } from '../lib/motion';
import SectionHeader from './SectionHeader';
import './Contact.css';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section id="contact" className="full-section contact">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer}
        >
          <SectionHeader
            number="08"
            kicker="The Final Chapter"
            title="Let's Build Something Meaningful"
            lead="I am interested in challenging software engineering opportunities, international remote roles, collaborations and projects where technology can create measurable value."
          />

          <div className="contact-layout">
            <motion.div className="contact-info" variants={fadeUp}>
              <div className="contact-details">
                <div className="detail">
                  <span className="detail-label">Email</span>
                  <a href="mailto:afeexco223@yahoo.com">afeexco223@yahoo.com</a>
                </div>
                <div className="detail">
                  <span className="detail-label">Location</span>
                  <span>Sagamu, Ogun State, Nigeria</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Availability</span>
                  <span className="gold">Remote · International opportunities</span>
                </div>
              </div>

              <div className="social-links">
                <a href="https://www.linkedin.com/in/lukmon/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href="https://github.com/gdesiganax" target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href="https://fiverr.com/graphixdesignax" target="_blank" rel="noreferrer">
                  Fiverr
                </a>
              </div>
            </motion.div>

            <motion.form className="contact-form" onSubmit={handleSubmit} variants={crackIn}>
              {sent ? (
                <div className="form-success">
                  <div className="success-mark">承</div>
                  <p>Message received. I will reply soon.</p>
                </div>
              ) : (
                <>
                  <div className="form-row">
                    <label htmlFor="name">Name</label>
                    <input id="name" name="name" type="text" required placeholder="Your name" />
                  </div>
                  <div className="form-row">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@domain.com"
                    />
                  </div>
                  <div className="form-row">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Tell me about the opportunity or project..."
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                    Start a Conversation
                  </button>
                </>
              )}
            </motion.form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
