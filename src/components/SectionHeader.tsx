import { motion } from 'framer-motion';
import { kickerReveal, sliceIn, fadeUp } from '../lib/motion';
import './SectionHeader.css';

interface SectionHeaderProps {
  number: string;
  kicker: string;
  title: string;
  lead?: string;
}

export default function SectionHeader({ number, kicker, title, lead }: SectionHeaderProps) {
  return (
    <div className="section-header">
      <motion.p className="section-kicker" variants={kickerReveal}>
        <span className="chapter-num">{number}</span>
        <span className="chapter-sep">—</span>
        <span>{kicker}</span>
      </motion.p>

      <div className="slice-heading-wrap">
        <motion.h2 className="section-title slice-heading" variants={sliceIn}>
          {title}
        </motion.h2>
        {/* Slash accent that draws under the title */}
        <motion.div
          className="slice-slash"
          variants={{
            hidden: { scaleX: 0, opacity: 0 },
            visible: {
              scaleX: 1,
              opacity: 1,
              transition: { delay: 0.35, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
            },
          }}
        />
      </div>

      {lead && (
        <motion.p className="section-lead" variants={fadeUp}>
          {lead}
        </motion.p>
      )}
    </div>
  );
}
