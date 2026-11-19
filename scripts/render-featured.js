"use strict";

const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");
const { assertFits } = require("./lib/fit");
const content = require("./content");

// Folder icon drawn with paths (no emoji font needed).
function folder(x, y, fill) {
  return `<path d="M${x} ${y + 3} h6 l2 2 h8 v10 h-16 z" fill="${fill}"/>`;
}

function render(mode) {
  const pal = palette(mode);
  const width = 860;
  const items = content.featured;
  const cols = items.length;
  const gap = 10;
  const pad = 2;
  const cw = (width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = 76;
  const height = pad * 2 + ch + 4;
  const cards = items
    .map((p, i) => {
      const x = pad + i * (cw + gap);
      const y = pad;
      assertFits(p.name, 14, cw - 52, "featured name");
      assertFits(p.detail, 10.5, cw - 28, "featured detail");
      assertFits(p.host, 10, cw - 28, "featured host");
      const delay = (0.12 * i).toFixed(2);
      return `
  <g style="animation:rise 0.5s ease ${delay}s both">
    <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
    ${folder(x + 14, y + 10, pal.accent)}
    <text x="${x + 40}" y="${y + 25}" font-size="14" font-weight="700" fill="${pal.accent}">${esc(p.name)}</text>
    <text x="${x + 14}" y="${y + 46}" font-size="10.5" fill="${pal.text}">${esc(p.detail)}</text>
    <text x="${x + 14}" y="${y + 64}" font-size="10" fill="${pal.muted}">↗ ${esc(p.host)}</text>
  </g>`;
    })
    .join("\n");
  const css = `
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
`;
  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>${cards}`;
  return svgDoc({ width, height, palette: pal, css, label: "Featured projects: " + items.map((p) => p.name).join(", "), body });
}

function generate(outDir) {
  writeBoth(outDir, "featured", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
