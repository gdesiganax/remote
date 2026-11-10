export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period?: string;
  location?: string;
  points: string[];
}

export const experience: ExperienceItem[] = [
  {
    id: 'routyy',
    company: 'ROUTYY Limited',
    role: 'Chief Technology Officer (CTO)',
    points: [
      'Provide technical leadership and contribute to the development of digital products.',
      'Lead technical implementation and software development activities.',
      'Work on backend systems, application architecture and API integrations.',
      'Translate business requirements into technical solutions.',
      'Oversee the technical development of TravelPayy.',
    ],
  },
  {
    id: 'gigtask',
    company: 'GigTask',
    role: 'Founder | Full-Stack Software Developer',
    period: 'January 2016 – Present',
    points: [
      'Established and developed an independent digital technology venture.',
      'Undertake software development and digital solution projects.',
      'Apply full-stack development skills to business and client requirements.',
      'Combine technical implementation with product development and entrepreneurial experience.',
    ],
  },
  {
    id: 'max-excellence',
    company: 'Max Excellence Ltd',
    role: 'Co-Founder',
    points: [
      'Contributed to business development and entrepreneurial activities.',
      'Participated in the development of business initiatives and digital solutions.',
    ],
  },
  {
    id: 'customised',
    company: 'Customised by Diamond — United Kingdom',
    role: 'Web Developer',
    points: [
      'Contributed to website development and digital solutions for a UK-based business.',
      'Applied web development and design skills to support its online presence.',
    ],
  },
  {
    id: 'buff',
    company: 'British Urban Film Festival',
    role: 'Web Designer / Website Manager',
    points: [
      'Worked on website design and management.',
      'Supported digital presentation and website-related activities.',
      'Applied web development and visual communication skills.',
    ],
  },
  {
    id: 'npower',
    company: 'NPower',
    role: 'Computer Teacher',
    points: [
      'Delivered computer education and supported digital skills development.',
      'Applied computing knowledge in an educational environment.',
    ],
  },
];
