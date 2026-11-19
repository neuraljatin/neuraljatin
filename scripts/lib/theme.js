"use strict";

const fs = require("fs");
const path = require("path");

const THEME_PATH = path.join(__dirname, "..", "theme.json");

function loadThemeFile() {
  return JSON.parse(fs.readFileSync(THEME_PATH, "utf8"));
}

function activeName(override) {
  const file = loadThemeFile();
  return override || process.env.THEME || file.active || "teal";
}

function palette(mode = "dark", override) {
  const file = loadThemeFile();
  const name = activeName(override);
  const theme = file.themes[name];
  if (!theme) {
    throw new Error(`Unknown theme "${name}". Known: ${Object.keys(file.themes).join(", ")}`);
  }
  const block = theme[mode];
  if (!block) throw new Error(`Theme "${name}" has no "${mode}" block`);
  return { name, label: theme.label, mode, ...block };
}

function letterColor(pal, letter) {
  const letters = "JATIN";
  const i = letters.indexOf(letter);
  const colors = pal.heatmap.letters;
  return colors[i] || colors[colors.length - 1];
}

module.exports = { loadThemeFile, activeName, palette, letterColor, THEME_PATH };
