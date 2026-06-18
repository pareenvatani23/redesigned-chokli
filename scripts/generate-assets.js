/**
 * Generates Tally's brand assets (app icon, adaptive icon layers, splash, favicon,
 * Play Store hi-res icon & feature graphic) as PNGs — no native image deps.
 *
 * Brand mark: five "tally marks" (four vertical strokes + one diagonal) — the
 * universal symbol for counting, and a literal nod to the app's name.
 *
 *   node scripts/generate-assets.js
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const BLUE = [0x4f, 0x8d, 0xfd];
const BLUE_DEEP = [0x2f, 0x6b, 0xe0];
const WHITE = [0xff, 0xff, 0xff];

// ---- PNG encoding -----------------------------------------------------------
let CRC_TABLE;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const rowLen = width * 4;
  const raw = Buffer.alloc((rowLen + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (rowLen + 1)] = 0; // filter: none
    rgba.copy(raw, y * (rowLen + 1) + 1, y * rowLen, y * rowLen + rowLen);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ---- tiny raster canvas -----------------------------------------------------
function canvas(w, h) {
  return { w, h, data: Buffer.alloc(w * h * 4) };
}
function blend(c, x, y, rgb, a) {
  if (x < 0 || y < 0 || x >= c.w || y >= c.h || a <= 0) return;
  const i = (y * c.w + x) * 4;
  const inv = 1 - a;
  c.data[i] = Math.round(rgb[0] * a + c.data[i] * inv);
  c.data[i + 1] = Math.round(rgb[1] * a + c.data[i + 1] * inv);
  c.data[i + 2] = Math.round(rgb[2] * a + c.data[i + 2] * inv);
  c.data[i + 3] = Math.min(255, Math.round(255 * a + c.data[i + 3] * inv));
}
function fillVerticalGradient(c, top, bottom) {
  for (let y = 0; y < c.h; y++) {
    const t = y / (c.h - 1);
    const rgb = [0, 1, 2].map((k) => Math.round(top[k] * (1 - t) + bottom[k] * t));
    for (let x = 0; x < c.w; x++) blend(c, x, y, rgb, 1);
  }
}
// distance from point to segment
function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}
function stroke(c, ax, ay, bx, by, halfW, rgb) {
  const minX = Math.max(0, Math.floor(Math.min(ax, bx) - halfW - 2));
  const maxX = Math.min(c.w - 1, Math.ceil(Math.max(ax, bx) + halfW + 2));
  const minY = Math.max(0, Math.floor(Math.min(ay, by) - halfW - 2));
  const maxY = Math.min(c.h - 1, Math.ceil(Math.max(ay, by) + halfW + 2));
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d = segDist(x + 0.5, y + 0.5, ax, ay, bx, by);
      const cov = Math.max(0, Math.min(1, halfW + 0.5 - d));
      if (cov > 0) blend(c, x, y, rgb, cov);
    }
  }
}

/** Draw the five tally marks centered in a box [cx,cy] of size `box`. */
function drawTally(c, cx, cy, box, rgb) {
  const halfW = box * 0.05;
  const top = cy - box / 2;
  const bot = cy + box / 2;
  const spacing = box * 0.26;
  const startX = cx - spacing * 1.5;
  for (let i = 0; i < 4; i++) {
    const x = startX + i * spacing;
    stroke(c, x, top, x, bot, halfW, rgb);
  }
  // diagonal slash across all four
  stroke(c, startX - spacing * 0.35, bot, startX + spacing * 3 + spacing * 0.35, top, halfW, rgb);
}

function write(file, c) {
  fs.writeFileSync(file, encodePNG(c.w, c.h, c.data));
  console.log('wrote', path.relative(process.cwd(), file), `${c.w}x${c.h}`);
}

const A = path.join(__dirname, '..', 'assets');
const STORE = path.join(A, 'store');
fs.mkdirSync(STORE, { recursive: true });

// 1) Main app icon (1024) — blue gradient + white tally
{
  const c = canvas(1024, 1024);
  fillVerticalGradient(c, BLUE, BLUE_DEEP);
  drawTally(c, 512, 512, 560, WHITE);
  write(path.join(A, 'icon.png'), c);
  write(path.join(STORE, 'play-icon-512.png'), downscale(c, 512));
}
// 2) Adaptive foreground (transparent + white tally, inside safe zone ~62%)
{
  const c = canvas(1024, 1024);
  drawTally(c, 512, 512, 470, WHITE);
  write(path.join(A, 'android-icon-foreground.png'), c);
}
// 3) Adaptive background (solid brand)
{
  const c = canvas(1024, 1024);
  fillVerticalGradient(c, BLUE, BLUE_DEEP);
  write(path.join(A, 'android-icon-background.png'), c);
}
// 4) Monochrome (themed icons) — white tally on transparent
{
  const c = canvas(432, 432);
  drawTally(c, 216, 216, 210, WHITE);
  write(path.join(A, 'android-icon-monochrome.png'), c);
}
// 5) Splash icon — white tally on transparent (over brand bg)
{
  const c = canvas(1024, 1024);
  drawTally(c, 512, 512, 520, WHITE);
  write(path.join(A, 'splash-icon.png'), c);
}
// 6) Favicon
{
  const c = canvas(64, 64);
  fillVerticalGradient(c, BLUE, BLUE_DEEP);
  drawTally(c, 32, 32, 36, WHITE);
  write(path.join(A, 'favicon.png'), c);
}
// 7) Play Store feature graphic 1024x500
{
  const c = canvas(1024, 500);
  fillVerticalGradient(c, BLUE, BLUE_DEEP);
  drawTally(c, 250, 250, 300, WHITE);
  write(path.join(STORE, 'feature-graphic-1024x500.png'), c);
}

// nearest-neighbour downscale helper (used after declaration via hoisting)
function downscale(src, size) {
  const c = canvas(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.floor((x / size) * src.w);
      const sy = Math.floor((y / size) * src.h);
      const si = (sy * src.w + sx) * 4;
      const di = (y * size + x) * 4;
      src.data.copy(c.data, di, si, si + 4);
    }
  }
  return c;
}
