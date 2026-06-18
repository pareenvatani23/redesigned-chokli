/**
 * Generates Google Play phone screenshots (1080×1920) that faithfully mirror
 * Tally's real UI — same palette, type scale, and layout as the app — rendered
 * as SVG and rasterized with @resvg/resvg-js (no emulator needed).
 *
 *   node scripts/generate-screenshots.js
 */
const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const W = 1080;
const H = 1920;

const FONT_DIR = '/mnt/skills/examples/canvas-design/canvas-fonts';
const FONTS = [path.join(FONT_DIR, 'Outfit-Regular.ttf'), path.join(FONT_DIR, 'Outfit-Bold.ttf')];

// Palettes mirror src/theme/theme.ts
const light = {
  bg: '#F7F8FA', card: '#FFFFFF', border: '#E6E8EC', text: '#10131A',
  muted: '#5B6270', faint: '#9AA0AC', primary: '#4F8DFD', success: '#34C759', track: '#ECEEF2',
};
const dark = {
  bg: '#0B0D12', card: '#161A23', border: '#262B36', text: '#F2F4F8',
  muted: '#9AA2B1', faint: '#6B7280', primary: '#5A93FF', success: '#32D74B', track: '#1E222D',
};

// ---- svg helpers ------------------------------------------------------------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
function text(x, y, s, { size = 32, color = '#000', weight = 400, anchor = 'start', spacing = 0 } = {}) {
  const ls = spacing ? ` letter-spacing="${spacing}"` : '';
  return `<text x="${x}" y="${y}" font-family="Outfit" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}"${ls}>${esc(s)}</text>`;
}
function rrect(x, y, w, h, r, fill, stroke, sw = 2) {
  const s = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}"${s}/>`;
}
function circle(cx, cy, r, fill, stroke, sw = 0) {
  const s = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${s}/>`;
}
function statusBar(p) {
  return [
    text(60, 70, '9:41', { size: 30, weight: 700, color: p.text }),
    // signal / wifi / battery glyphs (simple)
    rrect(W - 150, 50, 28, 22, 4, p.text),
    rrect(W - 112, 46, 36, 26, 4, p.text),
    rrect(W - 70, 44, 50, 28, 6, 'none', p.text, 3) + rrect(W - 62, 50, 30, 16, 2, p.text),
  ].join('');
}
function ring(cx, cy, rad, frac, p, big, small) {
  const C = 2 * Math.PI * rad;
  const off = C * (1 - frac);
  return [
    circle(cx, cy, rad, 'none', p.track, 22),
    `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="none" stroke="${frac >= 1 ? p.success : p.primary}" stroke-width="22" stroke-linecap="round" stroke-dasharray="${C} ${C}" stroke-dashoffset="${off}" transform="rotate(-90 ${cx} ${cy})"/>`,
    text(cx, cy + 8, big, { size: 70, weight: 700, color: p.text, anchor: 'middle' }),
    text(cx, cy + 52, small, { size: 28, weight: 600, color: p.muted, anchor: 'middle' }),
  ].join('');
}
// simple white glyphs in a 100x100 box at (x,y), scaled
function glyph(kind, x, y, size, color) {
  const s = size / 100;
  const g = (inner) => `<g transform="translate(${x},${y}) scale(${s})" fill="${color}" stroke="${color}">${inner}</g>`;
  switch (kind) {
    case 'drop':
      return g(`<path d="M50 12 C50 12 22 46 22 64 a28 28 0 0 0 56 0 C78 46 50 12 50 12 Z" stroke="none"/>`);
    case 'book':
      return g(`<path d="M20 22 h26 a6 6 0 0 1 6 6 v50 a6 6 0 0 0 -6 -6 h-26 Z M80 22 h-26 a6 6 0 0 0 -6 6 v50 a6 6 0 0 1 6 -6 h26 Z" stroke="none"/>`);
    case 'dumbbell':
      return g(`<rect x="16" y="44" width="68" height="12" rx="4" stroke="none"/><rect x="10" y="34" width="14" height="32" rx="5" stroke="none"/><rect x="76" y="34" width="14" height="32" rx="5" stroke="none"/>`);
    case 'leaf':
      return g(`<path d="M24 76 C24 40 56 22 80 22 C80 58 56 78 24 76 Z" stroke="none"/><path d="M34 70 C46 56 60 46 74 40" fill="none" stroke-width="4"/>`);
    case 'flame':
      return g(`<path d="M52 14 C58 34 76 40 70 64 a22 22 0 0 1 -44 2 C24 50 36 48 38 36 C46 44 44 28 52 14 Z" stroke="none"/>`);
    case 'check':
      return g(`<path d="M24 52 L42 70 L78 30" fill="none" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`);
    case 'tabToday':
      return g(`<rect x="20" y="20" width="60" height="60" rx="12" fill="none" stroke-width="8"/><path d="M34 50 L46 62 L68 36" fill="none" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`);
    case 'tabStats':
      return g(`<rect x="22" y="52" width="14" height="28" rx="4" stroke="none"/><rect x="43" y="34" width="14" height="46" rx="4" stroke="none"/><rect x="64" y="20" width="14" height="60" rx="4" stroke="none"/>`);
    case 'tabSettings':
      return g(`<circle cx="50" cy="50" r="16" fill="none" stroke-width="8"/><circle cx="50" cy="50" r="34" fill="none" stroke-width="8" stroke-dasharray="10 12"/>`);
    default:
      return '';
  }
}
function iconTile(x, y, size, color, kind) {
  const r = 20;
  const pad = size * 0.24;
  return rrect(x, y, size, size, r, color + '22') + glyph(kind, x + pad, y + pad, size - pad * 2, color);
}
function checkCircle(cx, cy, r, color, done, p) {
  if (done) return circle(cx, cy, r, color) + glyph('check', cx - r, cy - r, r * 2, '#fff');
  return circle(cx, cy, r, 'none', p.border, 5);
}
function habitRow(y, p, { name, color, kind, streak, done }) {
  const x = 60, w = W - 120, h = 150, pad = 40, size = 96;
  const flame = streak > 0
    ? glyph('flame', x + pad, y + 92, 30, '#FF9F0A') + text(x + pad + 40, y + 116, `${streak} day${streak === 1 ? '' : 's'} streak`, { size: 28, weight: 600, color: p.muted })
    : text(x + pad, y + 116, 'Start your streak', { size: 28, weight: 600, color: p.muted });
  return [
    rrect(x, y, w, h, 32, p.card, p.border, 2),
    iconTile(x + pad, y + (h - size) / 2, size, color, kind),
    text(x + pad + size + 32, y + 70, name, { size: 38, weight: 700, color: p.text }),
    flame,
    checkCircle(x + w - pad - 38, y + h / 2, 38, color, done, p),
  ].join('');
}
function tabBar(p, active) {
  const y = H - 150;
  const tabs = [['tabToday', 'TODAY', 'today'], ['tabStats', 'PROGRESS', 'stats'], ['tabSettings', 'SETTINGS', 'settings']];
  const items = tabs.map(([icon, label, key], i) => {
    const cx = W / 6 + (i * W) / 3;
    const on = key === active;
    const col = on ? p.primary : p.faint;
    return glyph(icon, cx - 30, y + 24, 60, col) + text(cx, y + 118, label, { size: 22, weight: 700, color: col, anchor: 'middle', spacing: 1 });
  });
  return rrect(0, y, W, 150, 0, p.card) + `<rect x="0" y="${y}" width="${W}" height="3" fill="${p.border}"/>` + items.join('');
}
function heatmap(x, y, p, color, cols = 18, seedRate = 0.7, cell = 30, gap = 8) {
  let out = '';
  let seed = 1234;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < 7; r++) {
      const cx = x + c * (cell + gap);
      const cy = y + r * (cell + gap);
      const done = rnd() < seedRate && !(c === cols - 1 && r > 4);
      out += rrect(cx, cy, cell, cell, 6, done ? color : p.track);
    }
  }
  return out;
}
function frame(inner, p) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`
    + rrect(0, 0, W, H, 0, p.bg) + statusBar(p) + inner + `</svg>`;
}

// ---- screens ----------------------------------------------------------------
function todaySVG() {
  const p = light;
  let s = '';
  s += text(60, 175, 'TODAY', { size: 26, weight: 700, color: p.primary, spacing: 2 });
  s += text(60, 235, 'Thursday, June 18', { size: 60, weight: 700, color: p.text });
  s += circle(W - 110, 200, 52, p.primary) + text(W - 110, 222, '+', { size: 70, weight: 700, color: '#fff', anchor: 'middle' });
  // progress card
  s += rrect(60, 300, W - 120, 460, 40, p.card, p.border, 2);
  s += ring(W / 2, 500, 130, 2 / 3, p, '2/3', 'completed');
  s += text(W / 2, 700, "1 to go. You've got this.", { size: 32, weight: 600, color: p.muted, anchor: 'middle' });
  // rows
  s += habitRow(820, p, { name: 'Drink water', color: '#4F8DFD', kind: 'drop', streak: 12, done: true });
  s += habitRow(1000, p, { name: 'Read 20 minutes', color: '#FF9F0A', kind: 'book', streak: 5, done: true });
  s += habitRow(1180, p, { name: 'Workout', color: '#FF6482', kind: 'dumbbell', streak: 3, done: false });
  s += tabBar(p, 'today');
  return frame(s, p);
}
function progressSVG() {
  const p = light;
  let s = '';
  s += text(60, 200, 'Progress', { size: 64, weight: 700, color: p.text });
  // totals
  s += rrect(60, 260, W - 120, 200, 32, p.card, p.border, 2);
  const tw = (W - 120) / 3;
  const totals = [['3', 'HABITS'], ['142', 'CHECK-INS'], ['21', 'BEST STREAK']];
  totals.forEach(([v, l], i) => {
    const cx = 60 + tw * i + tw / 2;
    s += text(cx, 350, v, { size: 56, weight: 700, color: p.text, anchor: 'middle' });
    s += text(cx, 400, l, { size: 24, weight: 700, color: p.faint, anchor: 'middle', spacing: 1 });
    if (i < 2) s += `<rect x="${60 + tw * (i + 1)}" y="320" width="2" height="80" fill="${p.border}"/>`;
  });
  // cards with heatmaps
  const card = (y, name, color, kind, rate, streak, seed) => {
    let c = rrect(60, y, W - 120, 440, 32, p.card, p.border, 2);
    c += iconTile(100, y + 40, 70, color, kind);
    c += text(190, y + 90, name, { size: 38, weight: 700, color: p.text });
    c += glyph('flame', W - 240, y + 56, 30, '#FF9F0A') + text(W - 200, y + 80, `${streak}`, { size: 34, weight: 700, color: p.muted });
    c += heatmap(100, y + 150, p, color, 16, seed, 26, 7);
    c += text(100, y + 410, `${rate}% last 30 days`, { size: 28, weight: 600, color: p.faint });
    return c;
  };
  s += card(520, 'Drink water', '#4F8DFD', 'drop', 87, 12, 0.82);
  s += card(1000, 'Meditate', '#34C759', 'leaf', 73, 8, 0.66);
  s += tabBar(p, 'stats');
  return frame(s, p);
}
function detailSVG() {
  const p = dark;
  const color = '#4F8DFD';
  let s = '';
  s += text(60, 130, 'Close', { size: 34, weight: 600, color: p.muted });
  s += text(W - 60, 130, 'Edit', { size: 34, weight: 700, color: p.primary, anchor: 'end' });
  // header
  s += rrect(W / 2 - 90, 200, 180, 180, 36, color + '22');
  s += glyph('drop', W / 2 - 60, 230, 120, color);
  s += text(W / 2, 450, 'Drink water', { size: 52, weight: 700, color: p.text, anchor: 'middle' });
  s += text(W / 2, 500, 'Every day · 8:00 AM', { size: 30, weight: 600, color: p.muted, anchor: 'middle' });
  // stats row
  s += rrect(60, 560, W - 120, 180, 32, p.card, p.border, 2);
  const sw = (W - 120) / 4;
  const stats = [['12', 'CURRENT'], ['21', 'BEST'], ['142', 'TOTAL'], ['87%', '30 DAYS']];
  stats.forEach(([v, l], i) => {
    const cx = 60 + sw * i + sw / 2;
    s += text(cx, 640, v, { size: 48, weight: 700, color: p.text, anchor: 'middle' });
    s += text(cx, 690, l, { size: 22, weight: 700, color: p.faint, anchor: 'middle', spacing: 1 });
    if (i < 3) s += `<rect x="${60 + sw * (i + 1)}" y="600" width="2" height="80" fill="${p.border}"/>`;
  });
  // history card
  s += rrect(60, 790, W - 120, 540, 32, p.card, p.border, 2);
  s += text(100, 860, 'History', { size: 38, weight: 700, color: p.text });
  s += heatmap(100, 920, p, color, 18, 0.78);
  // buttons
  s += rrect(60, 1390, W - 120, 110, 28, p.primary) + text(W / 2, 1458, 'Mark done today', { size: 38, weight: 700, color: '#0B0D12', anchor: 'middle' });
  s += rrect(60, 1520, W - 120, 110, 28, 'none', p.border, 2) + text(W / 2, 1588, 'Delete habit', { size: 36, weight: 700, color: '#FF6961', anchor: 'middle' });
  return frame(s, p);
}

// ---- render -----------------------------------------------------------------
function render(svg, file) {
  const r = new Resvg(svg, {
    fitTo: { mode: 'width', value: W },
    font: { fontFiles: FONTS, loadSystemFonts: false, defaultFontFamily: 'Outfit' },
  });
  fs.writeFileSync(file, r.render().asPng());
  console.log('wrote', path.relative(process.cwd(), file));
}

const OUT = path.join(__dirname, '..', 'store', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });
render(todaySVG(), path.join(OUT, '01-today.png'));
render(progressSVG(), path.join(OUT, '02-progress.png'));
render(detailSVG(), path.join(OUT, '03-detail.png'));
console.log('done');
