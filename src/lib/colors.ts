// Muted pastel colors for cars — readable on dark bg
export const CAR_COLORS = [
  "#7ecfb3", // muted mint
  "#7eb5d4", // muted sky
  "#c4a76e", // muted gold
  "#b07ecc", // muted violet
  "#cc8e7e", // muted coral
  "#7ebf99", // muted sage
  "#9e9ecf", // muted periwinkle
  "#c47ea0", // muted rose
];

export function getCarColor(index: number): string {
  return CAR_COLORS[index % CAR_COLORS.length];
}
