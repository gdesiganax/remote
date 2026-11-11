import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeUp, crackIn } from '../lib/motion';
import { CONTACT_API_URL, RESUME_URL, SOCIAL_LINKS } from '../lib/site';
import SectionHeader from './SectionHeader';
import './Contact.css';

type Field = 'name' | 'email' | 'subject' | 'message';
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;
type Status = 'idle' | 'submitting' | 'success' | 'error';

const FIELDS: Field[] = ['name', 'email', 'subject', 'message'];
const EMPTY: Values = { name: '', email: '', subject: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Keep in sync with server/index.mjs
const LIMITS = { name: 100, email: 254, subject: 150, message: 5000 } as const;
const REQUEST_TIMEOUT = 20000;

function validate(v: Values): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  const email = v.email.trim();
  const subject = v.subject.trim();
  const message = v.message.trim();

  if (!name) e.name = 'Please enter your name.';
  else if (name.length < 2) e.name = 'Name must be at least 2 characters.';
  else if (name.length > LIMITS.name) e.name = `Name must be under ${LIMITS.name} characters.`;

  if (!email) e.email = 'Please enter your email address.';
  else if (!EMAIL_RE.test(email) || email.length > LIMITS.email) e.email = 'Please enter a valid email address.';

  if (!subject) e.subject = 'Please enter a subject.';
  else if (subject.length < 3) e.subject = 'Subject must be at least 3 characters.';
  else if (subject.length > LIMITS.subject) e.subject = `Subject must be under ${LIMITS.subject} characters.`;

  if (!message) e.message = 'Please enter a message.';
  else if (message.length < 20) e.message = 'Please write at least 20 characters so I have some context.';
  else if (message.length > LIMITS.message) e.message = `Message must be under ${LIMITS.message} characters.`;

  return e;
}

const openTo = [
  'Remote and international software engineering roles',
  'Backend, API and SaaS development contracts',
  'Product collaborations where software creates measurable value',
];

const linkedIn = SOCIAL_LINKS[0];

export default function Contact() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const busy = status === 'submitting';

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = e.target.name as Field;
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    if (touched[field]) setErrors(validate(next));
  };

  const onBlur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(values));
  };

  const focusField = (field: Field) => formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;

    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, email: true, subject: true, message: true });
    const firstInvalid = FIELDS.find((f) => found[f]);
    if (firstInvalid) {
      focusField(firstInvalid);
      return;
    }

    const honeypot = new FormData(e.currentTarget).get('_gotcha');

    setStatus('submitting');
    setServerError('');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const res = await fetch(CONTACT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          _gotcha: typeof honeypot === 'string' ? honeypot : '',
        }),
        signal: controller.signal,
      });

      let data: { ok?: boolean; error?: string; fields?: Errors } = {};
      try {
        data = await res.json();
      } catch {
        // non-JSON response (e.g. the API is not deployed)
      }

      // Success only when the server confirms the email was handed to the provider
      if (!res.ok || data.ok !== true) {
        if (data.fields && Object.keys(data.fields).length) {
          setErrors(data.fields);
          const first = FIELDS.find((f) => data.fields?.[f]);
          if (first) focusField(first);
        }
        throw new Error(
          data.error ||
            (res.status === 404 || res.status === 405
              ? 'The message service is unavailable right now.'
              : `Your message could not be sent (error ${res.status}).`),
        );
      }

      setStatus('success');
      setValues(EMPTY);
      setTouched({});
      setErrors({});
      requestAnimationFrame(() => successRef.current?.focus());
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError';
      setServerError(
        aborted
          ? 'The request timed out. Please check your connection and try again.'
          : err instanceof TypeError
            ? 'Could not reach the message service. Please check your connection and try again.'
            : (err as Error).message,
      );
      setStatus('error');
    } finally {
      window.clearTimeout(timer);
    }
  };

  const fieldProps = (field: Field) => {
    const showError = touched[field] && errors[field];
    return {
      id: `contact-${field}`,
      name: field,
      value: values[field],
      onChange,
      onBlur: () => onBlur(field),
      maxLength: LIMITS[field],
      'aria-invalid': showError ? true : undefined,
      'aria-describedby': showError ? `contact-${field}-error` : undefined,
      disabled: busy,
    };
  };

  const fieldError = (field: Field) =>
    touched[field] && errors[field] ? (
      <p id={`contact-${field}-error`} className="field-error">
        {errors[field]}
      </p>
    ) : null;

  return (
    <section id="contact" className="full-section contact" aria-labelledby="contact-heading">
      <div className="container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={staggerContainer}
        >
          <SectionHeader
            id="contact-heading"
            number="08"
            kicker="The Final Chapter"
            title="Let's Build Something Meaningful"
            lead="Have a role, project or collaboration in mind? Send a message and I will get back to you."
          />

          <div className="contact-layout">
            <motion.div className="contact-info" variants={fadeUp}>
              <h3 className="contact-subhead">Open to</h3>
              <ul className="contact-open">
                {openTo.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>

              <h3 className="contact-subhead">Find me online</h3>
              <ul className="social-links">
                {SOCIAL_LINKS.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label} <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>

              {RESUME_URL && (
                <a className="btn btn-ghost contact-cv" href={RESUME_URL} download>
                  Download CV (PDF)
                </a>
              )}
            </motion.div>

            <motion.div className="contact-form" variants={crackIn}>
              {status === 'success' ? (
                <div className="form-success" ref={successRef} tabIndex={-1} role="status">
                  <div className="success-mark" aria-hidden="true">
                    ✓
                  </div>
                  <h3>Message sent</h3>
                  <p>Thank you for getting in touch. Your message has been delivered and I will reply by email.</p>
                  <button type="button" className="btn btn-ghost" onClick={() => setStatus('idle')}>
                    Send another message
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate aria-label="Contact form" aria-busy={busy}>
                  <div className="form-grid">
                    <div className="form-row">
                      <label htmlFor="contact-name">Name</label>
                      <input type="text" autoComplete="name" required placeholder="Your name" {...fieldProps('name')} />
                      {fieldError('name')}
                    </div>
                    <div className="form-row">
                      <label htmlFor="contact-email">Email</label>
                      <input
                        type="email"
                        autoComplete="email"
                        inputMode="email"
                        required
                        placeholder="you@company.com"
                        {...fieldProps('email')}
                      />
                      {fieldError('email')}
                    </div>
                  </div>
                  <div className="form-row">
                    <label htmlFor="contact-subject">Subject</label>
                    <input type="text" required placeholder="What is this about?" {...fieldProps('subject')} />
                    {fieldError('subject')}
                  </div>
                  <div className="form-row">
                    <label htmlFor="contact-message">Message</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Tell me about the role or project..."
                      {...fieldProps('message')}
                    />
                    <div className="field-foot">
                      {fieldError('message')}
                      <span className="char-count" aria-hidden="true">
                        {values.message.length}/{LIMITS.message}
                      </span>
                    </div>
                  </div>

                  {/* Honeypot field for bots, hidden from people and assistive tech */}
                  <div className="hp-field" aria-hidden="true">
                    <label htmlFor="contact-gotcha">Leave this field empty</label>
                    <input id="contact-gotcha" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
                  </div>

                  <div role="alert" aria-live="assertive">
                    {status === 'error' && serverError && (
                      <p className="form-error">
                        {serverError} If the problem continues, please message me on{' '}
                        <a href={linkedIn.href} target="_blank" rel="noopener noreferrer">
                          {linkedIn.label}
                        </a>
                        .
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn btn-primary form-submit" disabled={busy}>
                    {busy && <span className="btn-spinner" aria-hidden="true" />}
                    {busy ? 'Sending…' : 'Send Message'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
