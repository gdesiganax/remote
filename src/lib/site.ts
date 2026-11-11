/** Site-wide configuration shared by components. No secrets belong here. */

export const SITE_URL = 'https://portfolio-zg6f.onrender.com/';

/** Empty string when no CV PDF is present in /public (see vite.config.ts). */
export const RESUME_URL: string = __RESUME_URL__;

/** Same-origin backend endpoint (server/index.mjs) that emails form submissions. */
export const CONTACT_API_URL = '/api/contact';

export const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/lukmon/' },
  { label: 'GitHub', href: 'https://github.com/gdesiganax' },
  { label: 'Fiverr', href: 'https://fiverr.com/graphixdesignax' },
] as const;

export interface SectionMeta {
  id: string;
  num: string;
  name: string;
  /** Short label used in the top navigation. */
  label: string;
}

export const SECTIONS: SectionMeta[] = [
  { id: 'home', num: '01', name: 'The Awakening', label: 'Home' },
  { id: 'about', num: '02', name: 'The Engineer', label: 'About' },
  { id: 'skills', num: '03', name: 'The Arsenal', label: 'Skills' },
  { id: 'projects', num: '04', name: 'The Battleground', label: 'Projects' },
  { id: 'experience', num: '05', name: 'The Journey', label: 'Experience' },
  { id: 'ai', num: '06', name: 'Beyond Code', label: 'AI' },
  { id: 'creative', num: '07', name: 'The Creative Edge', label: 'Creative' },
  { id: 'contact', num: '08', name: 'The Final Chapter', label: 'Contact' },
];

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
