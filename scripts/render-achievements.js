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

function loadManual() {
  const p = path.join(__dirname, "achievements.json");
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    const manual = Array.isArray(data.manual) ? data.manual.slice(0, 3) : [];
    while (manual.length < 3) manual.push({ title: "", detail: "" });
    return manual;
  } catch {
    return [
      { title: "", detail: "" },
      { title: "", detail: "" },
      { title: "", detail: "" },
    ];
  }
}

function val(v, suffix = "") {
  if (v == null || v === "") return PLACEHOLDER;
  return suffix ? `${v}${suffix}` : String(v);
}

function render(mode, opts = {}) {
  const pal = palette(mode);
  const live = opts.live ? loadLive() : null;
  const stats = (live && live.stats) || {};
  const manual = loadManual();
  const width = 860;
  const height = 228;

  const computed = [
    { title: "Repos built", detail: "public + private, from GitHub", value: val(stats.repoCount) },
    { title: "Years on GitHub", detail: "from account createdAt", value: stats.yearsOnGitHub >= 1 ? String(stats.yearsOnGitHub) : PLACEHOLDER },
    { title: "Longest streak", detail: "computed from the contribution calendar", value: stats.longestStreak != null ? `${stats.longestStreak} days` : PLACEHOLDER },
    { title: "Contributions", detail: "all-time, when GitHub returns it", value: val(stats.totalAllTime) },
    { title: "Busiest day", detail: "record from the calendar", value: stats.busiestDay ? String(stats.busiestDay) : PLACEHOLDER },
    { title: "PRs merged", detail: "from GitHub pullRequests", value: val(stats.prsMerged) },
  ];

  const manuals = manual.map((m, i) => ({
    title: (m && m.title && m.title.trim()) || "TODO — manual slot",
    detail: (m && m.detail && m.detail.trim()) || "Placeholder. Add a confirmed achievement in scripts/achievements.json.",
    value: m && m.title && m.title.trim() ? "" : PLACEHOLDER,
    manual: true,
    filled: !!(m && m.title && m.title.trim()),
  }));

  const items = computed.concat(manuals);
  const cols = 3;
  const gap = 10;
  const pad = 8;
  const cw = (width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = 62;
  const startY = 10;

  const cards = items
    .map((it, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (cw + gap);
      const y = startY + row * (ch + gap);
      const delay = (0.08 * i).toFixed(2);
      const valueXml = it.value
        ? `<text x="${x + 12}" y="${y + 50}" font-size="14" font-weight="700" fill="${pal.accent}">${esc(it.value)}</text>`
        : "";
      const muted = it.manual && !it.filled;
      return `
    <g style="animation:slideIn 0.45s ease ${delay}s both">
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
      <text x="${x + 12}" y="${y + 20}" font-size="12" font-weight="700" fill="${muted ? pal.muted : pal.accent}">${esc(it.title)}</text>
      <text x="${x + 12}" y="${y + 36}" font-size="10" fill="${pal.muted}">${esc(it.detail)}</text>
      ${valueXml}
    </g>`;
    })
    .join("\n");

  const css = `
@keyframes slideIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>
  ${cards}`;
  return svgDoc({ width, height, palette: pal, css, label: "Achievements panel", body });
}

function generate(outDir, opts = {}) {
  writeBoth(outDir, "achievements", (mode) => render(mode, opts));
}

if (require.main === module) generate(require("path").join(__dirname, ".."), { live: process.argv.includes("--live") });
module.exports = { generate, render };
