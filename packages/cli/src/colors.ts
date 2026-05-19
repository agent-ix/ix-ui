import { createColors } from "picocolors";

const pc = createColors(true);

// Muted terracotta red — ANSI 256 color 167, softer than bright red.
// Hex equivalent for use with ink's <Text color={...}>.
export const RED_HEX = "#d75f5f";
const red = (s: string) => `\x1b[38;5;167m${s}\x1b[0m`;

export const colors = {
  cyan: pc.cyan,
  green: pc.green,
  yellow: pc.yellow,
  red,
  dim: pc.dim,
  bold: pc.bold,
  underline: pc.underline,
  bgCyan: pc.bgCyan,
  black: pc.black,
};

// "IX blue" alias — single source of the accent colour used throughout.
export const blue = pc.cyan;

// Orbit tone helpers — 4-step blue brightness gradient for the new orbit
// spinner. Glyph (⋅ vs ∘) and color both track depth: closer = bigger + brighter.
const c256 = (n: number) => (s: string) => `\x1b[38;5;${n}m${s}\x1b[0m`;
export const orbitDim = c256(60); //    dark steel  — ⋅ at adj   (deepest visible)
export const orbitMedDim = c256(67); // steel       — ⋅ at far   (back at equator)
export const orbitMed = c256(75); //    cornflower  — ∘ at far   (front at equator)
export const orbitBright = c256(117); // sky blue   — ∘ at adj   (closest)
