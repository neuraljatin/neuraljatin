"use strict";

const fs = require("fs");
const path = require("path");
const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette, letterColor } = require("./lib/theme");

const MASK = JSON.parse(fs.readFileSync(path.join(__dirname, "letter-mask.json"), "utf8"));
const LETTERS = "JATIN".split("");

function letterAt(col, row) {
  for (const L of LETTERS) {
    const cells = MASK.letters[L].cells;
    if (cells.some((c) => c.col === col && c.row === row)) return L;
  }
  return null;
}

function letterColIndex(col) {
  const cols = [];
  for (const L of LETTERS) {
    for (const c of MASK.letters[L].columns) {
      if (!cols.includes(c)) cols.push(c);
    }
  }
  cols.sort((a, b) => a - b);
  return cols.indexOf(col);
}

function sampleDays() {
  // Deterministic sample grid: dim background noise + JATIN letter cells "on".
  const days = [];
  const seed = 19;
  for (let col = 0; col < MASK.cols; col++) {
    for (let row = 0; row < MASK.rows; row++) {
      const n = (col * 13 + row * 7 + seed) % 10;
      const letter = letterAt(col, row);
      const level = letter ? 2 : n < 6 ? 0 : n < 9 ? 1 : 2;
      days.push({ col, row, level, letter, count: letter ? 4 : level });
    }
  }
  return days;
}

function emptyDays() {
  const days = [];
  for (let col = 0; col < MASK.cols; col++) {
    for (let row = 0; row < MASK.rows; row++) {
      days.push({ col, row, level: 0, letter: letterAt(col, row), count: 0 });
    }
  }
  return days;
}

function loadLiveDays() {
  const dataPath = path.join(__dirname, "..", "data", "contributions.json");
  if (!fs.existsSync(dataPath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    if (!data || !Array.isArray(data.days) || data.days.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

function daysFromLive(live) {
  // Map last 53 weeks onto the 53x7 grid (Sunday start).
  const sorted = [...live.days].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted.slice(-MASK.cols * MASK.rows);
  const days = [];
  for (let i = 0; i < MASK.cols * MASK.rows; i++) {
    const col = Math.floor(i / MASK.rows);
    const row = i % MASK.rows;
    const entry = last[i];
    const count = entry ? entry.count || 0 : 0;
    let level = 0;
    if (count > 0) level = 1;
    if (count >= 3) level = 2;
    days.push({ col, row, level, letter: letterAt(col, row), count, date: entry && entry.date });
  }
  return days;
}

function render(mode, opts = {}) {
  const pal = palette(mode);
  const wantLive = opts.live === true;
  const live = wantLive ? loadLiveDays() : null;
  const days = live ? daysFromLive(live) : wantLive ? emptyDays() : sampleDays();
  // "SAMPLE data" is only for local --sample builds. A --live Action run
  // never keeps that label, even if the fetch returned no days yet.
  const isSample = !wantLive;
  const padX = 30;
  const padY = 16;
  const width = 860;
  const height = 168;
  const { cell, stride } = MASK;
  const letterCols = letterColIndex.toString(); // keep lint quiet
  void letterCols;

  const cells = days
    .map((d) => {
      const x = padX + d.col * stride;
      const y = padY + d.row * stride;
      const base = pal.heatmap.levels[d.level] || pal.heatmap.levels[0];
      if (d.letter) {
        const fill = letterColor(pal, d.letter);
        const idx = letterColIndex(d.col);
        const delay = (0.35 + Math.max(0, idx) * 0.08).toFixed(3);
        return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${base}"/>
      <rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${fill}" opacity="1" style="animation:lightUp 0.35s ease ${delay}s forwards"/>`;
      }
      return `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${base}" opacity="1" style="animation:fadeBg 0.4s ease 0s forwards"/>`;
    })
    .join("\n      ");

  const legend = pal.heatmap.levels
    .concat([pal.heatmap.letters[0], pal.heatmap.letters[4]])
    .map((c, i) => `<rect x="${padX + 40 + i * 15}" y="130" width="12" height="12" rx="3" fill="${c}"/>`)
    .join("");

  const footer = isSample
    ? "SAMPLE data  ·  live counts refresh daily via GitHub Actions"
    : live && live.stats && live.stats.totalYear != null
      ? `${live.stats.totalYear} contributions in the last year  ·  refreshed daily`
      : "live count refreshed daily by GitHub Actions";

  const css = `
@keyframes lightUp {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeBg {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.footer { animation: fadeIn 0.6s ease 2.4s forwards; }
`;

  const body = `
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
  ${cells}
  <text x="${padX}" y="141" font-size="11" fill="${pal.muted}">Less</text>
  ${legend}
  <text x="${padX + 40 + 6 * 15 + 8}" y="141" font-size="11" fill="${pal.muted}">More</text>
  <text class="footer" x="${padX}" y="158" font-size="11" fill="${pal.faint}">${esc(footer)}</text>
`;
  return svgDoc({
    width,
    height,
    palette: pal,
    css,
    label: isSample ? "Sample contribution grid spelling JATIN" : "Contribution grid spelling JATIN",
    body,
  });
}

function generate(outDir, opts = {}) {
  writeBoth(outDir, "contrib-heatmap", (mode) => render(mode, opts));
}

if (require.main === module) generate(require("path").join(__dirname, ".."), { live: process.argv.includes("--live") });
module.exports = { generate, render, sampleDays, letterAt };
