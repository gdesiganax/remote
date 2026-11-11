import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerFast, crackIn } from '../lib/motion';
import { projects, type FeatureStatus, type Project } from '../data/projects';
import SectionHeader from './SectionHeader';
import './Projects.css';

const STATUS_LABEL: Record<FeatureStatus, string> = {
  live: 'Live',
  'in-progress': 'In progress',
  planned: 'Planned',
};

function ExternalLinks({ project }: { project: Project }) {
  if (!project.liveUrl && !project.appUrl) return null;
  return (
    <div className="project-links">
      {project.liveUrl && (
        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="project-link">
          Visit website <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
      {project.appUrl && (
        <a href={project.appUrl} target="_blank" rel="noopener noreferrer" className="project-link">
          Open application <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

function CaseStudyCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const cs = project.caseStudy!;
  const shots = project.screenshots ?? [];
  const groups = (['live', 'in-progress', 'planned'] as FeatureStatus[])
    .map((status) => ({ status, items: cs.features.filter((f) => f.status === status) }))
    .filter((g) => g.items.length > 0);

  return (
    <motion.article className="card case-card" variants={crackIn} aria-labelledby={`${project.id}-title`}>
      <div className="case-head">
        <div className="case-intro">
          <div className="project-top">
            <span className="project-tag">{project.tag}</span>
            {project.status && <span className="project-badge">{project.status}</span>}
          </div>
          <h3 id={`${project.id}-title`} className="project-name">
            {project.name}
          </h3>
          <p className="project-role">{project.role}</p>
          <p className="project-desc">{project.description}</p>
          <ExternalLinks project={project} />
        </div>

        <div className="case-aside">
          <span className="features-label">Technology</span>
          <ul className="project-tech" aria-label={`${project.name} technologies`}>
            {project.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>

      {shots.length > 0 && (
        <div className="case-shots">
          {shots.map((s) => (
            <figure key={s.src}>
              <img src={s.src} alt={s.alt} loading="lazy" decoding="async" />
            </figure>
          ))}
        </div>
      )}

      <button
        type="button"
        className="case-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Hide case study' : 'Read case study'}
        <span className={`case-chevron ${open ? 'open' : ''}`} aria-hidden="true" />
      </button>

      <div id={panelId} className="case-body" hidden={!open}>
        <p className="case-overview">{cs.overview}</p>

        <div className="case-grid">
          <section className="case-block">
            <h4>My contributions</h4>
            <ul className="case-list">
              {cs.contributions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>

          <section className="case-block">
            <h4>Architecture</h4>
            <ul className="case-list">
              {cs.architecture.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>

          <section className="case-block case-block-wide">
            <h4>Key features</h4>
            <div className="feature-groups">
              {groups.map((g) => (
                <div key={g.status} className="feature-group">
                  <span className={`status-pill status-${g.status}`}>{STATUS_LABEL[g.status]}</span>
                  <ul className="case-list">
                    {g.items.map((f) => (
                      <li key={f.label}>{f.label}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="case-block case-block-wide">
            <h4>Technical challenges</h4>
            <dl className="challenge-list">
              {cs.challenges.map((c) => (
                <div key={c.title} className="challenge">
                  <dt>{c.title}</dt>
                  <dd>{c.detail}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <span className="project-index" aria-hidden="true">
        0{index + 1}
      </span>
    </motion.article>
  );
}

function CompactCard({ project }: { project: Project }) {
  return (
    <motion.article className="card project-card" variants={crackIn}>
      <div className="project-top">
        <span className="project-tag">{project.tag}</span>
        {project.status && <span className="project-badge subtle">{project.status}</span>}
      </div>
      <h3 className="project-name">{project.name}</h3>
      <p className="project-role">{project.role}</p>
      <p className="project-desc">{project.description}</p>
      {project.highlights && (
        <ul className="case-list compact">
          {project.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
      <ul className="project-tech" aria-label={`${project.name} technologies`}>
        {project.tech.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <ExternalLinks project={project} />
    </motion.article>
  );
}

export default function Projects() {
  const featured = projects.filter((p) => p.featured && p.caseStudy);
  const others = projects.filter((p) => !(p.featured && p.caseStudy));

  return (
    <section id="projects" className="full-section projects" aria-labelledby="projects-heading">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          variants={staggerContainer}
        >
          <SectionHeader
            id="projects-heading"
            number="04"
            kicker="The Battleground"
            title="Featured Projects"
            lead="Products I have founded and built. Each case study covers my role, the architecture, what is live today and what is still planned."
          />

          <motion.div className="case-stack" variants={staggerFast}>
            {featured.map((p, i) => (
              <CaseStudyCard key={p.id} project={p} index={i} />
            ))}
          </motion.div>

          {others.length > 0 && (
            <motion.div className="projects-grid" variants={staggerFast}>
              {others.map((p) => (
                <CompactCard key={p.id} project={p} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
