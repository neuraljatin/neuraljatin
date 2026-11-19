"use strict";

const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");
const content = require("./content");

function render(mode) {
  const pal = palette(mode);
  const width = 860;
  const height = 86;
  const line1 = `> ${content.taglineLead} ${content.taglineRest}`;
  const line2 = content.roles.join("  ·  ");
  const duration = 3.2;
  const css = `
@keyframes typeWipe {
  from { width: 0; }
  to { width: 820px; }
}
@keyframes blink {
  0%, 45% { opacity: 1; }
  50%, 95% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.type-clip {
  animation: typeWipe ${duration}s steps(${Math.max(20, line1.length)}, end) forwards;
}
.cursor {
  animation: blink 1.2s step-end ${duration}s infinite;
}
.sub {
  animation: fadeIn 0.6s ease ${duration * 0.7}s forwards;
}
`;
  const body = `
  <defs>
    <linearGradient id="bannerGrad_${mode}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${pal.bannerFrom}"/>
      <stop offset="1" stop-color="${pal.bannerTo}"/>
    </linearGradient>
    <clipPath id="typeClip_${mode}">
      <rect class="type-clip" x="16" y="8" width="820" height="36"/>
    </clipPath>
  </defs>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="url(#bannerGrad_${mode})" stroke="${pal.accent}" stroke-opacity="0.35"/>
  <g clip-path="url(#typeClip_${mode})">
    <text x="22" y="34" font-size="15" font-weight="600">
      <tspan fill="${pal.accent}">&gt; </tspan>
      <tspan fill="${pal.text}">${esc(content.taglineLead)}</tspan>
      <tspan fill="${pal.body}"> ${esc(content.taglineRest)}</tspan>
    </text>
  </g>
  <rect class="cursor" x="22" y="20" width="8" height="18" rx="1" fill="${pal.cursor}"/>
  <text class="sub" x="22" y="64" font-size="12" fill="${pal.muted}">${esc(line2)}</text>
`;
  return svgDoc({ width, height, palette: pal, css, label: "Typing tagline", body });
}

function generate(outDir) {
  writeBoth(outDir, "tagline", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
