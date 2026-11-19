"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const files = fs
  .readdirSync(root)
  .filter((f) => f.endsWith(".svg") && !f.startsWith("skills-globe_"))
  .sort();

if (!files.length) {
  console.error("No SVGs found. Run npm run generate first.");
  process.exit(1);
}

let failed = 0;
const MAX = 100 * 1024;

for (const file of files) {
  const full = path.join(root, file);
  const text = fs.readFileSync(full, "utf8");
  const size = Buffer.byteLength(text);
  const problems = [];
  if (size >= MAX) problems.push(`too large (${size} bytes, limit ${MAX})`);
  if (/<script[\s>]/i.test(text) || /javascript:/i.test(text) || /\bon[a-z]+\s*=/i.test(text)) {
    problems.push("contains JS (GitHub will strip it; animations must be CSS/SMIL only)");
  }
  if (!text.includes("<svg") || !text.includes("</svg>")) problems.push("missing svg wrapper");
  const py = spawnSync(
    "python3",
    ["-c", "import sys, xml.etree.ElementTree as ET; ET.parse(sys.argv[1])", full],
    { encoding: "utf8" }
  );
  if (py.status !== 0) problems.push(`not well-formed XML: ${(py.stderr || py.stdout || "").trim()}`);
  if (problems.length) {
    failed += 1;
    console.error(`FAIL ${file}: ${problems.join("; ")}`);
  } else {
    console.log(`OK   ${file} (${size} bytes)`);
  }
}

const expected = [
  "tagline",
  "contrib-heatmap",
  "kpi",
  "skills",
  "how-i-work",
  "achievements",
  "portrait",
  "info-card",
  "featured",
];
for (const name of expected) {
  for (const mode of ["dark", "light"]) {
    const f = `${name}_${mode}.svg`;
    if (!files.includes(f)) {
      failed += 1;
      console.error(`FAIL missing ${f}`);
    }
  }
}

if (failed) {
  console.error(`${failed} problem(s)`);
  process.exit(1);
}
console.log(`Validated ${files.length} SVGs.`);
