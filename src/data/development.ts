/**
 * Independent development experience beyond the featured case studies.
 * Examples are generic application types drawn from real projects;
 * client names are intentionally omitted.
 */

export const APPS_BUILT = '100+';

export interface DevCategory {
  id: string;
  title: string;
  summary: string;
  examples: string[];
}

export const devCategories: DevCategory[] = [
  {
    id: 'saas',
    title: 'SaaS platforms',
    summary: 'Multi-tenant products with subscriptions, team access and third-party APIs.',
    examples: ['Reputation management', 'Peer-to-peer logistics', 'Subscription plans and billing'],
  },
  {
    id: 'business',
    title: 'Business management systems',
    summary: 'Operational systems that replace spreadsheets and costly off-the-shelf software.',
    examples: ['HR management', 'Inventory and stock control', 'Bookkeeping', 'Bookings and rentals', 'Registries and records'],
  },
  {
    id: 'crm',
    title: 'CRM applications',
    summary: 'Customer, lead and pipeline management tailored to how each business sells.',
    examples: ['Customer and lead management', 'Real estate listings and enquiries'],
  },
  {
    id: 'portals',
    title: 'Customer & member portals',
    summary: 'Secure portals where clients, parents, staff or franchisees log in to their own area.',
    examples: ['Parent and member portals', 'Client and franchisee portals', 'Staff dashboards'],
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    summary: 'Online stores and paid platforms with payment gateway integration.',
    examples: ['Online stores', 'Digital and pixel advertising sales', 'Stripe, PayPal, Paystack and crypto payments'],
  },
  {
    id: 'custom',
    title: 'Custom web applications',
    summary: 'Purpose-built tools for specific industries and workflows.',
    examples: ['Online exams and quizzes', 'Health and safety records', 'Sports and athlete databases', 'Permission and access-control systems'],
  },
];

/** Capabilities demonstrated across independent client work (Experience section). */
export const clientCapabilities = [
  'End-to-end software development',
  'Custom application architecture',
  'Database design and management',
  'Backend and frontend development',
  'Multi-user systems and access control',
  'Business process automation',
  'Third-party and payment integrations',
  'SaaS and platform development',
];
