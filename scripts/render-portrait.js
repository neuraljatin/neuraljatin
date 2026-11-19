"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { esc, svgDoc, writeBoth } = require("./lib/svg");
const { palette } = require("./lib/theme");

const NJ = [
  "                              ",
  "                              ",
  "    @@@@+     +@@@    +@@@    ",
  "    @@@@@+    +@@@    +@@@+   ",
  "    @@@@@@+   +@@@    +@@@    ",
  "    @@@ +@@+  +@@@    +@@@    ",
  "    @@@  +@@+ +@@@    +@@@    ",
  "    @@@   @@@++@@@    +@@@    ",
  "    @@@    +@@@@@@    +@@@    ",
  "    @@@     @@@@@@    +@@@+   ",
  "    @@@      @@@@@    +@@@    ",
  "                     +@@@@    ",
  "                   @@@@@+     ",
  "                              ",
  "                              ",
];

const JB = [
  "                              ",
  "                              ",
  "    @@@@+     @@@@@+          ",
  "    @@@ +@@+  @@@ +@@+        ",
  "    @@@  +@@+ @@@  +@@+       ",
  "    @@@   @@@ @@@@@@+         ",
  "    @@@   @@@ @@@ +@@+        ",
  "    @@@  +@@+ @@@  +@@+       ",
  "    @@@ +@@+  @@@  +@@+       ",
  "    @@@@@+    @@@@@+          ",
  "    @@@@+                     ",
  "                              ",
  "                              ",
  "                              ",
  "                              ",
];

const RAMP = " .`:-=+*cs#%@";

function loadPhotoAscii(photoPath, cols = 40, rows = 22) {
  if (!fs.existsSync(photoPath)) {
    throw new Error(`Photo not found: ${photoPath}`);
  }
  const py = `
import sys, json
from PIL import Image
path, cols, rows = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
im = Image.open(path).convert("L")
# cover-fit into the grid
tw, th = cols, rows
src_w, src_h = im.size
scale = max(tw / src_w, th / src_h)
nw, nh = int(src_w * scale), int(src_h * scale)
im = im.resize((nw, nh), Image.Resampling.LANCZOS)
left = max(0, (nw - tw) // 2)
top = max(0, (nh - th) // 2)
im = im.crop((left, top, left + tw, top + th))
ramp = ${json_ramp()}
pixels = list(im.getdata())
lines = []
for y in range(th):
    row = []
    for x in range(tw):
        v = pixels[y * tw + x]
        idx = int((255 - v) / 256 * len(ramp))
        if idx >= len(ramp):
            idx = len(ramp) - 1
        row.append(ramp[idx])
    lines.append("".join(row))
print("\\n".join(lines))
`;
  const res = spawnSync(
    "python3",
    ["-c", py, photoPath, String(cols), String(rows)],
    { encoding: "utf8" }
  );
  if (res.status !== 0) {
    throw new Error(
      `Could not read photo (need Python 3 + Pillow for JPEG/PNG): ${res.stderr || res.stdout}`
    );
  }
  const lines = res.stdout.replace(/\n$/, "").split("\n");
  return lines;
}

function json_ramp() {
  return json_dump(RAMP);
}
function json_dump(s) {
  return JSON.stringify(s);
}

function linesFor(opts) {
  const mark = (opts.mark || "NJ").toUpperCase();
  if (opts.photo) return loadPhotoAscii(opts.photo);
  if (mark === "JB") return JB;
  return NJ;
}

function render(mode, opts = {}) {
  const pal = palette(mode);
  const lines = linesFor(opts);
  const charW = 8.2;
  const charH = 16;
  const padX = 16;
  const padY = 18;
  const cols = Math.max(...lines.map((l) => l.length));
  const width = Math.max(280, Math.round(padX * 2 + cols * charW));
  const height = Math.round(padY * 2 + lines.length * charH + 8);
  const innerW = width - padX * 2;
  const clips = [];
  const rows = lines
    .map((line, i) => {
      const delay = (0.12 * i).toFixed(2);
      const y = padY + 4 + (i + 1) * charH - 4;
      const yTop = y - charH + 3;
      const id = `pclip_${mode}_${i}`;
      // Clip rect defaults to full width so ignored animations still show the row.
      clips.push(`<clipPath id="${id}"><rect x="${padX}" y="${yTop}" width="${innerW}" height="${charH}" style="animation:typeWipe 0.28s steps(16, end) ${delay}s forwards"/></clipPath>`);
      return `<text x="${padX}" y="${y}" font-size="13" fill="${pal.accent}" xml:space="preserve" clip-path="url(#${id})">${esc(line)}</text>`;
    })
    .join("\n    ");
  const css = `
@keyframes typeWipe {
  from { width: 0; }
  to { width: ${innerW}px; }
}
@keyframes blink {
  0%, 45% { opacity: 1; }
  50%, 95% { opacity: 0; }
  100% { opacity: 1; }
}
.cursor { animation: blink 1.2s step-end ${(0.12 * lines.length + 0.3).toFixed(2)}s infinite; }
`;
  const lastY = padY + 4 + lines.length * charH - 4;
  const body = `
  <defs>
    ${clips.join("\n    ")}
  </defs>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="8" fill="${pal.panel}" stroke="${pal.border}"/>
  ${rows}
  <rect class="cursor" x="${padX}" y="${lastY + 6}" width="10" height="3" fill="${pal.cursor}"/>
`;
  return svgDoc({ width, height, palette: pal, css, label: "ASCII portrait", body });
}

function generate(outDir, opts = {}) {
  writeBoth(outDir, "portrait", (mode) => render(mode, opts));
}

function parseArgs(argv) {
  const opts = { mark: "NJ" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--mark" && argv[i + 1]) opts.mark = argv[++i];
    else if (argv[i] === "--photo" && argv[i + 1]) opts.photo = argv[++i];
  }
  return opts;
}

if (require.main === module) {
  const opts = parseArgs(process.argv.slice(2));
  generate(path.join(__dirname, ".."), opts);
}

module.exports = { generate, render, parseArgs, NJ, JB };
