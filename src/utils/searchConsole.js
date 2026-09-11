const { unzipSync, strFromU8 } = require('fflate');
const { parse } = require('csv-parse/sync');
const { createHash } = require('crypto');

const files = { 'Chart.csv': 'Date', 'Queries.csv': 'Top queries', 'Pages.csv': 'Top pages', 'Countries.csv': 'Country', 'Devices.csv': 'Device', 'Filters.csv': 'Filter' };
const properties = ['sc-domain:waglogy.com', 'https://waglogy.com/'];
function invalid(message) { const error = new Error(message); error.statusCode = 400; return error; }
function number(value, label, integer = false) {
  if (typeof value !== 'string' || !/^\d+(\.\d+)?$/.test(value)) throw invalid(`Invalid ${label} in export.`);
  const n = Number(value);
  if (!Number.isFinite(n) || n > Number.MAX_SAFE_INTEGER || (integer && !Number.isSafeInteger(n))) throw invalid(`Invalid ${label} in export.`);
  return n;
}
function totals(rows) {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0,
    position: impressions ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions : null };
}
function parseExport(buffer, property, filename) {
  if (!properties.includes(property)) throw invalid('Choose the Search Console property used for this export.');
  if (!buffer || buffer.length > 2 * 1024 * 1024) throw invalid('Upload a Search Console ZIP smaller than 2 MB.');
  let entries;
  let expanded = 0;
  try {
    entries = unzipSync(buffer, { filter: file => {
      if (!Object.hasOwn(files, file.name)) return false;
      expanded += file.originalSize;
      if (!Number.isFinite(expanded) || expanded > 10 * 1024 * 1024) throw invalid('Expanded export exceeds 10 MB.');
      return true;
    } });
  } catch { throw invalid('Unable to read ZIP. Use a standard Search Console CSV export smaller than 10 MB when extracted.'); }
  const read = name => {
    if (!entries[name]) throw invalid(`Missing ${name}. Export the full Search results report as CSV.`);
    let rows;
    try {
      rows = parse(strFromU8(entries[name]), { bom: true, columns: true, skip_empty_lines: true, max_record_size: 16000 });
    } catch { throw invalid(`Invalid CSV in ${name}.`); }
    if (rows.length > 5000) throw invalid(`${name} has more than 5,000 rows.`);
    if (rows.length && !(files[name] in rows[0])) throw invalid(`Unexpected columns in ${name}. Use an English-language CSV export.`);
    return rows;
  };
  const filters = read('Filters.csv').map(r => ({ name: r.Filter, value: r.Value }));
  if (filters.some(r => typeof r.name !== 'string' || typeof r.value !== 'string' || r.name.length > 100 || r.value.length > 1000)) throw invalid('Invalid report filters.');
  if (filters.find(r => r.name === 'Search type')?.value !== 'Web') throw invalid('Choose the Web search type before exporting.');
  const metrics = (name) => read(name).map(r => {
    const key = r[files[name]];
    if (!key || key.length > 4000) throw invalid(`Invalid label in ${name}.`);
    const clicks = number(r.Clicks, 'clicks', true), impressions = number(r.Impressions, 'impressions', true);
    const position = number(r.Position, 'position');
    if (clicks > impressions) throw invalid(`Clicks exceed impressions in ${name}.`);
    return { key, clicks, impressions, ctr: impressions ? clicks / impressions : 0, position };
  });
  const daily = metrics('Chart.csv').sort((a,b) => a.key.localeCompare(b.key));
  if (!daily.length) throw invalid('Chart.csv contains no daily data.');
  const dates = new Set();
  for (const r of daily) {
    const d = new Date(r.key);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.key) || Number.isNaN(d.getTime()) || d.toISOString().slice(0,10) !== r.key || dates.has(r.key)) throw invalid('Chart.csv must contain unique daily dates, not a comparison or weekly report.');
    dates.add(r.key);
  }
  const queries = metrics('Queries.csv'), pages = metrics('Pages.csv'), countries = metrics('Countries.csv'), devices = metrics('Devices.csv');
  for (const p of pages) {
    let url;
    try { url = new URL(p.key); } catch { throw invalid('Invalid page URL.'); }
    if (url.hostname !== 'waglogy.com' && !url.hostname.endsWith('.waglogy.com')) throw invalid('The export contains pages outside waglogy.com.');
    if (property === 'https://waglogy.com/' && (url.hostname !== 'waglogy.com' || url.protocol !== 'https:')) throw invalid('This export includes URLs outside the selected HTTPS property. Choose the correct property.');
  }
  const data = { property, filters, startDate: daily[0].key, endDate: daily[daily.length-1].key, daily, queries, pages, countries, devices };
  const fingerprint = createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return { ...data, fingerprint, sourceFile: String(filename || 'Search Console export.zip').replace(/[\r\n]/g, ' ').slice(0,200), totals: totals(daily) };
}
module.exports = { parseExport, totals, properties };
