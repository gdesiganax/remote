/**
 * Skills grouped by depth of experience rather than percentage ratings.
 * Placement reflects the technologies used in shipped projects (ReviewPulse,
 * TravelPayy) versus ones used occasionally or explored.
 */
export interface SkillGroup {
  label: string;
  items: string[];
}

export interface SkillTier {
  id: string;
  title: string;
  summary: string;
  groups: SkillGroup[];
}

export const skillTiers: SkillTier[] = [
  {
    id: 'core',
    title: 'Core strengths',
    summary: 'Used daily and in production systems I have built and maintain.',
    groups: [
      { label: 'Backend', items: ['PHP', 'Python', 'Flask', 'MySQL', 'REST API design'] },
      {
        label: 'Integration',
        items: ['Google Business Profile & OAuth APIs', 'Paystack payments', 'Third-party API integration'],
      },
      {
        label: 'Product',
        items: [
          'Business management systems',
          'SaaS application development',
          'Multi-user & role-based access',
          'Database-driven web apps',
        ],
      },
      { label: 'Frontend', items: ['JavaScript', 'jQuery & AJAX', 'Bootstrap', 'HTML5', 'CSS3', 'Responsive interfaces'] },
    ],
  },
  {
    id: 'working',
    title: 'Working experience',
    summary: 'Used on real projects, comfortable delivering with them.',
    groups: [
      { label: 'Mobile', items: ['Flutter', 'Riverpod', 'go_router'] },
      { label: 'Frontend', items: ['TypeScript', 'React'] },
      { label: 'AI', items: ['OpenAI API'] },
      { label: 'CMS & tools', items: ['WordPress', 'Elementor', 'Git', 'PDF generation (TCPDF)', 'Charts (ApexCharts)'] },
    ],
  },
  {
    id: 'familiar',
    title: 'Familiarity',
    summary: 'Explored or used in limited scope.',
    groups: [
      { label: 'AI ecosystems', items: ['Hugging Face', 'Replicate', 'Stable Diffusion'] },
      { label: 'Cloud', items: ['AWS (basic exposure)'] },
    ],
  },
];
