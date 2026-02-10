export interface RevealTheme {
  id: string;
  name: string;
  previewBackground: string;
  previewTextColor: string;
}

export const REVEAL_THEMES: RevealTheme[] = [
  { id: "black", name: "Black", previewBackground: "#191919", previewTextColor: "#ffffff" },
  { id: "white", name: "White", previewBackground: "#ffffff", previewTextColor: "#222222" },
  { id: "league", name: "League", previewBackground: "#2b2b2b", previewTextColor: "#eee8d5" },
  { id: "sky", name: "Sky", previewBackground: "#f7fbfc", previewTextColor: "#333333" },
  { id: "beige", name: "Beige", previewBackground: "#f7f3de", previewTextColor: "#333333" },
  { id: "simple", name: "Simple", previewBackground: "#ffffff", previewTextColor: "#000000" },
  { id: "serif", name: "Serif", previewBackground: "#f0edde", previewTextColor: "#000000" },
  { id: "blood", name: "Blood", previewBackground: "#222222", previewTextColor: "#eee8d5" },
  { id: "night", name: "Night", previewBackground: "#111111", previewTextColor: "#eee8d5" },
  { id: "moon", name: "Moon", previewBackground: "#002b36", previewTextColor: "#93a1a1" },
  { id: "solarized", name: "Solarized", previewBackground: "#fdf6e3", previewTextColor: "#657b83" },
];

const VALID_THEME_IDS = new Set(REVEAL_THEMES.map((t) => t.id));

export function isValidTheme(themeId: string): boolean {
  return VALID_THEME_IDS.has(themeId);
}
