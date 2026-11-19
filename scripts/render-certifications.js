"use strict";

const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");
const content = require("./content");

function render(mode) {
  const pal = palette(mode);
  const width = 860;
  const rows = content.certifications;
  const rowH = 26;
  const height = 20 + rows.length * rowH + 8;
  const list = rows
    .map((c, i) => {
      const y = 22 + i * rowH;
      const delay = (0.07 * i).toFixed(2);
      return `
    <g style="animation:rise 0.4s ease ${delay}s both">
      <text x="16" y="${y}" font-size="12" font-weight="600" fill="${pal.text}">${esc(c.title)}</text>
      <text x="430" y="${y}" font-size="11" fill="${pal.muted}">${esc(c.issuer)}</text>
      <text x="800" y="${y}" font-size="11" fill="${pal.accent}" text-anchor="end">${esc(c.when)}</text>
    </g>`;
    })
    .join("\n");
  const css = `
@keyframes rise {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
  const body = `
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
  ${list}`;
  return svgDoc({ width, height, palette: pal, css, label: "Certifications", body });
}

function generate(outDir) {
  writeBoth(outDir, "certifications", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
