export const BRAILLE_SPINNER = [
  "⠋",
  "⠙",
  "⠹",
  "⠸",
  "⠼",
  "⠴",
  "⠦",
  "⠧",
  "⠇",
  "⠏",
];

export const HEADER_SPINNER = ["⊕", "⊘", "⊗", "⊖"];

// ── Orbit spinner ──────────────────────────────────────────────────────────
//
// Two satellites 180° apart on a CW orbit, projected to a 5-cell horizontal
// lane (planet ⊝ at col 2). Each satellite goes through:
//   behind → out → closer → in → transit → out → farther → in → transit
// Glyph and color both track depth: ⋅ small/dim = farther, ∘ big/bright = closer.

export type OrbitTone = "gray" | "dim" | "medDim" | "med" | "bright";
export type OrbitCell = " " | { glyph: string; tone: OrbitTone };
export type OrbitFrame = OrbitCell[];

const cell = (glyph: string, tone: OrbitTone): OrbitCell => ({ glyph, tone });
const PLANET = cell("⊝", "gray");
const TRANSIT = cell("⊚", "gray");

// 10-frame cycle. Frames 5–9 are visually identical to 0–4 (the two sats
// swap which one is "in front" at each transit).
//   n=0   ⊚       transit-front  (front sat over planet)
//   n=1   ⋅⊝∘    out  — back-adj-L (⋅ dim) / front-adj-R (∘ bright)
//   n=2   ⋅ ⊝ ∘  edge — back-far-L (⋅ medDim) / front-far-R (∘ med)
//   n=3   ∘ ⊝ ⋅  edge — front-far-L (∘ med)  / back-far-R (⋅ medDim)
//   n=4   ∘⊝⋅    in   — front-adj-L (∘ bright) / back-adj-R (⋅ dim)
//   n=5   ⊚       transit (other sat now in front)
//   n=6–9        identical to 1–4
export const ORBIT_SPINNER: OrbitFrame[] = [
  [" ", " ", TRANSIT, " ", " "],
  [" ", cell("⋅", "dim"), PLANET, cell("∘", "bright"), " "],
  [cell("⋅", "medDim"), " ", PLANET, " ", cell("∘", "med")],
  [cell("∘", "med"), " ", PLANET, " ", cell("⋅", "medDim")],
  [" ", cell("∘", "bright"), PLANET, cell("⋅", "dim"), " "],
  [" ", " ", TRANSIT, " ", " "],
  [" ", cell("⋅", "dim"), PLANET, cell("∘", "bright"), " "],
  [cell("⋅", "medDim"), " ", PLANET, " ", cell("∘", "med")],
  [cell("∘", "med"), " ", PLANET, " ", cell("⋅", "medDim")],
  [" ", cell("∘", "bright"), PLANET, cell("⋅", "dim"), " "],
];

/** Plain-text glyph string for a frame — useful for tests and logs. */
export const orbitFrameGlyphs = (frame: OrbitFrame): string =>
  frame.map((c) => (typeof c === "string" ? c : c.glyph)).join("");
