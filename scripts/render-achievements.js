"use strict";

const fs = require("fs");
const path = require("path");
const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");
const { assertFits } = require("./lib/fit");
const content = require("./content");

function loadLive() {
  const p = path.join(__dirname, "..", "data", "contributions.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

// Simple stroked icons (no emoji fonts needed). 0..20 box, centred at 10,10.
function icon(kind, color) {
  const s = `fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  switch (kind) {
    case "ship":
      return `<path d="M10 2 C14 5 14 11 12 15 L8 15 C6 11 6 5 10 2 Z" ${s}/><circle cx="10" cy="8" r="1.6" ${s}/><path d="M8 15 L6 18 M12 15 L14 18" ${s}/>`;
    case "gear":
      return `<circle cx="10" cy="10" r="3" ${s}/><path d="M10 2v3M10 15v3M2 10h3M15 10h3M4.3 4.3l2.1 2.1M13.6 13.6l2.1 2.1M4.3 15.7l2.1-2.1M13.6 6.4l2.1-2.1" ${s}/>`;
    case "chart":
      return `<path d="M3 17h14" ${s}/><path d="M5 14v-4M9 14V6M13 14V9M17 14V4" ${s}/>`;
    case "gym":
      return `<path d="M2 10h16M5 6v8M15 6v8M3 8v4M17 8v4" ${s}/>`;
    case "cap":
      return `<path d="M2 8 L10 4 L18 8 L10 12 Z" ${s}/><path d="M5 10v4c2 2 8 2 10 0v-4" ${s}/>`;
    default:
      return `<path d="M10 2l2.4 5 5.4.6-4 3.7 1.1 5.3L10 14l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z" ${s}/>`;
  }
}

function liveDetail(live) {
  const st = (live && live.stats) || {};
  const bits = [];
  if (typeof st.repoCount === "number" && st.repoCount > 0) bits.push(`${st.repoCount} repos`);
  if (typeof st.longestStreak === "number" && st.longestStreak > 0) bits.push(`best streak ${st.longestStreak}d`);
  return bits.length ? bits.join(" · ") + " (live)" : "Refreshed daily from GitHub";
}

function render(mode, opts = {}) {
  const pal = palette(mode);
  const live = opts.live ? loadLive() : null;
  const items = content.achievements.map((a) => (a.detail === "live" ? { ...a, detail: liveDetail(live) } : a));
  const width = 860;
  const cols = 3;
  const gap = 10;
  const pad = 2;
  const cw = (width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = 58;
  const rows = Math.ceil(items.length / cols);
  const height = pad * 2 + rows * ch + (rows - 1) * gap + 4;
  const iconFill = mode === "dark" ? pal.fill : pal.highlightFill;
  const iconStroke = mode === "dark" ? pal.fillText : pal.accent;
  const cards = items
    .map((it, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (cw + gap);
      const y = pad + row * (ch + gap);
      const tx = x + 58;
      assertFits(it.title, 13, x + cw - 10 - tx, "achievement title");
      assertFits(it.detail, 10, x + cw - 10 - tx, "achievement detail");
      const delay = (0.12 * i).toFixed(2);
      return `
  <g style="animation:rise 0.5s ease ${delay}s both">
    <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
    <circle cx="${x + 30}" cy="${y + ch / 2}" r="17" fill="${iconFill}"/>
    <g transform="translate(${x + 20} ${y + ch / 2 - 10})">${icon(it.icon, iconStroke)}</g>
    <text x="${tx}" y="${y + 25}" font-size="13" font-weight="700" fill="${pal.accent}">${esc(it.title)}</text>
    <text x="${tx}" y="${y + 42}" font-size="10" fill="${pal.muted}">${esc(it.detail)}</text>
  </g>`;
    })
    .join("\n");
  const css = `
@keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
`;
  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>${cards}`;
  return svgDoc({ width, height, palette: pal, css, label: "Achievements: " + items.map((i) => i.title).join(", "), body });
}

function generate(outDir, opts = {}) {
  writeBoth(outDir, "achievements", (mode) => render(mode, opts));
}

if (require.main === module) generate(require("path").join(__dirname, ".."), { live: process.argv.includes("--live") });
module.exports = { generate, render };
