// news-image-20261121: sum up Saturday 21 November 2026's world news in one image.
//
// Pure Node 22+ standard library only. Draws a 1024x1024 newspaper front page,
// "THE DAILY GLOBE", with six verified stories from 21 November 2026 (each
// happened or first reported that day) plus a footer strip of three more,
// and writes it as a deterministic PNG to $MAKEFUN_OUTPUT_DIR/entry.png
// (default /output). No network, no fonts, no third-party code: the bitmap
// font below and the PNG encoder are written here from scratch, so both
// runs produce identical bytes.
//
// Stories (all verified against live news on 21 Nov 2026):
//  1. Russian Kh-101 missiles and a jet drone crash in south-east Poland
//     during allied war games; PM Tusk calls it an intentional provocation.
//  2. Magnitude 6.8 earthquake strikes Junin, Peru; felt in Lima.
//  3. Gen Z youth protests sweep 25+ European countries over living costs,
//     education cuts and military spending.
//  4. COP31 climate talks in Turkey stall over fossil fuels and finance.
//  5. KL Rahul scores 100 in Wellington, first Indian opener with Test
//     centuries in South Africa, England, New Zealand and Australia.
//  6. Cyclone Akvan crosses the Odisha-Andhra coast near Gopalpur, India.
//
// Usage: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

export const W = 1024;
export const H = 1024;

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const PAPER: [number, number, number] = [248, 244, 232];
const INK: [number, number, number] = [17, 17, 17];
const RED: [number, number, number] = [163, 18, 18];
const GREY: [number, number, number] = [90, 86, 76];
const LIGHT: [number, number, number] = [232, 226, 210];

// ---------------------------------------------------------------------------
// Framebuffer: 3 bytes per pixel, row major.
// ---------------------------------------------------------------------------
const fb = new Uint8Array(W * H * 3);
for (let i = 0; i < W * H; i++) {
  fb[i * 3] = PAPER[0];
  fb[i * 3 + 1] = PAPER[1];
  fb[i * 3 + 2] = PAPER[2];
}

function setPx(x: number, y: number, c: [number, number, number]): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  fb[i] = c[0];
  fb[i + 1] = c[1];
  fb[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: [number, number, number]): void {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) setPx(xx, yy, c);
  }
}

function hline(x: number, y: number, w: number, c: [number, number, number], t = 1): void {
  fillRect(x, y, w, t, c);
}

function vline(x: number, y: number, h: number, c: [number, number, number], t = 1): void {
  fillRect(x, y, t, h, c);
}

// Bresenham line, thickness 1.
function line(x0: number, y0: number, x1: number, y1: number, c: [number, number, number]): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    setPx(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function circle(cx: number, cy: number, r: number, c: [number, number, number]): void {
  for (let a = 0; a < 360; a += 2) {
    const rad = (a * Math.PI) / 180;
    setPx(Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), c);
  }
}

function disc(cx: number, cy: number, r: number, c: [number, number, number]): void {
  for (let yy = -r; yy <= r; yy++) {
    for (let xx = -r; xx <= r; xx++) {
      if (xx * xx + yy * yy <= r * r) setPx(cx + xx, cy + yy, c);
    }
  }
}

// ---------------------------------------------------------------------------
// 5x7 bitmap font. Each glyph is 7 rows; each row is a 5-bit number, bit 4
// is the leftmost pixel. Only capitals, digits and common punctuation:
// all text in this image is upper-case.
// ---------------------------------------------------------------------------
const FONT: Record<string, number[]> = {
  A: [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  B: [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  C: [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  D: [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  E: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  F: [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  G: [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  H: [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  I: [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  J: [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  K: [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  L: [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  M: [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  N: [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  O: [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  P: [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  Q: [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  R: [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  S: [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  T: [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  U: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  V: [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  W: [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0a],
  X: [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  Y: [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  Z: [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ',': [0, 0, 0, 0, 0x0c, 0x04, 0x08],
  ':': [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],
  ';': [0, 0x0c, 0x0c, 0, 0x0c, 0x04, 0x08],
  "'": [0x04, 0x04, 0x08, 0, 0, 0, 0],
  '-': [0, 0, 0, 0x0e, 0, 0, 0],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0, 0x04],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  '%': [0x19, 0x1a, 0x02, 0x04, 0x08, 0x0b, 0x13],
  '&': [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  '+': [0, 0x04, 0x04, 0x1f, 0x04, 0x04, 0],
  '=': [0, 0, 0x1f, 0, 0x1f, 0, 0],
  '*': [0, 0x04, 0x15, 0x0e, 0x15, 0x04, 0],
  '"': [0x0a, 0x0a, 0, 0, 0, 0, 0],
  '#': [0x0a, 0x0a, 0x1f, 0x0a, 0x1f, 0x0a, 0x0a],
  $: [0x04, 0x0f, 0x14, 0x0e, 0x05, 0x1e, 0x04],
  _: [0, 0, 0, 0, 0, 0, 0x1f],
  '>': [0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08],
  '<': [0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02],
  '\u2022': [0, 0, 0x0c, 0x0c, 0x0c, 0, 0],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function drawText(x: number, y: number, s: string, scale: number, c: [number, number, number]): void {
  let cx = x;
  for (const ch of s) {
    const glyph = FONT[ch] ?? FONT['?'];
    for (let row = 0; row < 7; row++) {
      const bits = glyph[row];
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) {
          fillRect(cx + col * scale, y + row * scale, scale, scale, c);
        }
      }
    }
    cx += 6 * scale;
  }
}

function drawTextCentered(cx: number, y: number, s: string, scale: number, c: [number, number, number]): void {
  drawText(cx - Math.floor(textWidth(s, scale) / 2), y, s, scale, c);
}

// Word-wrap plain text to a pixel width; returns the lines.
function wrap(s: string, scale: number, maxW: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const test = cur === '' ? w : cur + ' ' + w;
    if (textWidth(test, scale) <= maxW) {
      cur = test;
    } else {
      if (cur !== '') lines.push(cur);
      cur = w;
    }
  }
  if (cur !== '') lines.push(cur);
  return lines;
}

function drawPara(x: number, y: number, s: string, scale: number, maxW: number, c: [number, number, number]): number {
  const lines = wrap(s, scale, maxW);
  for (let i = 0; i < lines.length; i++) {
    drawText(x, y + i * 9 * scale, lines[i], scale, c);
  }
  return y + lines.length * 9 * scale;
}

// ---------------------------------------------------------------------------
// PNG encoder: 8-bit RGB, filter 0, zlib level 9. Fully deterministic.
// ---------------------------------------------------------------------------
const CRC_TABLE: Uint32Array = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crc = crc32(out.subarray(4, 8 + data.length));
  dv.setUint32(8 + data.length, crc);
  return out;
}

function encodePng(): Uint8Array {
  const raw = new Uint8Array((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0;
    raw.set(fb.subarray(y * W * 3, (y + 1) * W * 3), y * (W * 3 + 1) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W);
  dv.setUint32(4, H);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const parts = [sig, pngChunk('IHDR', ihdr), pngChunk('IDAT', idat), pngChunk('IEND', new Uint8Array(0))];
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Small drawn illustrations (all geometric, no images).
// ---------------------------------------------------------------------------

// Lead art: a cruise missile streaking down-left with a starburst blast.
function drawMissile(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHT);
  vline(x, y, h, INK, 2);
  // sky-to-ground diagonal trail
  line(x + 20, y + 18, x + w - 70, y + h - 60, GREY);
  line(x + 26, y + 26, x + w - 64, y + h - 54, GREY);
  // missile body
  const mx = x + w - 90;
  const my = y + 28;
  line(mx, my, mx + 46, my + 26, INK);
  line(mx, my + 6, mx + 46, my + 32, INK);
  line(mx + 46, my + 26, mx + 58, my + 22, INK);
  line(mx + 46, my + 32, mx + 58, my + 36, INK);
  line(mx + 58, my + 22, mx + 58, my + 36, INK);
  disc(mx + 8, my + 16, 4, RED);
  // blast starburst where it lands
  const bx = x + 70;
  const by = y + h - 55;
  for (let a = 0; a < 360; a += 15) {
    const rad = (a * Math.PI) / 180;
    const len = a % 30 === 0 ? 42 : 26;
    line(bx, by, Math.round(bx + len * Math.cos(rad)), Math.round(by + len * Math.sin(rad)), RED);
  }
  disc(bx, by, 12, RED);
  disc(bx, by, 5, INK);
  // ground line
  hline(x + 12, y + h - 14, w - 24, INK, 2);
  drawText(x + 12, y + h - 34, 'KH-101', 1, GREY);
}

// Seismograph: jagged trace over cracked ground.
function drawQuake(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHT);
  const mid = y + Math.floor(h / 2);
  let px = x + 6;
  let py = mid;
  const peaks = [0, 2, -3, 8, -14, 22, -30, 18, -10, 6, -2, 0];
  for (const p of peaks) {
    const nx = px + Math.floor((w - 12) / peaks.length);
    line(px, py, nx, mid + p, INK);
    px = nx;
    py = mid + p;
  }
  // cracked ground
  line(x + 8, y + h - 12, x + w / 3, y + h - 22, INK);
  line(x + w / 3, y + h - 22, x + (w * 2) / 3, y + h - 10, INK);
  line(x + (w * 2) / 3, y + h - 10, x + w - 8, y + h - 18, INK);
  drawText(x + 8, y + 6, 'M 6.8', 2, RED);
}

// Crowd: rows of small figures holding placards.
function drawCrowd(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHT);
  const cols = 6;
  const step = Math.floor(w / cols);
  for (let r = 0; r < 3; r++) {
    const cy = y + 26 + r * 22;
    for (let i = 0; i < cols; i++) {
      const cx = x + Math.floor(step / 2) + i * step;
      disc(cx, cy, 4, INK); // head
      fillRect(cx - 3, cy + 5, 6, 11, INK); // body
    }
  }
  // placards
  fillRect(x + 6, y + 6, 40, 12, RED);
  drawText(x + 8, y + 8, 'FUTURE', 1, PAPER);
  fillRect(x + w - 52, y + 6, 46, 12, INK);
  drawText(x + w - 50, y + 8, 'NOT WAR', 1, PAPER);
}

// Globe with sun: COP31 climate.
function drawGlobe(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHT);
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2) + 4;
  circle(cx, cy, 30, INK);
  // meridians
  for (const dx of [-15, 0, 15]) {
    for (let yy = -30; yy <= 30; yy++) {
      const half = Math.sqrt(Math.max(0, 900 - yy * yy));
      const xx = dx === 0 ? 0 : Math.round((dx / 15) * half * 0.6);
      setPx(cx + xx, cy + yy, INK);
    }
  }
  hline(cx - 30, cy, 60, INK);
  // sun top-right
  disc(cx + 34, cy - 34, 8, RED);
  for (let a = 0; a < 360; a += 45) {
    const rad = (a * Math.PI) / 180;
    line(cx + 34, cy - 34, Math.round(cx + 34 + 14 * Math.cos(rad)), Math.round(cy - 34 + 14 * Math.sin(rad)), RED);
  }
  drawText(x + 8, y + 6, 'COP31', 2, RED);
}

// Cricket: bat, ball and stumps.
function drawCricket(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHT);
  // stumps
  for (const dx of [-10, 0, 10]) {
    fillRect(x + w - 34 + dx, y + h - 46, 4, 34, INK);
  }
  hline(x + w - 46, y + h - 50, 26, INK, 3);
  // bat, angled
  line(x + 22, y + 16, x + 52, y + h - 40, INK);
  line(x + 28, y + 18, x + 58, y + h - 38, INK);
  line(x + 22, y + 16, x + 28, y + 18, INK);
  line(x + 52, y + h - 40, x + 58, y + h - 38, INK);
  // ball
  disc(x + 66, y + 26, 7, RED);
  // score
  drawText(x + 8, y + 6, '100', 2, RED);
  drawText(x + 8, y + h - 22, 'SENA SET', 1, GREY);
}

// Cyclone spiral.
function drawCyclone(x: number, y: number, w: number, h: number): void {
  fillRect(x, y, w, h, LIGHT);
  const cx = x + Math.floor(w / 2);
  const cy = y + Math.floor(h / 2);
  for (let t = 0; t < 540; t += 4) {
    const rad = (t * Math.PI) / 180;
    const r = 4 + t * 0.075;
    setPx(Math.round(cx + r * Math.cos(rad)), Math.round(cy + r * Math.sin(rad)), INK);
    setPx(Math.round(cx + r * Math.cos(rad)) + 1, Math.round(cy + r * Math.sin(rad)), INK);
  }
  disc(cx, cy, 6, RED);
  drawText(x + 8, y + 6, 'AKVAN', 2, RED);
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
const M = 28; // margin
const CW = W - 2 * M; // 968 content width

// Masthead
drawTextCentered(W / 2, 34, 'THE DAILY GLOBE', 6, INK);
drawTextCentered(W / 2, 92, 'SATURDAY, 21 NOVEMBER 2026', 2, RED);
drawTextCentered(W / 2, 116, "THE WORLD'S NEWS IN ONE IMAGE", 1, GREY);
hline(M, 140, CW, INK, 4);
hline(M, 148, CW, INK, 1);

// ---- Lead story: Poland ----
let y = 168;
drawText(M, y, 'EUROPE  /  SECURITY', 2, RED);
y += 26;
drawText(M, y, 'RUSSIAN MISSILES', 5, INK);
y += 46;
drawText(M, y, 'LAND IN POLAND', 5, INK);
y += 52;
const leadText =
  'TWO KH-101 CRUISE MISSILES AND A JET DRONE CRASH IN SOUTH-EAST POLAND DURING ALLIED WAR GAMES. PM DONALD TUSK CALLS IT AN INTENTIONAL PROVOCATION. NATO CHIEF MARK RUTTE CALLS IT A GRAVE VIOLATION OF POLISH AIRSPACE.';
drawPara(M, y, leadText, 2, 590, INK);
drawMissile(M + 620, 168, 348, 240);
hline(M, 428, CW, INK, 2);

// ---- 2x2 grid of stories ----
interface Story {
  kicker: string;
  head: string;
  body: string;
  art: (x: number, y: number, w: number, h: number) => void;
}

const stories: Story[] = [
  {
    kicker: 'LATIN AMERICA  /  DISASTER',
    head: '6.8 QUAKE SHAKES PERU',
    body: 'A MAGNITUDE 6.8 EARTHQUAKE STRIKES JUNIN IN THE ANDES. TREMORS ARE FELT IN LIMA, 320 KM AWAY.',
    art: drawQuake,
  },
  {
    kicker: 'EUROPE  /  PROTEST',
    head: 'GEN Z TAKES TO THE STREETS',
    body: 'TENS OF THOUSANDS MARCH IN MORE THAN 25 COUNTRIES AGAINST LIVING COSTS, EDUCATION CUTS AND MILITARY SPENDING.',
    art: drawCrowd,
  },
  {
    kicker: 'CLIMATE  /  TURKEY',
    head: 'COP31 DEAL STALLS',
    body: 'CLIMATE TALKS IN TURKEY STRUGGLE TO AGREE ON FOSSIL FUELS AND FINANCE AS THE SUMMIT ENTERS ITS FINAL STAGE.',
    art: drawGlobe,
  },
  {
    kicker: 'SPORT  /  CRICKET',
    head: 'RAHUL COMPLETES SENA SET',
    body: 'KL RAHUL SCORES 100 IN WELLINGTON, THE FIRST INDIAN OPENER WITH TEST CENTURIES IN SOUTH AFRICA, ENGLAND, NEW ZEALAND AND AUSTRALIA.',
    art: drawCricket,
  },
];

const gridTop = 448;
const cellW = Math.floor((CW - 24) / 2); // 472
const cellH = 196;
for (let i = 0; i < 4; i++) {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const cx = M + col * (cellW + 24);
  const cy = gridTop + row * (cellH + 16);
  const s = stories[i];
  drawText(cx, cy, s.kicker, 1, RED);
  drawText(cx, cy + 14, s.head, 3, INK);
  const artW = 120;
  const artH = 96;
  s.art(cx + cellW - artW, cy + 44, artW, artH);
  drawPara(cx, cy + 52, s.body, 2, cellW - artW - 16, INK);
  if (col === 0) vline(cx + cellW + 12, cy, cellH - 8, GREY, 1);
}
hline(M, gridTop + 2 * cellH + 16, CW, INK, 2);

// ---- Footer: three briefs ----
const footTop = gridTop + 2 * cellH + 16 + 16;
drawText(M, footTop, 'ALSO TODAY', 2, RED);
const briefs = [
  'NEW YORK: MAYOR MAMDANI SETS 2032 TO CLOSE THE RIKERS ISLAND JAIL.',
  'DENMARK EXPELS A RUSSIAN DIPLOMAT OVER AN ALLEGED PLOT TO KILL A UKRAINIAN RAPPER.',
  'RECORD RS 1.22 LAKH CRORE OF FOREIGN CASH FLOWS INTO INDIAN SHARES IN NOVEMBER.',
];
const briefW = Math.floor((CW - 48) / 3);
for (let i = 0; i < 3; i++) {
  const bx = M + i * (briefW + 24);
  drawText(bx, footTop + 24, '\u2022', 2, RED);
  drawPara(bx + 16, footTop + 24, briefs[i], 1, briefW - 16, INK);
  if (i < 2) vline(bx + briefW + 12, footTop + 24, 64, GREY, 1);
}

// Bottom line
hline(M, H - 44, CW, INK, 1);
drawTextCentered(W / 2, H - 32, 'THE DAILY GLOBE  -  SATURDAY 21 NOVEMBER 2026  -  ALL STORIES FIRST REPORTED ON 21 NOVEMBER 2026', 1, GREY);

// ---------------------------------------------------------------------------
// Write the image.
// ---------------------------------------------------------------------------
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), encodePng());
console.log('wrote entry.png', W + 'x' + H);
