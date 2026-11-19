"use strict";

/**
 * Generate profile SVGs in dark and light variants.
 *
 * The daily Action refreshes (DEVOPS-owned art):
 *   tagline, contrib-heatmap, kpi, skills, how-i-work, achievements,
 *   portrait, info-card, featured
 *
 * DESIGNER-owned static art is never written here:
 *   status, banner, role, marquee, snippets, skills-globe
 * render-certifications.js remains in this folder but is not called.
 *
 *   node scripts/generate-all.js --sample
 *   node scripts/generate-all.js --live
 *   node scripts/generate-all.js --mark JB
 *   node scripts/generate-all.js --photo /path/to/face.jpg
 *
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
require("./render-how-i-work").generate(outDir);
require("./render-achievements").generate(outDir, { live });
require("./render-portrait").generate(outDir, portraitOpts);
require("./render-info-card").generate(outDir);
require("./render-featured").generate(outDir);

const { activeName } = require("./lib/theme");
console.log(
  `Generated tagline, contrib-heatmap, kpi, skills, how-i-work, achievements, portrait, info-card, featured (theme=${activeName()}, mode=${live ? "live" : "sample"}, portrait=${portraitOpts.photo ? "photo" : portraitOpts.mark})`
);
