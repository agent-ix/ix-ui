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

// Satellite orbiting a planet left→right. Planet ⦿ (or ⊚ when transiting)
// is always at column 1; all frames are 5 chars wide so the planet is stable.
// Near right has a gap between planet and satellite (col 3); receding is col 4.
export const ORBIT_SPINNER = [
  "∘⦿   ", // near left
  " ⊚   ", // transiting (satellite in front of planet)
  " ⦿ ∘ ", // near right (gap between planet and satellite)
  " ⦿ ⋅ ", // receding right
  " ⦿   ", // behind
  "⋅⦿   ", // approaching left
];
