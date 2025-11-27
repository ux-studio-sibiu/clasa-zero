
export const colors = {
  red:    { darkShades: ["#D90429", "#EF233C"], lightShades: ["#FF595E", "#FFB3C6"], stringM: "roșu", stringF: "roșie" },
  // orange: { darkShades: ["#FF6700", "#FF8800"], lightShades: ["#FFB347", "#FFD580"], stringM: "portocaliu", stringF: "portocalie" },
  // yellow: { darkShades: ["#FFD600", "#FFEA00"], lightShades: ["#FFF700", "#FFFACD"], stringM: "galben", stringF: "galbenă" },
  green:  { darkShades: ["#00B894", "#00FF72"], lightShades: ["#55EFCB", "#A3FFB3"], stringM: "verde", stringF: "verde" },
  // blue:   { darkShades: ["#0057B8", "#0074D9"], lightShades: ["#4FC3F7", "#A7C7E7"], stringM: "albastru", stringF: "albastră" },
  pink:   { darkShades: ["#FF1493", "#E75480"], lightShades: ["#FF69B4", "#FFB6C1"], stringM: "roz", stringF: "roz" },
  violet: { darkShades: ["#8F00FF", "#9400D3"], lightShades: ["#CBA6FF", "#E0BBE4"], stringM: "mov", stringF: "mov" },
  white:  { darkShades: ["#E5E5E5", "#CCCCCC"], lightShades: ["#FFFFFF", "#F8F8FF"], stringM: "alb", stringF: "albă" },
  gray:   { darkShades: ["#4B4B4B", "#6E6E6E"], lightShades: ["#B0B0B0", "#D3D3D3"], stringM: "gri", stringF: "gri" },
  black:  { darkShades: ["#000000", "#222222"], lightShades: ["#444444", "#555555"], stringM: "negru", stringF: "neagră" }
} as const;

export function randomColor(colorKeys?: (keyof typeof colors)[]) {
  const keys = colorKeys ?? (Object.keys(colors) as (keyof typeof colors)[]);
  const randomColorKey = keys[Math.floor(Math.random() * keys.length)];
  return { key: randomColorKey, value: colors[randomColorKey] };
}

const randomColorObject = randomColor();
const randomColorObjectFromParam = randomColor(["red"]);

export const shapes = {
  caprioara: { string: "căprioară", file: "caprioara.png", gender: "f" },
  iepure:    { string: "iepure", file: "iepure.png", gender: "m" },
  leu:       { string: "leu", file: "leu.png", gender: "m" },
  cal:       { string: "cal", file: "cal.png", gender: "m" },
  urs:       { string: "urs", file: "urs.png", gender: "m" },
  vaca:      { string: "vacă", file: "vaca.png", gender: "f" },
} as const;

export function randomShape(shapeKeys?: (keyof typeof shapes)[]) {
  const keys = shapeKeys ?? (Object.keys(shapes) as (keyof typeof shapes)[]);
  const randomShapeKey = keys[Math.floor(Math.random() * keys.length)];
  return { key: randomShapeKey, value: shapes[randomShapeKey] };
}

export function randomShapeName(notShape?: (keyof typeof shapes)[]) {
  const keys = (Object.keys(shapes) as (keyof typeof shapes)[]).filter(key => !notShape?.includes(key));
  const randomShapeKey = keys[Math.floor(Math.random() * keys.length)] as keyof typeof shapes;
  return shapes[randomShapeKey].string;
}

export function randomColorName(gender: "m" | "f", notColorKeys: (keyof typeof colors)[]) {
  const keys = (Object.keys(colors) as (keyof typeof colors)[]).filter(key => !notColorKeys.includes(key));
  const randomColorKey = keys[Math.floor(Math.random() * keys.length)];
  const colorObj = colors[randomColorKey];
  return gender === "f" ? colorObj.stringF : colorObj.stringM;
}