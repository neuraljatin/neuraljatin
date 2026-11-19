"use strict";

/**
 * Generate profile SVGs in dark and light variants.
 *
 * The daily Action only refreshes:
 *   tagline, contrib-heatmap, kpi, skills, portrait, info-card
 *
 * Renderers for how-i-work, certifications, achievements, and featured
 * remain in this folder but are not called here.
 *
 *   node scripts/generate-all.js --sample
 *   node scripts/generate-all.js --live
 *   node scripts/generate-all.js --mark JB
 *   node scripts/generate-all.js --photo /path/to/face.jpg
 *
 * Never writes skills-globe_*.svg (DESIGNER's static art).
 */
const path = require("path");

const outDir = path.join(__dirname, "..");
const argv = process.argv.slice(2);
const live = argv.includes("--live");

function argValue(flag) {
  const i = argv.indexOf(flag);
  return i >= 0 ? argv[i + 1] : undefined;
}

const portraitOpts = {
  mark: argValue("--mark") || "NJ",
  photo: argValue("--photo"),
};

require("./render-tagline").generate(outDir);
require("./render-heatmap").generate(outDir, { live });
require("./render-kpi").generate(outDir, { live });
require("./render-skills").generate(outDir);
require("./render-portrait").generate(outDir, portraitOpts);
require("./render-info-card").generate(outDir);

const { activeName } = require("./lib/theme");
console.log(
  `Generated tagline, contrib-heatmap, kpi, skills, portrait, info-card (theme=${activeName()}, mode=${live ? "live" : "sample"}, portrait=${portraitOpts.photo ? "photo" : portraitOpts.mark})`
);
