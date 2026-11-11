/**
 * Project data.
 *
 * Case-study content for ReviewPulse and TravelPayy is drawn from the actual
 * source code (review_repute Flask app; Travelpayy_app Flutter client and the
 * p2p PHP API). Nothing here states users, revenue or transaction figures.
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
  challenges: { title: string; detail: string }[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  tag: string;
  status?: string;
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
