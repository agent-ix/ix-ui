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

// Satellite orbiting a planet left→right. Planet ⊙ (or ⊚ when transiting)
// is always at column 2; all frames are exactly 4 chars wide so the planet is
// stable. Right-side trail recedes through three glyphs: adjacent ⚬ → gap ∘ →
// gap ⋅. The trailing char is always a space so no additional separator is
// needed when rendering before [ header ].
export const ORBIT_SPINNER = [
  "∘⊙  ", // near left
  " ⊚  ", // transiting (satellite in front of planet)
  " ⊙⚬ ", // near right (adjacent)
  " ⊙ ∘", // receding right
  " ⊙ ⋅", // far right (fading)
  " ⊙  ", // behind
  "⋅⊙  ", // approaching left
];
