"use strict";

const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");
const { assertFits } = require("./lib/fit");
const content = require("./content");

function render(mode) {
  const pal = palette(mode);
  const width = 860;
  const height = 96;
  const items = content.process;
  const n = items.length;
  const pad = 2;
  const arrowW = 18;
  const cw = (width - pad * 2 - (n - 1) * arrowW) / n;
  const chipFill = mode === "dark" ? pal.fill : pal.highlightFill;
  const chipText = mode === "dark" ? pal.fillText : pal.accent;
  const steps = items
    .map((it, i) => {
      const x = pad + i * (cw + arrowW);
      const delay = (0.15 * i).toFixed(2);
      const [num, ...rest] = it.step.split(" ");
      const title = rest.join(" ");
      assertFits(title, 12, cw - 46, "how-i-work title");
      const details = (Array.isArray(it.detail) ? it.detail : [it.detail])
        .map((d, j) => {
          assertFits(d, 10.5, cw - 20, "how-i-work detail");
          return `<text x="${x + 10}" y="${58 + j * 15}" font-size="10.5" fill="${pal.muted}">${esc(d)}</text>`;
        })
        .join("");
      const arrow =
        i < n - 1
          ? `<text class="arrow" x="${x + cw + arrowW / 2}" y="52" font-size="14" text-anchor="middle" fill="${pal.accent}" style="animation:pulse 2.4s ease-in-out ${(0.3 * i).toFixed(2)}s infinite">→</text>`
          : "";
      return `
  <g style="animation:rise 0.5s ease ${delay}s both">
    <rect x="${x}" y="8" width="${cw}" height="82" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
    <rect x="${x + 10}" y="18" width="26" height="20" rx="4" fill="${chipFill}"/>
    <text x="${x + 23}" y="32" font-size="11" font-weight="700" text-anchor="middle" fill="${chipText}">${esc(num)}</text>
    <text x="${x + 42}" y="32" font-size="12" font-weight="700" fill="${pal.accent}">${esc(title)}</text>
    ${details}
  </g>${arrow}`;
    })
    .join("\n");
  const css = `
@keyframes rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
`;
  const body = `<rect width="${width}" height="${height}" fill="${pal.page}"/>${steps}`;
  return svgDoc({ width, height, palette: pal, css, label: "How I work: " + items.map((i) => i.step).join(", "), body });
}

function generate(outDir) {
  writeBoth(outDir, "how-i-work", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
