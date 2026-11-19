"use strict";

const { esc, svgDoc, writeBoth, fadeCss, fadeAttr } = require("./lib/svg");
const { palette } = require("./lib/theme");
const content = require("./content");

function render(mode) {
  const pal = palette(mode);
  const width = 860;
  const height = 148;
  const groups = content.skillGroups;
  const cols = 6;
  const gap = 8;
  const pad = 8;
  const cw = (width - pad * 2 - gap * (cols - 1)) / cols;
  const ch = 132;
  const cards = groups
    .map((g, i) => {
      const x = pad + i * (cw + gap);
      const y = 8;
      const delay = (0.08 * i).toFixed(2);
      const pills = g.items
        .map((name, j) => `<text x="${x + 10}" y="${y + 44 + j * 20}" font-size="11" fill="${pal.body}">${esc(name)}</text>`)
        .join("\n        ");
      return `
    <g style="${fadeAttr(delay, 0.4)}">
      <rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
      <text x="${x + 10}" y="${y + 22}" font-size="11" font-weight="700" fill="${pal.accent}">${esc(g.title)}</text>
      ${pills}
    </g>`;
    })
    .join("\n");
  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>${cards}`;
  return svgDoc({ width, height, palette: pal, css: fadeCss, label: "Skills", body });
}

function generate(outDir) {
  writeBoth(outDir, "skills", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
