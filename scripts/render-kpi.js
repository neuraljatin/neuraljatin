"use strict";

const fs = require("fs");
const path = require("path");
const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");

const PLACEHOLDER = "— —";

function loadLive() {
  const p = path.join(__dirname, "..", "data", "contributions.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function stackedCount(id, x, y, pal, value) {
  if (value == null || value === PLACEHOLDER) {
    return `<text x="${x}" y="${y}" font-size="24" font-weight="700" fill="${pal.accent}" style="animation:rise 0.5s ease forwards">${esc(PLACEHOLDER)}</text>`;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return `<text x="${x}" y="${y}" font-size="24" font-weight="700" fill="${pal.accent}" style="animation:rise 0.5s ease forwards">${esc(String(value))}</text>`;
  }
  const frames = [0];
  const steps = 4;
  for (let i = 1; i < steps; i++) frames.push(Math.round((num * i) / steps));
  frames.push(num);
  return frames
    .map((n, i) => {
      const delay = (0.2 + i * 0.12).toFixed(2);
      const hold = i === frames.length - 1;
      const anim = hold
        ? `animation:rise 0.2s ease ${delay}s forwards`
        : `animation:countFlash 0.12s linear ${delay}s forwards`;
      return `<text x="${x}" y="${y}" font-size="24" font-weight="700" fill="${pal.accent}" style="${anim}">${esc(String(n))}</text>`;
    })
    .join("\n      ");
}

function render(mode, opts = {}) {
  const pal = palette(mode);
  const live = opts.live ? loadLive() : null;
  const width = 860;
  const height = 118;
  const gap = 10;
  const cards = 4;
  const cw = (width - 16 - gap * (cards - 1)) / cards;
  const ch = 96;
  const y0 = 11;
  const x0 = 8;

  const total = live && live.stats && live.stats.totalYear != null ? live.stats.totalYear : null;
  const streak = live && live.stats && live.stats.currentStreak != null ? live.stats.currentStreak : null;
  const langs = live && Array.isArray(live.languages) && live.languages.length ? live.languages : null;
  const weekdays = live && Array.isArray(live.weekday) && live.weekday.length === 7 ? live.weekday : null;

  // Languages bar
  let langBody;
  if (!langs) {
    langBody = `<text x="14" y="58" font-size="24" font-weight="700" fill="${pal.accent}" style="animation:rise 0.5s ease 0.15s forwards">${PLACEHOLDER}</text>
      <text x="14" y="82" font-size="11" fill="${pal.faint}">waiting for live data</text>`;
  } else {
    const sum = langs.reduce((s, l) => s + (l.bytes || l.size || 0), 0) || 1;
    const slices = langs.slice(0, 3);
    let x = 0;
    const barW = cw - 28;
    const rects = slices
      .map((l, i) => {
        const w = Math.max(4, ((l.bytes || l.size || 0) / sum) * barW);
        const r = `<rect x="${14 + x}" y="44" width="${w.toFixed(1)}" height="10" fill="${pal.fill || pal.accent}" opacity="${(1 - i * 0.25).toFixed(2)}" style="animation:growX 0.7s ease ${0.3 + i * 0.12}s forwards"/>`;
        x += w;
        return r;
      })
      .join("");
    const label = slices.map((l) => l.name).join(" · ");
    langBody = `<g class="bars">${rects}</g>
      <text x="14" y="82" font-size="11" fill="${pal.faint}">${esc(label)} (live)</text>`;
  }

  let dayBody;
  if (!weekdays) {
    dayBody = `<text x="14" y="58" font-size="24" font-weight="700" fill="${pal.accent}" style="animation:rise 0.5s ease 0.2s forwards">${PLACEHOLDER}</text>
      <text x="14" y="82" font-size="11" fill="${pal.faint}">waiting for live data</text>`;
  } else {
    const max = Math.max(1, ...weekdays);
    const labels = ["M", "T", "W", "T", "F", "S", "S"];
    // GitHub weekday often starts Sunday; our display is M..S. If data is Sun-first, rotate.
    const spark = weekdays
      .map((v, i) => {
        const h = Math.max(2, (v / max) * 34);
        const x = 16 + i * 20;
        const y = 78 - h;
        return `<rect x="${x}" y="${y}" width="14" height="${h.toFixed(1)}" rx="2" fill="${pal.fill || pal.accent}" style="animation:growY 0.6s ease ${0.3 + i * 0.07}s forwards"/>`;
      })
      .join("");
    dayBody = `${spark}
      <text x="14" y="96" font-size="11" fill="${pal.faint}">${labels.join(" ")}</text>`;
  }

  const tiles = [
    {
      title: "Contributions · 12 mo",
      sub: "from GitHub, daily",
      inner: `${stackedCount("y", 14, 58, pal, total)}
      <text x="14" y="82" font-size="11" fill="${pal.faint}">from GitHub, daily</text>`,
    },
    {
      title: "Current streak",
      sub: "days",
      inner: `${stackedCount("s", 14, 58, pal, streak)}
      <text x="14" y="82" font-size="11" fill="${pal.faint}">days</text>`,
    },
    { title: "Top languages", inner: langBody },
    { title: "Busiest weekday", inner: dayBody },
  ];

  const cardsXml = tiles
    .map((t, i) => {
      const x = x0 + i * (cw + gap);
      const delay = (i * 0.1).toFixed(2);
      return `
    <g style="animation:rise 0.45s ease ${delay}s forwards">
      <rect x="${x}" y="${y0}" width="${cw}" height="${ch}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
      <text x="${x + 14}" y="${y0 + 22}" font-size="11" fill="${pal.muted}">${esc(t.title)}</text>
      <g transform="translate(${x}, ${y0})">${t.inner}</g>
    </g>`;
    })
    .join("\n");

  const css = `
@keyframes rise {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes countFlash {
  0% { opacity: 0; }
  30% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes growX {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@keyframes growY {
  from { transform: scaleY(0); }
  to { transform: scaleY(1); }
}
.bars rect, .bars { transform-box: fill-box; transform-origin: 0 50%; }
rect[style*="growY"] { transform-box: fill-box; transform-origin: 50% 100%; }
`;

  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>
  ${cardsXml}`;
  return svgDoc({ width, height, palette: pal, css, label: "KPI panel", body });
}

function generate(outDir, opts = {}) {
  writeBoth(outDir, "kpi", (mode) => render(mode, opts));
}

if (require.main === module) generate(require("path").join(__dirname, ".."), { live: process.argv.includes("--live") });
module.exports = { generate, render };
