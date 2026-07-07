/**
 * SEO-friendly image alt-text generation.
 *
 * Every image served by the API must have descriptive alt text (Phase 4 —
 * Image SEO). Editors can set alt text explicitly via the `*Alt` fields on
 * each model; when those are empty, these helpers generate a sensible,
 * keyword-rich fallback from the document itself so no image is ever altless.
 *
 * Examples produced:
 *   Project image  -> "Maple Leaf Tours website developed by Waglogy"
 *   Project hero   -> "Rhoddo event platform — case study by Waglogy in Gangtok, Sikkim"
 *   Blog image     -> "Why your website is losing customers — Waglogy blog"
 *   Insight image  -> "Software engineering insights — Waglogy insights"
 */

const BRAND = 'Waglogy';
const LOCATION = 'Gangtok, Sikkim';

const clean = (value) => (value == null ? '' : String(value).trim());

// Return the explicit alt if provided, otherwise the generated fallback.
const resolveAlt = (stored, generated) => clean(stored) || generated;

const projectAlt = (doc, variant = 'image') => {
  const title = clean(doc.title) || 'Software project';
  const tag = clean(doc.tag);
  const base = tag ? `${title} ${tag}` : title;
  if (variant === 'hero') {
    return `${base} — case study by ${BRAND} in ${LOCATION}`;
  }
  return `${base} developed by ${BRAND}`;
};

const blogAlt = (doc) => {
  const title = clean(doc.title) || 'Article';
  return `${title} — ${BRAND} blog`;
};

const insightAlt = (doc, variant = 'image') => {
  const title = clean(doc.title) || 'Insight';
  const category = clean(doc.category);
  const base = category ? `${title} (${category})` : title;
  return `${base} — ${BRAND} insights${variant === 'hero' ? ' case study' : ''}`;
};

module.exports = {
  BRAND,
  LOCATION,
  resolveAlt,
  projectAlt,
  blogAlt,
  insightAlt
};
