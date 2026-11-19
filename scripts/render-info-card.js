"use strict";

const { esc, svgDoc, writeBoth, fadeCss, fadeAttr } = require("./lib/svg");
const { palette } = require("./lib/theme");
const content = require("./content");

function render(mode) {
  const pal = palette(mode);
  const width = 520;
  const rows = content.infoRows;
  const valueX = 120;
  const rightPad = 24;
  // Conservative glyph width so text still fits if the rendered
  // monospace font is wider than Consolas, and when the SVG is
  // shown at 390px (uniform scale of this 520 viewBox).
  const maxChars = Math.max(20, Math.floor((width - valueX - rightPad) / 10));
  function hardWrap(s, limit) {
    const lines = [];
    let rest = s;
    while (rest.length > limit) {
      let cut = rest.lastIndexOf("/", limit);
      if (cut < Math.floor(limit / 3)) cut = rest.lastIndexOf("-", limit);
      if (cut < Math.floor(limit / 3)) cut = limit;
      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut).replace(/^\//, "/");
    }
    if (rest) lines.push(rest);
    return lines;
  }
  function wrapValue(text, limit = maxChars) {
    const raw = String(text).trim();
    if (raw.length <= limit) return [raw];
    const tokens = raw.split(/(\s*·\s*|\s*,\s*|\s+)/).filter((t) => t !== "");
    const out = [];
    let cur = "";
    const push = (s) => {
      const v = s.trim().replace(/[·,]+$/u, "").trim();
      if (v) out.push(v);
    };
    for (const tok of tokens) {
      const clean = tok.replace(/^\s+/u, "");
      const next = cur + tok;
      if (cur && next.length > limit) {
        push(cur);
        if (clean.length > limit) {
          const parts = hardWrap(clean.replace(/^[·,]\s*/, ""), limit);
          out.push(...parts.slice(0, -1));
          cur = parts[parts.length - 1] || "";
        } else {
          cur = clean.replace(/^[·,]\s*/, "");
        }
      } else if (!cur && clean.length > limit) {
        const parts = hardWrap(clean, limit);
        out.push(...parts.slice(0, -1));
        cur = parts[parts.length - 1] || "";
      } else {
        cur = next;
      }
    }
    if (cur.trim()) push(cur);
    return out.length ? out : [raw];
  }
  const wrapped = rows.map((row) => ({ ...row, lines: wrapValue(row.value) }));
  const extra = wrapped.reduce((n, r) => n + r.lines.length - 1, 0);
  const height = 42 + rows.length * 28 + extra * 16 + 16;
  const lines = [
    `<text x="18" y="28" font-size="13" fill="${pal.muted}" style="${fadeAttr(0, 0.4)}">${esc(content.username + "@github")}</text>`,
    `<line x1="18" y1="38" x2="${width - 18}" y2="38" stroke="${pal.border}" stroke-width="1" style="${fadeAttr(0.05, 0.4)}"/>`,
  ];
  let y = 62;
  wrapped.forEach((row, i) => {
    const delay = (0.12 * (i + 1)).toFixed(2);
    const tspans = row.lines
      .map((ln, j) => (j === 0 ? esc(ln) : `<tspan x="120" dy="16">${esc(ln)}</tspan>`))
      .join("");
    lines.push(`
    <g style="${fadeAttr(delay)}">
      <text x="18" y="${y}" font-size="13" fill="${pal.accent}">${esc(row.key)}</text>
      <text x="120" y="${y}" font-size="13" fill="${pal.text}">${tspans}</text>
    </g>`);
    y += 28 + (row.lines.length - 1) * 16;
  });
  const body = `
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
  ${lines.join("\n")}
`;
  return svgDoc({ width, height, palette: pal, css: fadeCss, label: "Profile info card", body });
}

function generate(outDir) {
  writeBoth(outDir, "info-card", render);
}

if (require.main === module) generate(require("path").join(__dirname, ".."));
module.exports = { generate, render };
