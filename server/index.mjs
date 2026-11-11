/**
 * Production server for the portfolio. Zero dependencies (Node 20+).
 *
 *  - Serves the Vite build from ./dist (with SPA fallback and caching headers)
 *  - POST /api/contact  → validates the message and emails it via Resend
 *
 * Required environment variables (set them in Render, never in frontend code):
 *   RESEND_API_KEY      API key from https://resend.com
 *   CONTACT_TO_EMAIL    Inbox that receives portfolio messages
 * Optional:
 *   CONTACT_FROM_EMAIL  Verified sender, e.g. "Portfolio <hello@yourdomain.com>".
 *                       Defaults to Resend's test sender, which can only deliver
 *                       to the email address that owns the Resend account.
 *   ALLOWED_ORIGINS     Comma-separated extra origins allowed to post the form
 *   PORT                Port to listen on (Render sets this automatically)
 */
import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url)));
const PORT = Number(process.env.PORT) || 8787;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || '';
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
const EMAIL_API_URL = process.env.EMAIL_API_URL || 'https://api.resend.com/emails';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const MAX_BODY = 20 * 1024;
const LIMITS = { name: 100, email: 254, subject: 150, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// ───────── helpers ─────────
function sendJson(res, status, data) {
  res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (typeof fwd === 'string' && fwd.split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';
}

const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}
// Periodically forget old entries so the map cannot grow unbounded
setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of hits) if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(ip);
}, RATE_WINDOW_MS).unref();

function originAllowed(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin requests from some browsers omit it
  try {
    const o = new URL(origin);
    if (o.host === req.headers.host) return true;
    return ALLOWED_ORIGINS.includes(o.origin);
  } catch {
    return false;
  }
}

function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        // Stop buffering, drain the rest, and let the caller answer 413
        req.removeAllListeners('data');
        req.resume();
        reject(Object.assign(new Error('Payload too large'), { status: 413 }));
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolveBody(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

const oneLine = (v) => String(v ?? '').replace(/[\r\n\t]+/g, ' ').trim();
const escapeHtml = (v) =>
  v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function validate(input) {
  const data = {
    name: oneLine(input.name),
    email: oneLine(input.email),
    subject: oneLine(input.subject),
    message: String(input.message ?? '').trim(),
  };
  const errors = {};
  if (data.name.length < 2 || data.name.length > LIMITS.name) errors.name = 'Please enter your name (2–100 characters).';
  if (!EMAIL_RE.test(data.email) || data.email.length > LIMITS.email) errors.email = 'Please enter a valid email address.';
  if (data.subject.length < 3 || data.subject.length > LIMITS.subject)
    errors.subject = 'Please enter a subject (3–150 characters).';
  if (data.message.length < 20 || data.message.length > LIMITS.message)
    errors.message = 'Please enter a message (20–5000 characters).';
  return { data, errors };
}

// ───────── contact endpoint ─────────
async function handleContact(req, res) {
  if (!originAllowed(req)) return sendJson(res, 403, { error: 'Requests from this origin are not allowed.' });
  if (!String(req.headers['content-type'] || '').includes('application/json'))
    return sendJson(res, 415, { error: 'Unsupported content type.' });
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) {
    console.error('[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set');
    return sendJson(res, 503, { error: 'The message service is not configured yet.' });
  }
  if (rateLimited(clientIp(req)))
    return sendJson(res, 429, { error: 'Too many messages in a short time. Please try again in a few minutes.' });

  let input;
  try {
    input = JSON.parse(await readBody(req));
  } catch (err) {
    return sendJson(res, err.status || 400, { error: err.status === 413 ? 'Message is too large.' : 'Invalid request.' });
  }
  if (!input || typeof input !== 'object') return sendJson(res, 400, { error: 'Invalid request.' });

  // Honeypot: real visitors never fill this hidden field
  if (input._gotcha) return sendJson(res, 400, { error: 'Invalid submission.' });

  const { data, errors } = validate(input);
  if (Object.keys(errors).length) return sendJson(res, 422, { error: 'Please correct the highlighted fields.', fields: errors });

  const text = [
    'New message from your portfolio contact form',
    '',
    `Name:    ${data.name}`,
    `Email:   ${data.email}`,
    `Subject: ${data.subject}`,
    '',
    'Message:',
    data.message,
  ].join('\n');

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">
      <h2 style="margin:0 0 12px;font-size:18px">New portfolio message</h2>
      <table style="border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td><strong>${escapeHtml(data.name)}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Subject</td><td>${escapeHtml(data.subject)}</td></tr>
      </table>
      <div style="white-space:pre-wrap;border-left:3px solid #B51F2B;padding-left:12px">${escapeHtml(data.message)}</div>
      <p style="margin-top:20px;font-size:12px;color:#888">Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
    </div>`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const r = await fetch(EMAIL_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL,
        to: [CONTACT_TO_EMAIL],
        reply_to: data.email,
        subject: `[Portfolio] ${data.subject}`,
        text,
        html,
      }),
      signal: controller.signal,
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error(`[contact] email provider responded ${r.status}: ${detail.slice(0, 300)}`);
      return sendJson(res, 502, { error: 'Your message could not be sent right now. Please try again later.' });
    }
    console.log('[contact] message delivered to provider');
    return sendJson(res, 200, { ok: true });
  } catch (err) {
    console.error('[contact] email request failed:', err.name === 'AbortError' ? 'timeout' : err.message);
    return sendJson(res, 502, { error: 'Your message could not be sent right now. Please try again later.' });
  } finally {
    clearTimeout(timer);
  }
}

// ───────── static files ─────────
async function serveStatic(req, res) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400);
    return res.end('Bad request');
  }

  let file = normalize(join(ROOT, pathname));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  let info = await stat(file).catch(() => null);
  if (info?.isDirectory()) {
    file = join(file, 'index.html');
    info = await stat(file).catch(() => null);
  }
  // SPA fallback for unknown paths without a file extension
  if (!info && !extname(pathname)) {
    file = join(ROOT, 'index.html');
    info = await stat(file).catch(() => null);
  }
  if (!info) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Not found');
  }

  const ext = extname(file).toLowerCase();
  const immutable = pathname.startsWith('/assets/');
  res.writeHead(200, {
    ...SECURITY_HEADERS,
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': info.size,
    'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : ext === '.html' ? 'no-cache' : 'public, max-age=86400',
  });
  if (req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

// ───────── server ─────────
http
  .createServer((req, res) => {
    const path = (req.url || '/').split('?')[0];
    if (path === '/api/contact') {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed.' });
      return void handleContact(req, res).catch((err) => {
        console.error('[contact] unexpected error:', err);
        sendJson(res, 500, { error: 'Unexpected server error.' });
      });
    }
    if (path.startsWith('/api/')) return sendJson(res, 404, { error: 'Not found.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      return res.end();
    }
    serveStatic(req, res).catch(() => {
      res.writeHead(500);
      res.end();
    });
  })
  .listen(PORT, () => {
    console.log(`Portfolio server listening on port ${PORT}`);
    if (!RESEND_API_KEY || !CONTACT_TO_EMAIL) console.warn('Contact form disabled: set RESEND_API_KEY and CONTACT_TO_EMAIL');
  });
