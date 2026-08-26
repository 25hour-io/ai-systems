import { createHash } from 'node:crypto';

const COMBINING = /[̀-ͯ]/g; // latin diacritics, after NFKD decomposition

/**
 * Normalises for comparison: lowercase, no accents, no punctuation, collapsed spaces.
 * Hebrew is left as it is — nothing is transliterated, so a Hebrew title and its English
 * counterpart stay two distinct entries. That is deliberate.
 */
export function normText(s) {
  if (!s) return '';
  return String(s)
    .normalize('NFKD')
    .replace(COMBINING, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Drops legal suffixes that make one employer look like several across sources. */
function normCompany(s) {
  return normText(s)
    .replace(/\b(ltd|inc|llc|gmbh|sa|sas|bv|plc|co|corp|limited)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Keeps the city only: "Tel Aviv, Israel (Hybrid)" -> "tel aviv".
 * Splitting on punctuation has to happen before normText, which erases it.
 */
function normLocation(s) {
  if (!s) return '';
  const city = String(s).split(/[,(–—-]/)[0];
  return normText(city)
    .replace(/\b(israel|il|remote|hybrid|onsite|on site)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Deduplication key, stable across sources. */
export function jobId(title, company, location) {
  const key = [normText(title), normCompany(company), normLocation(location)].join('|');
  return createHash('sha256').update(key).digest('hex').slice(0, 12);
}

const LINKEDIN_URL = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i;

/**
 * Accepts a company URL only when it points at a real site.
 * Job boards often hand back their own company page, which is of no use here.
 * Returns '' rather than a guessed URL.
 */
export function cleanCompanyUrl(...candidates) {
  for (const c of candidates) {
    if (!c || typeof c !== 'string') continue;
    if (!/^https?:\/\//i.test(c)) continue;
    if (LINKEDIN_URL.test(c)) continue;
    return c.split('?')[0];
  }
  return '';
}

/**
 * Maps a raw scraper object onto the common schema.
 * Every source names its fields differently, so known variants are tried in order.
 */
export function normalizeJob(raw, sourceId) {
  // Scalar values only: on one source `location` is an object ({city, formatted, ...})
  // and stringifying it would yield "[object Object]".
  const pick = (...paths) => {
    for (const p of paths) {
      const v = p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), raw);
      if (typeof v === 'string' && v !== '') return v;
      if (typeof v === 'number') return String(v);
    }
    return '';
  };

  const title = pick('jobTitle', 'title.text', 'title', 'position');
  const company = pick('companyName', 'company.name', 'company', 'employer');
  const location = pick(
    'location',
    'locationEnglish',
    'location.formatted',
    'location.city',
    'jobLocation',
    'city'
  );

  if (!title) return null; // with no title the posting is unusable

  // A posting with no named employer is no longer dropped: agency listings are worth judging
  // on the role alone, so the profile stopped penalising them. An explicit label beats a blank,
  // which keeps the spreadsheet and the digest readable.
  // Accepted consequence: two unnamed postings sharing a title and a city collapse to the same
  // job_id — which is usually one posting relayed by two agencies.
  const employer = company || 'Employer not named';

  const description = pick('jobDescription', 'description.text', 'description', 'snippet');

  return {
    job_id: jobId(title, employer, location),
    title: title.trim(),
    company: employer.trim(),
    company_url: cleanCompanyUrl(
      pick('companyWebsite', 'company.website'),
      pick('companyUrl', 'company.url')
    ),
    location: location.trim(),
    // `portalUrl` first: on one board `applyUrl` points at a session-bound apply endpoint
    // that 404s outside a session. The public posting page is `portalUrl`, and its hash
    // cannot be derived from the job code.
    job_url: pick('portalUrl', 'jobUrl', 'applyUrl', 'apply.url', 'urls.jobPage', 'url'),
    source: sourceId,
    posted: pick('publishedAt', 'postedTime', 'dates.posted', 'postedAt', 'postedDate', 'postedRelative'),
    // Scoring does not need the full posting; capped to keep the context window in budget.
    description: description.slice(0, 2500),
  };
}

/** Deduplicates postings on job_id, first occurrence wins. */
export function dedupeById(jobs) {
  const seen = new Set();
  return jobs.filter((j) => j && !seen.has(j.job_id) && seen.add(j.job_id));
}
