



export const DARK_COLORS = {
  red:    ["#7F1D1D", "#991B1B", "#B91C1C", "#DC2626", "#EF4444"],
  orange: ["#7C2D12", "#9A3412", "#C2410C", "#EA580C", "#F97316"],
  yellow: ["#713F12", "#854D0E", "#A16207", "#CA8A04", "#EAB308"],
  green:  ["#14532D", "#166534", "#15803D", "#16A34A", "#22C55E"],
  blue:   ["#1E3A8A", "#1E40AF", "#1D4ED8", "#2563EB", "#3B82F6"],
  indigo: ["#312E81", "#3730A3", "#4338CA", "#4F46E5", "#6366F1"],
  violet: ["#4C1D95", "#5B21B6", "#6D28D9", "#7C3AED", "#8B5CF6"],
  pink:   ["#831843", "#9D174D", "#BE185D", "#DB2777", "#EC4899"]
} as const;

export const LIGHT_COLORS = {
  red:    ["#FCA5A5", "#FECACA", "#FEE2E2", "#FEEAEA", "#FFF5F5"],
  orange: ["#FDBA74", "#FED7AA", "#FFE4C7", "#FFF0DC", "#FFF7ED"],
  yellow: ["#FDE68A", "#FEF08A", "#FEF9C3", "#FFFBCC", "#FFFDEA"],
  green:  ["#86EFAC", "#BBF7D0", "#D9FBEA", "#E7FDF3", "#F3FFF9"],
  blue:   ["#93C5FD", "#BFDBFE", "#DBEAFE", "#E0F2FE", "#F0F9FF"],
  indigo: ["#A5B4FC", "#C7D2FE", "#E0E7FF", "#EBF0FF", "#F5F7FF"],
  violet: ["#C4B5FD", "#DDD6FE", "#EDE9FE", "#F5F3FF", "#FBF9FF"],
  pink:   ["#F9A8D4", "#FBCFE8", "#FCE7F3", "#FDF2F8", "#FFF6FB"]
} as const;

export function randomShade(
  colorSet: typeof DARK_COLORS | typeof LIGHT_COLORS,
  color: keyof typeof colorSet
) {
  const shades = colorSet[color];
  return shades[Math.floor(Math.random() * shades.length)];
}

export function randomColor(colorSet: typeof DARK_COLORS | typeof LIGHT_COLORS) {
  const colorKeys = Object.keys(colorSet) as (keyof typeof colorSet)[];
  const randomColorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
  return randomShade(colorSet, randomColorKey);
}

const randomColorDark = randomColor(DARK_COLORS);
const randomDarkBlue = randomShade(DARK_COLORS, "blue");
const randomLightPink = randomShade(LIGHT_COLORS, "pink");