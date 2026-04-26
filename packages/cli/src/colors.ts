import pc from "picocolors";

// Muted terracotta red — ANSI 256 color 167, softer than bright red.
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
