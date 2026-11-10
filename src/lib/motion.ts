import type { Variants, Transition } from 'framer-motion';

export const easeOutExpo: Transition = {
  duration: 0.9,
  ease: [0.16, 1, 0.3, 1],
};

export const easeOutSoft: Transition = {
  duration: 0.7,
  ease: [0.22, 1, 0.36, 1],
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: {
    opacity: 1,
    y: 0,
    transition: easeOutExpo,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.75, ease: 'easeOut' },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.15,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: easeOutSoft,
  },
};

export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -56 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easeOutExpo,
  },
};

export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: 56 },
  visible: {
    opacity: 1,
    x: 0,
    transition: easeOutExpo,
  },
};

/** Stronger horizontal katana-slice for headings */
export const sliceIn: Variants = {
  hidden: {
    opacity: 0,
    clipPath: 'inset(0 105% 0 -5%)',
    x: -32,
  },
  visible: {
    opacity: 1,
    clipPath: 'inset(0 -5% 0 -5%)',
    x: 0,
    transition: {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

/** Stronger crack / shatter entrance — more dramatic so it is clearly seen */
export const crackIn: Variants = {
  hidden: {
    opacity: 0,
    scale: 1.08,
    y: 28,
    filter: 'blur(10px)',
    rotateX: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    rotateX: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const kickerReveal: Variants = {
  hidden: { opacity: 0, y: 20, letterSpacing: '0.55em' },
  visible: {
    opacity: 1,
    y: 0,
    letterSpacing: '0.35em',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};
