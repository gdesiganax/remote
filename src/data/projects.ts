export interface Project {
  id: string;
  name: string;
  role: string;
  tag: string;
  description: string;
  problem: string;
  features: string[];
  tech: string[];
  liveUrl?: string;
  appUrl?: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: 'reviewpulse',
    name: 'ReviewPulse',
    role: 'Founder / Full-Stack Software Developer',
    tag: 'SaaS Platform',
    description:
      'A SaaS reputation management platform that helps businesses manage Google Business Profile reviews, monitor customer feedback and improve their online reputation.',
    problem:
      'Businesses struggle to efficiently monitor, respond to and leverage customer reviews across multiple locations.',
    features: [
      'Google Business Profile account & location integration',
      'Review aggregation and synchronisation',
      'AI-assisted review responses',
      'Multi-location management',
      'Team and role-based access',
      'Review monitoring and alerts',
      'Analytics and reporting',
      'Automated review request campaigns',
      'Review widgets and pages',
    ],
    tech: ['Python', 'Flask', 'MySQL', 'Google APIs', 'AI Integrations'],
    liveUrl: 'https://reviewpulse.io',
    appUrl: 'https://app.reviewpulse.io/login',
    featured: true,
  },
  {
    id: 'travelpayy',
    name: 'TravelPayy',
    role: 'Product Founder / Technical Lead',
    tag: 'Logistics Platform',
    description:
      'A peer-to-peer logistics platform connecting people who need to send packages with travellers already moving along the required routes. Developed under ROUTYY Limited.',
    problem:
      'Traditional delivery can be expensive and inefficient. Travellers have unused capacity on existing journeys.',
    features: [
      'Sender and traveller accounts',
      'Package delivery requests',
      'Traveller verification',
      'Request acceptance workflows',
      'Wallet and payment functionality',
      'Escrow-based payment workflow',
      'Package tracking',
      'Sender–traveller communication',
      'Paystack payment integration',
    ],
    tech: ['Flutter', 'PHP', 'MySQL', 'REST APIs', 'Paystack'],
    liveUrl: 'https://travelpayy.com',
    featured: true,
  },
  {
    id: 'gigtask',
    name: 'GigTask',
    role: 'Founder / Full-Stack Software Developer',
    tag: 'Technology Venture',
    description:
      'An independent digital technology venture established in January 2016, focused on software development, digital solutions and entrepreneurial product building.',
    problem:
      'Need for flexible, client-oriented technical solutions and independent product development capacity.',
    features: [
      'Independent software development projects',
      'Digital product development',
      'Client-oriented technical solutions',
      'Business and technology management',
    ],
    tech: ['Full-Stack', 'PHP', 'JavaScript', 'MySQL'],
    featured: false,
  },
  {
    id: 'routyy',
    name: 'ROUTYY Limited',
    role: 'Chief Technology Officer',
    tag: 'Technology Leadership',
    description:
      'Technical leadership and software product development across the company’s digital initiatives, including TravelPayy.',
    problem:
      'Building and scaling digital products that solve real logistics and operational challenges.',
    features: [
      'Technical leadership',
      'Product architecture and implementation',
      'Backend and API development',
      'Digital product delivery',
    ],
    tech: ['PHP', 'Flutter', 'MySQL', 'REST APIs'],
    featured: false,
  },
];
