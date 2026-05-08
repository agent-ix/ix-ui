import pc from "picocolors";

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
