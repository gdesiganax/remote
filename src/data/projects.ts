/**
 * Project data.
 *
 * Case-study content is drawn from the actual source code of each project
 * (ReviewPulse: review_repute; TravelPayy: Travelpayy_app + p2p API;
 * High Rocks: highrocks/portal; BioVent: vent_air; Crypto Wall: 1million)
 * and from the public websites. Nothing here states users, revenue, cost
 * savings or transaction figures. No client personal data is included.
 *
 * Screenshots: add real images to /public/images/projects/ and list them in
 * `screenshots`. The gallery only renders when at least one is present.
 */

export type FeatureStatus = 'live' | 'in-progress' | 'planned';

export interface ProjectFeature {
  label: string;
  status: FeatureStatus;
}

export interface Screenshot {
  src: string;
  alt: string;
}

export interface CaseStudy {
  overview: string;
  contributions: string[];
  architecture: string[];
  features: ProjectFeature[];
  /** Optional: only listed where the challenge is evident from the code. */
  challenges?: { title: string; detail: string }[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  tag: string;
  status?: string;
  /** Client name/location for client work, e.g. "Brevard, North Carolina, USA" */
  client?: string;
  /** Development period, only when confirmed */
  period?: string;
  description: string;
  tech: string[];
  liveUrl?: string;
  appUrl?: string;
  featured?: boolean;
  screenshots?: Screenshot[];
  caseStudy?: CaseStudy;
  /** Short highlights for non-featured cards */
  highlights?: string[];
}

export const projects: Project[] = [
  {
    id: 'reviewpulse',
    name: 'ReviewPulse',
    role: 'Founder · Full-Stack Developer',
    tag: 'SaaS Platform',
    status: 'Live',
    description:
      'A reputation-management SaaS for local businesses: connect Google Business Profiles, sync and reply to reviews, run review-request campaigns and publish AI-assisted Google posts from one dashboard.',
    tech: [
      'Python',
      'Flask',
      'MySQL',
      'Jinja2',
      'Flask-Login',
      'Flask-SocketIO',
      'Google Business Profile API',
      'Google OAuth 2.0',
      'Google Places API',
      'OpenAI API',
    ],
    liveUrl: 'https://reviewpulse.io',
    appUrl: 'https://app.reviewpulse.io/login',
    featured: true,
    screenshots: [],
    caseStudy: {
      overview:
        'Businesses with one or several locations need to keep on top of Google reviews, respond consistently and keep their profiles active. ReviewPulse brings those tasks into one multi-tenant web application built on Google’s Business Profile APIs.',
      contributions: [
        'Designed and built the application end to end: data model, backend and server-rendered UI.',
        'Implemented Google OAuth 2.0 (business.manage scope) with support for several connected Google logins per user.',
        'Built the sync layer that imports accounts, locations and reviews from the Business Profile APIs into MySQL.',
        'Integrated OpenAI for reply drafting, review analysis and generating Google post campaigns.',
        'Wrote the scheduled-post worker and the subscription / plan-gating logic.',
      ],
      architecture: [
        'Flask application split into blueprints per domain: auth, locations, reviews, campaigns, incentives, settings, Google auth, Google sync and team access.',
        'MySQL via Flask-MySQLdb with SQL migration scripts; Flask-Login and bcrypt for authentication.',
        'Google Business Profile v1 and v4 endpoints for accounts, locations, reviews and posts; Places API for business search and autocomplete.',
        'OpenAI chat completions in JSON mode so AI output is parsed and validated before it is saved or published.',
        'A standalone, idempotent Python worker publishes scheduled posts, triggered by an external scheduler (cron / Task Scheduler).',
      ],
      features: [
        { label: 'Google Business Profile account, location and review import', status: 'live' },
        { label: 'Multiple connected Google logins per user', status: 'live' },
        { label: 'Reply to reviews, with AI-drafted replies', status: 'live' },
        { label: 'AI analysis of a location’s reviews', status: 'live' },
        { label: 'Review-request email campaigns with open tracking and stats', status: 'live' },
        { label: 'Short-link public review pages with a private feedback path', status: 'live' },
        { label: 'Google posts: sync, create, edit, delete and scheduled AI campaigns', status: 'live' },
        { label: 'Local rank grid tracker with scan history', status: 'live' },
        { label: 'Location performance insights', status: 'live' },
        { label: 'Team members with delegated access and invitations', status: 'live' },
        { label: 'Incentives and claim management', status: 'live' },
        { label: 'Subscription plans with a free trial and feature limits', status: 'live' },
      ],
      challenges: [
        {
          title: 'Publishing scheduled posts without duplicates',
          detail:
            'Each post is claimed atomically (UPDATE … WHERE status = scheduled) before Google is called, so overlapping worker runs can never publish the same post twice. Posts left mid-publish by a crashed run are marked failed instead of retried blindly.',
        },
        {
          title: 'Background work without a job queue',
          detail:
            'Rather than adding Celery or a scheduler service, the daily Google sync runs on login when it is due, and post publishing runs as a small external cron job, which keeps hosting simple.',
        },
        {
          title: 'Keeping AI output within Google’s content policy',
          detail:
            'Prompts forbid links and contact details in post bodies and request a fixed JSON shape (text, call-to-action type, image prompt), which the app validates before use.',
        },
        {
          title: 'Many Google logins, many locations',
          detail:
            'Accounts and locations are mapped to the Google connection that owns them, so the right OAuth token is used for each API call when a user links more than one Google login.',
        },
      ],
    },
  },
  {
    id: 'travelpayy',
    name: 'TravelPayy',
    role: 'Product Founder · Technical Lead',
    tag: 'Logistics Platform',
    status: 'Web live · Mobile app in development',
    description:
      'A peer-to-peer delivery platform under ROUTYY Limited: senders list packages, verified travellers list trips, and payment is held in escrow until the sender confirms delivery.',
    tech: ['PHP', 'MySQL / MariaDB', 'REST API', 'Paystack', 'Flutter', 'Riverpod', 'go_router', 'Dio', 'Google Maps'],
    liveUrl: 'https://travelpayy.com',
    featured: true,
    screenshots: [],
    caseStudy: {
      overview:
        'Sending packages between cities is often slow and costly, while travellers already make those journeys with spare luggage space. TravelPayy matches the two and protects both sides with an escrow-backed wallet.',
      contributions: [
        'Led product and technical direction for the platform.',
        'Built and maintain the PHP web platform and its versioned REST API.',
        'Integrated Paystack for wallet deposits and withdrawals, with server-side verification and webhooks.',
        'Carried out a security pass on the web platform: moved secrets to environment configuration, added CSRF protection and fixed XSS issues.',
        'Building the Flutter mobile and web client against the API.',
      ],
      architecture: [
        'PHP web application and a versioned REST API (/api/v1) on MySQL / MariaDB.',
        'Escrow-based wallet: funds are held when a delivery is accepted or booked, then released on sender confirmation or refunded on cancellation.',
        'Idempotency keys on every money-moving request, so a retried request can never charge or pay out twice.',
        'Short-lived access tokens with single-flight refresh in the mobile client.',
        'Flutter client using Riverpod for state, go_router for navigation and Dio for HTTP, with separate local, LAN and production environments and per-environment token storage.',
      ],
      features: [
        { label: 'Sender and traveller accounts with traveller identity verification', status: 'live' },
        { label: 'Package delivery requests and trip listings', status: 'live' },
        { label: 'Accept a delivery or book a traveller, with funds held in escrow', status: 'live' },
        { label: 'Mark delivered, sender confirmation, cancellation and refund flow', status: 'live' },
        { label: 'Wallet with Paystack deposits and bank withdrawals', status: 'live' },
        { label: 'Per-shipment messaging, reviews and problem reports', status: 'live' },
        { label: 'Status timeline and delivery receipts', status: 'live' },
        { label: 'Flutter mobile app for Android, iOS and web', status: 'in-progress' },
        { label: 'Live location tracking during delivery', status: 'planned' },
        { label: 'Proof-of-delivery upload', status: 'planned' },
        { label: 'Push notifications', status: 'planned' },
      ],
      challenges: [
        {
          title: 'Moving money safely over unreliable networks',
          detail:
            'Every money-moving request carries an idempotency key that the client keeps across retries and drops only after a definitive result, so retries on a poor connection cannot debit or credit twice.',
        },
        {
          title: 'Trusting payments only from the server',
          detail:
            'A deposit is credited only when the server’s verification endpoint confirms it with Paystack; the browser redirect after checkout is never trusted.',
        },
        {
          title: 'Keeping the mobile client honest',
          detail:
            'Shipment status and available actions come from the server, and amounts arrive as decimal strings that are formatted, never recalculated, in the app.',
        },
        {
          title: 'Safe environments for testing',
          detail:
            'The Flutter app isolates tokens per environment, and release builds always point at production with no developer switcher.',
        },
      ],
    },
  },
  {
    id: 'highrocks',
    name: 'High Rocks Boys Camp Management System',
    role: 'Sole Full-Stack Developer',
    tag: 'Business Management System',
    status: 'Live',
    client: 'High Rocks Boys Camp · Brevard, North Carolina, USA',
    period: 'c. 2023',
    description:
      'A complete camp management platform built from scratch to replace an expensive third-party product. It runs the camp’s operations, from campers, cabins, activities, trips and meals to staff, medical records and reporting, with a dedicated portal for parents.',
    tech: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript', 'jQuery', 'TCPDF'],
    appUrl: 'https://my.highrocks.com/portal/pages/p_login',
    featured: true,
    screenshots: [],
    caseStudy: {
      overview:
        'The camp was paying too much for an off-the-shelf camp management system. I built a replacement independently, using the previous system as a functional reference to understand its workflows, then designed and implemented my own database, backend and interfaces around how the camp actually operates.',
      contributions: [
        'Sole developer: requirements analysis, database design, backend, admin and parent interfaces.',
        'Mapped the previous product’s workflows and rebuilt them as a custom application the camp owns.',
        'Designed a relational MySQL schema covering campers, contacts, sessions, cabins, activities, trips, meals, medical records and staff.',
        'Implemented separate authenticated areas and access levels for administrators, staff and parents.',
        'Built operational reporting, PDF generation and email notifications.',
      ],
      architecture: [
        'PHP application on MySQL with modular data-access includes per domain (campers, cabins, activities, sessions, medical, staff).',
        'Two front doors: an administration and staff dashboard, and a separate parent portal with its own login and password recovery.',
        'Bootstrap and jQuery interface with modal-based create, update and delete workflows across the system.',
        'Server-side PDF generation (TCPDF) for reports and forms; file uploads for documents, invoices and profile images.',
        'Bulk import and export for staff, sessions, activities and travel details.',
      ],
      features: [
        { label: 'Administrator and staff accounts with role-based access', status: 'live' },
        { label: 'Parent portal: camper details, forms, travel details, uploads, statements and invoices', status: 'live' },
        { label: 'Camper records organised by session and year', status: 'live' },
        { label: 'Cabin placement (accommodation) and cabin reports', status: 'live' },
        { label: 'Activities, activity times and group activity scheduling', status: 'live' },
        { label: 'Trips with vehicles, trip calendar and trip reports', status: 'live' },
        { label: 'Meals and dietary needs management', status: 'live' },
        { label: 'Health forms, medications, medical notes and treatment reports', status: 'live' },
        { label: 'Incident reporting with charts by session, activity and trip', status: 'live' },
        { label: 'Staff management, staff import and head-staff reports', status: 'live' },
        { label: 'News, scheduled messages and email log', status: 'live' },
        { label: 'Calendar and operational reports (activities, meals, medical, required forms)', status: 'live' },
      ],
      challenges: [
        {
          title: 'Replacing an established product',
          detail:
            'The new system had to cover the workflows staff already relied on. I used the previous software as a functional reference, then rebuilt each workflow on my own data model rather than copying its structure.',
        },
        {
          title: 'Sensitive camper information',
          detail:
            'Medical histories, allergies, medications and emergency contacts sit behind authenticated areas, with a separate parent login and distinct access levels for staff and administrators.',
        },
        {
          title: 'Seasonal, session-based operations',
          detail:
            'Campers, cabins, activities and trips are tied to sessions and years, so the camp can run each season cleanly while keeping history for returning families.',
        },
        {
          title: 'Many multi-part forms',
          detail:
            'Medical, allergy, medication, insurance and background forms are split into structured sections that parents complete online and staff review in reports.',
        },
      ],
    },
  },
  {
    id: 'biovent',
    name: 'BioVent Systems Portal',
    role: 'Sole Full-Stack Developer',
    tag: 'Custom Business Portal',
    status: 'Live',
    client: 'BioVent Systems · United Kingdom',
    description:
      'A custom web portal for BioVent Systems, a specialist company that uses biotechnology to maintain commercial kitchen extraction systems through bespoke grease management. Built from scratch to manage sites, audits and reporting across the different parties involved.',
    tech: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript', 'jQuery', 'ApexCharts', 'TCPDF'],
    appUrl: 'https://portal.bioventsystems.com/login',
    featured: true,
    screenshots: [],
    caseStudy: {
      overview:
        'BioVent needed one place to manage the sites it services and the audit work carried out on them, with each party seeing the information relevant to them. I developed the portal independently, end to end.',
      contributions: [
        'Sole developer of the portal, from database design to the user interface.',
        'Designed the MySQL data model for users, sites, audits and issues.',
        'Built role-specific dashboards and data visualisation with charting libraries.',
        'Implemented PDF report generation, e-signatures and automated email reminders.',
      ],
      architecture: [
        'PHP and MySQL application with Bootstrap and jQuery on the front end.',
        'Role-based dashboards for different user types (engineers, franchisees, store managers and insurers).',
        'Charts and graphs (ApexCharts) for visualising portal data.',
        'Server-side PDF generation (TCPDF) for audit documents and printouts.',
      ],
      features: [
        { label: 'User management with role-specific dashboards', status: 'live' },
        { label: 'Store and site management', status: 'live' },
        { label: 'Audit records with photo uploads', status: 'live' },
        { label: 'Issue logging', status: 'live' },
        { label: 'Electronic signatures', status: 'live' },
        { label: 'PDF audit reports and printouts', status: 'live' },
        { label: 'Automated audit reminder emails', status: 'live' },
        { label: 'Charts and graphs for data visualisation', status: 'live' },
      ],
    },
  },
  {
    id: 'cryptowall',
    name: 'The Million Dollar Cryptocurrency Wall',
    role: 'Full-Stack Developer',
    tag: 'Interactive Advertising Platform',
    status: 'Live',
    description:
      'An interactive advertising platform: a permanent public canvas of 1,000,000 pixels where crypto holders, projects and businesses buy pixel space, link it to a cryptocurrency and country, and appear on a live wall with real-time statistics.',
    tech: ['PHP', 'MySQL', 'JavaScript', 'jQuery', 'Bootstrap', 'Stripe', 'PayPal', 'Coinbase Commerce', 'CoinMarketCap API'],
    liveUrl: 'https://themilliondollarcryptocurrencywall.com/',
    featured: true,
    screenshots: [
      {
        src: '/images/projects/crypto-wall-home.webp',
        alt: 'The Million Dollar Cryptocurrency Wall homepage showing the pixel wall and live placement statistics',
      },
    ],
    caseStudy: {
      overview:
        'The wall sells advertising space pixel by pixel. Each placement is tied to a cryptocurrency, an exchange and a country, and the public page shows live statistics, top coins, top countries and recent placements.',
      contributions: [
        'Built the public wall, the pixel selection and purchase flow, and the administration panel.',
        'Integrated payment gateways and cryptocurrency market data.',
      ],
      architecture: [
        'PHP and MySQL application with a jQuery and Bootstrap front end.',
        'Coordinate-based pixel selection with bulk select and release of pixel blocks.',
        'Payment integrations for Stripe, PayPal (IPN) and Coinbase Commerce, with server-side notification handling.',
        'Cryptocurrency data from the CoinMarketCap API, plus CSV import for bulk updates.',
      ],
      features: [
        { label: 'Interactive pixel selection and purchase', status: 'live' },
        { label: 'Placements linked to a cryptocurrency, exchange and country', status: 'live' },
        { label: 'Live statistics: pixels placed and remaining, top coins, top countries', status: 'live' },
        { label: 'Recent placements and pixel detail views', status: 'live' },
        { label: 'Buy-all and contact enquiry forms', status: 'live' },
        { label: 'Admin panel: cryptocurrencies, exchanges, countries, pixel approvals and users', status: 'live' },
      ],
    },
  },
  {
    id: 'gigtask',
    name: 'GigTask',
    role: 'Founder · Full-Stack Developer',
    tag: 'Technology Venture',
    description:
      'An independent technology venture, founded in January 2016, delivering software development and digital solutions for clients.',
    highlights: [
      'Independent software development projects',
      'Digital product development',
      'Client-oriented technical solutions',
    ],
    tech: ['PHP', 'JavaScript', 'MySQL'],
  },
  {
    id: 'routyy',
    name: 'ROUTYY Limited',
    role: 'Chief Technology Officer',
    tag: 'Technology Leadership',
    description:
      'Technical leadership and software product development across the company’s digital initiatives, including TravelPayy.',
    highlights: ['Technical leadership', 'Product architecture and implementation', 'Backend and API development'],
    tech: ['PHP', 'Flutter', 'MySQL', 'REST APIs'],
  },
];
