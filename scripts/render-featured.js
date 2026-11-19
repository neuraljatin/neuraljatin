"use strict";

const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");
const content = require("./content");

function render(mode) {
  const pal = palette(mode);
  const width = 860;
  const items = content.featured;
  const cols = 2;
  const gap = 10;
  const pad = 8;
  const cw = (width - pad * 2 - gap) / cols;
  const ch = 56;
  const rows = Math.ceil(items.length / cols);
  const height = pad * 2 + rows * ch + (rows - 1) * gap;
  const cards = items
    .map((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (cw + gap);
      const y = pad + row * (ch + gap);
      const delay = (0.08 * i).toFixed(2);
      return `
    <g style="animation:rise 0.4s ease ${delay}s both">
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
      <text x="${x + 14}" y="${y + 22}" font-size="14" font-weight="700" fill="${pal.accent}">${esc(p.name)}</text>
      <text x="${x + 14}" y="${y + 40}" font-size="11" fill="${pal.muted}">${esc(p.detail)}</text>
    </g>`;
    })
    .join("\n");
  const css = `
@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>${cards}`;
  return svgDoc({ width, height, palette: pal, css, label: "Featured projects", body });
}

function generate(outDir) {
  writeBoth(outDir, "featured", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
