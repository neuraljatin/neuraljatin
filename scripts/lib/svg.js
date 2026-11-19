"use strict";

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const FONT = "Consolas, ui-monospace, 'Liberation Mono', 'Courier New', monospace";
const SANS = "ui-sans-serif, -apple-system, 'Segoe UI', sans-serif";

function reducedMotionCss() {
  return `
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    animation-delay: 0s !important;
  }
}
`;
}

function svgDoc({ width, height, palette, css = "", body, label = "profile art" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(label)}">
  <defs>
    <style><![CDATA[
text, tspan { font-family: ${FONT}; }
${css}
${reducedMotionCss()}
    ]]></style>
  </defs>
  ${body}
</svg>
`;
}

function panelBg(palette, { x = 0, y = 0, w, h, rx = 8 } = {}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${palette.panel}" stroke="${palette.border}" stroke-width="1"/>`;
}

function writeBoth(outDir, name, render) {
  const fs = require("fs");
  const path = require("path");
  for (const mode of ["dark", "light"]) {
    const svg = render(mode);
    const file = path.join(outDir, `${name}_${mode}.svg`);
    fs.writeFileSync(file, svg);
  }
}

/** Hidden state belongs only in @keyframes from. Default styles stay visible
 *  so a renderer that ignores CSS animation still shows content.
 *  Use forwards so the end state stays visible after the animation.
 */
const fadeCss = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
`;

function fadeAttr(delay = 0, duration = 0.45) {
  const d = Number(delay) || 0;
  return `animation:fadeIn ${duration}s ease ${d}s forwards`;
}

module.exports = { esc, FONT, SANS, svgDoc, panelBg, writeBoth, reducedMotionCss, fadeCss, fadeAttr };

