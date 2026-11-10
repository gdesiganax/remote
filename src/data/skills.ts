export interface SkillCategory {
  id: string;
  title: string;
  items: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'backend',
    title: 'Backend Engineering',
    items: [
      'PHP',
      'Python',
      'Flask',
      'MySQL',
      'PDO',
      'REST API development',
      'Database-driven applications',
      'Backend business logic',
      'Authentication & workflows',
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    items: [
      'HTML5',
      'CSS3',
      'JavaScript',
      'TypeScript',
      'React',
      'Bootstrap',
      'jQuery & AJAX',
      'Responsive interfaces',
    ],
  },
  {
    id: 'saas',
    title: 'SaaS & Application Development',
    items: [
      'Custom SaaS platforms',
      'Business management applications',
      'Multi-user workflows',
      'Third-party integrations',
      'Payment gateway integration',
      'Application maintenance',
    ],
  },
  {
    id: 'ai',
    title: 'AI & Integrations',
    items: [
      'OpenAI API integration',
      'Hugging Face ecosystem',
      'Replicate',
      'Stable Diffusion ecosystem',
      'AI-assisted application features',
      'Third-party API integrations',
    ],
  },
  {
    id: 'mobile-cms',
    title: 'Mobile & CMS',
    items: [
      'Flutter application development',
      'WordPress development',
      'Elementor',
      'Custom website development',
      'Website administration',
    ],
  },
  {
    id: 'tools',
    title: 'Tools & Others',
    items: ['Git', 'Basic AWS exposure', 'Adobe Photoshop', 'Adobe InDesign', 'Canva'],
  },
];
