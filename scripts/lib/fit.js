"use strict";
// Conservative monospace width check (0.62em per glyph) so text stays inside
// its box even if the viewer falls back to a wider monospace font.
function textWidth(s, size) {
  return [...String(s)].length * size * 0.62;
}
function assertFits(s, size, max, where) {
  const w = textWidth(s, size);
  if (w > max) throw new Error(`Text overflows ${where}: "${s}" (${w.toFixed(0)}px > ${max.toFixed(0)}px)`);
}
module.exports = { textWidth, assertFits };
