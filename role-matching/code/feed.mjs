/**
 * `feed` sources: a public feed read with `fetch`, with no scraping vendor involved.
 *
 * Cost: zero. No token, no billed compute, no npm dependency — so it runs in the cloud
 * sandbox exactly as it does locally. A feed source sits outside the 29 $/cycle scraping
 * budget, so its yield is judged purely on the noise it adds to scoring.
 *
 * The trade-off: the feed is global — the whole site, every job family. Where a paid
 * actor filters server-side through a `keyword`, filtering happens here, after download,
 * driven by the source's own `filter` block.
 */
import { normalizeJob } from './normalize.mjs';

/** Decodes the most common XML/HTML entities. */
function unescapeXml(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

/** Tag contents, CDATA included. Returns '' when the tag is absent. */
function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '>([^]*?)</' + name + '>'));
  if (!m) return '';
  const inner = m[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '');
  return unescapeXml(inner).trim();
}

/**
 * Strips HTML from a description so scoring sees text only.
 * <style>/<script> blocks go WITH their contents: these descriptions carry a stylesheet
 * pasted out of Word, and without this the scorer reads
 * "a { text-decoration: none; }" at the top of every posting.
 */
function stripHtml(s) {
  return s
    .replace(/<(style|script)[^>]*>[^]*?<\/\1>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Agency XML feed (`<jobs><job>…`).
 *
 * The feed carries NO employer name: this is a staffing agency, and its listings say
 * "a leading company" in Hebrew. The agency itself therefore goes into `company`, so the
 * scorer knows what it is looking at. That is a label, not a penalty — the profile judges
 * these listings on the role alone. The link stays actionable.
 */
function parseAgencyXml(xml, sourceId) {
  return xml
    .split('<job>')
    .slice(1)
    .map((chunk) => {
      const s = chunk.slice(0, chunk.indexOf('</job>'));
      const title = tag(s, 'title');
      if (!title) return null;
      const description = [tag(s, 'description'), tag(s, 'requirements'), tag(s, 'skills')]
        .map(stripHtml)
        .filter(Boolean)
        .join('\n\n');
      return {
        title,
        company: 'Staffing agency (client not named)',
        location: tag(s, 'areas_taxonomy') || tag(s, 'jobArea'),
        jobUrl: tag(s, 'link'),
        publishedAt: tag(s, 'jobCreatedDate'),
        description,
        _scope: tag(s, 'scopes_taxonomy'),
      };
    })
    .filter(Boolean);
}

const PARSERS = { 'agency-xml': parseAgencyXml };

/**
 * Applies the source's `filter` block. An absent criterion filters nothing.
 *
 * `titleInclude` accepts compound expressions ONLY. The Hebrew word for "manager" on its
 * own also matches "accounting manager" — that single-word match is what made one paid
 * source useless, and it is not repeated here.
 */
function applyFilter(items, filter = {}) {
  const { maxAgeHours, areas, titleInclude, titleExclude } = filter;
  const now = Date.now();
  const hasAny = (hay, needles) => needles.some((n) => hay.includes(String(n).toLowerCase()));

  return items.filter((it) => {
    if (maxAgeHours) {
      const t = Date.parse(it.publishedAt);
      if (!Number.isFinite(t) || now - t > maxAgeHours * 3600e3) return false;
    }
    if (areas?.length && !areas.some((a) => (it.location || '').includes(a))) return false;

    const title = (it.title || '').toLowerCase();
    if (titleExclude?.length && hasAny(title, titleExclude)) return false;
    if (titleInclude?.length && !hasAny(title, titleInclude)) return false;
    return true;
  });
}

/**
 * Downloads a feed, parses it, filters it, and returns normalised postings.
 * `max` caps the output AFTER filtering — a free feed has no cost ceiling, only a
 * ceiling on the noise it sends to scoring.
 */
export async function fetchFeed(src, { max = 0, timeoutSecs = 120 } = {}) {
  const parse = PARSERS[src.format];
  if (!parse) throw new Error(`Unknown feed format: ${src.format}`);

  const res = await fetch(src.url, {
    headers: { 'User-Agent': 'job-search-bot/1.0', Accept: 'application/xml,text/xml,*/*' },
    signal: AbortSignal.timeout(timeoutSecs * 1000),
  });
  if (!res.ok) throw new Error(`Feed ${src.url}: HTTP ${res.status}`);

  const all = parse(await res.text(), src.id);
  const kept = applyFilter(all, src.filter);
  const capped = max > 0 ? kept.slice(0, max) : kept;

  process.stderr.write(
    `[feed] ${src.id}: ${all.length} posting(s) in feed, ${kept.length} after filter` +
      `${capped.length < kept.length ? `, ${capped.length} kept (cap)` : ''}\n`
  );

  return capped.map((it) => normalizeJob(it, src.id)).filter(Boolean);
}
