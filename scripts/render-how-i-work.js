"use strict";

const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");
const content = require("./content");

function render(mode) {
  const pal = palette(mode);
  const width = 860;
  const height = 90;
  const items = content.process;
  const gap = 8;
  const arrow = 16;
  const n = items.length;
  const cw = (width - 16 - (n - 1) * (gap + arrow)) / n;
  const steps = items
    .map((it, i) => {
      const x = 8 + i * (cw + gap + arrow);
      const delay = (0.1 * i).toFixed(2);
      const ar =
        i < n - 1
          ? `<text x="${x + cw + 2}" y="50" font-size="16" fill="${pal.accent}">→</text>`
          : "";
      return `
    <g style="animation:rise 0.45s ease ${delay}s both">
      <rect x="${x}" y="12" width="${cw}" height="66" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
      <text x="${x + 10}" y="34" font-size="12" font-weight="700" fill="${pal.accent}">${esc(it.step)}</text>
      <text x="${x + 10}" y="54" font-size="10" fill="${pal.muted}">${esc(it.detail)}</text>
      ${ar}
    </g>`;
    })
    .join("\n");
  const css = `
@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
`;
  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>${steps}`;
  return svgDoc({ width, height, palette: pal, css, label: "How I work", body });
}

function generate(outDir) {
  writeBoth(outDir, "how-i-work", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
