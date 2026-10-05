// Pattern background engine - ported from effects-collection/randomize-studio
// (js/svg-background.js + the pattern overlay in js/render.js).
//
// Three layers over an optional flat colour, bottom to top:
//  - image:   one of the jpgs in public/images/backgrounds, cover-fitted.
//  - svg:     one of the svgbackgrounds.com backgrounds. Edits are made to its CSS TEXT -
//             every %23rrggbb in the data URI is remapped - so a recoloured background is
//             still plain CSS: no canvas, no fetch, no SVG parsing.
//  - pattern: a tile baked into data/overlay-patterns.ts, used as a MASK, so only its alpha matters
//             and the colour comes from CSS.

import type { CSSProperties } from "react";
import { SVG_BACKGROUNDS, type SvgBackground } from "./data/svg-backgrounds";
import { PALETTES, type Palette } from "./data/palettes";
import { OVERLAY_PATTERNS, type OverlayPattern } from "./data/overlay-patterns";
import { IMAGE_BACKGROUNDS } from "./data/image-backgrounds";

export { SVG_BACKGROUNDS, PALETTES, OVERLAY_PATTERNS, IMAGE_BACKGROUNDS };
export type { SvgBackground, Palette, OverlayPattern };

export type PatternBlend = "normal" | "multiply" | "screen" | "overlay" | "color-dodge" | "color-burn" | "lighten" | "darken";
export const PATTERN_BLENDS: PatternBlend[] = ["normal", "multiply", "screen", "overlay", "color-dodge", "color-burn", "lighten", "darken"];

export type PatternBackgroundConfig = {
  color?: string | null;            // flat colour under the layers - null for none
  opacity?: number;                 // 0.1..1, the whole background: the colour's alpha and the layers' opacity
  image?: string | null;            // a jpg name from public/images/backgrounds - null = no image layer
  imageOpacity?: number;
  svg?: string | null;              // SvgBackground.id - null = no svg layer
  palette?: number | null;          // Palette.id, mapped onto the svg's colours by lightness
  paletteShift?: number;            // cycles which palette colour lands where
  colors?: Record<string, string>;  // per-colour swaps, "aabbcc": "ddeeff" - applied after the palette
  hue?: number;                     // -180..180 deg, shifts every colour
  saturation?: number;              // -100..100 %
  lightness?: number;               // -50..50 %
  scale?: number;                   // tile scale for repeating svgs
  svgRotate?: number;               // 0..360 deg, turns the drawing
  svgZoom?: number;                 // 1..4, scales the drawing itself (works on cover-sized gradients too)
  pattern?: string | null;          // OverlayPattern.name - null = no pattern layer
  patternColor?: string;
  patternOpacity?: number;
  patternScale?: number;
  patternRotate?: number;           // 0..360 deg
  patternBlend?: PatternBlend;
};

type Nullable = "svg" | "palette" | "pattern" | "color" | "image";
export const DEFAULT_CONFIG: Required<Omit<PatternBackgroundConfig, Nullable>> & Pick<PatternBackgroundConfig, Nullable> = {
  color: null, opacity: 1,
  image: null, imageOpacity: 1,
  svg: null, palette: null, paletteShift: 0, colors: {},
  hue: 0, saturation: 0, lightness: 0, scale: 1, svgRotate: 0, svgZoom: 1,
  pattern: null, patternColor: "#000000", patternOpacity: 0.35, patternScale: 1, patternRotate: 0, patternBlend: "normal",
};

// The flat colour at the background's opacity: the hex itself when solid, rgba otherwise.
export function colorCss(config: PatternBackgroundConfig) {
  const a = config.opacity ?? 1;
  if (!config.color || a >= 1) return config.color || undefined;
  const n = parseInt(config.color.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${+a.toFixed(2)})`;
}

// The tile's markup is baked into the catalogue, so a pattern is a data URI - no request, and an
// exported look works anywhere. Encoded once per tile: the panel's grid asks for all 87 at once.
const patternUrls = new Map<string, string>();
export function patternUrl(name: string) {
  if (!patternUrls.has(name)) {
    const tile = OVERLAY_PATTERNS.find((p) => p.name === name);
    patternUrls.set(name, tile ? `data:image/svg+xml,${encodeURIComponent(tile.svg)}` : "");
  }
  return patternUrls.get(name)!;
}
export const imageUrl = (name: string) => `/images/backgrounds/${encodeURIComponent(name)}.jpg`;
export const svgById = (id?: string | null) => (id ? SVG_BACKGROUNDS.find((b) => b.id === id) : undefined);
const paletteById = (id?: number | null) => (id == null ? undefined : PALETTES.find((p) => p.id === id));
const patternByName = (name?: string | null) => (name ? OVERLAY_PATTERNS.find((p) => p.name === name) : undefined);

/* ---------------------------------------------------------------- colour */

const HEX_RE = /(%23|#)([0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{4}|[0-9a-f]{3})(?![0-9a-f])/gi;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// "ABC" / "abcd" / "aabbcc" -> { key: "aabbcc", alpha: "" | "dd" }
function parseHex(h: string) {
  h = h.toLowerCase();
  if (h.length <= 4) h = [...h].map((x) => x + x).join("");
  return { key: h.slice(0, 6), alpha: h.slice(6) };
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(0, 2), 16) / 255, g = parseInt(hex.slice(2, 4), 16) / 255, b = parseInt(hex.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}

function hslToHex(h: number, s: number, l: number) {
  const k = (n: number) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)))).toString(16).padStart(2, "0");
  return f(0) + f(8) + f(4);
}

function mix(a: string, b: string, t: number) {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  return [0, 2, 4].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t).toString(16).padStart(2, "0")).join("");
}

const lightnessOf = (hex: string) => hexToHsl(hex)[2];

// Every colour in a background: the base colour first, then the image's by how often it appears.
export function colorsOf(bg: SvgBackground) {
  const counts = new Map<string, number>();
  for (const m of (bg.css["background-image"] || "").matchAll(HEX_RE)) {
    const { key } = parseHex(m[2]);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const base = (bg.css["background-color"] || "").match(/^#([0-9a-f]{3,8})$/i);
  const baseKey = base ? parseHex(base[1]).key : null;
  const keys = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k).filter((k) => k !== baseKey);
  return { baseKey, keys };
}

/* Map the background's colours onto the palette by lightness rank: darkest to darkest,
   lightest to lightest. With more source colours than the palette has (a 60-shade gradient)
   they are spread along it and blended between neighbours, so a ramp stays a ramp. */
function paletteSwaps(bg: SvgBackground, pal: Palette, shift = 0) {
  const swaps: Record<string, string> = {};
  const { baseKey, keys } = colorsOf(bg);
  const src = [...new Set([...(baseKey ? [baseKey] : []), ...keys])].sort((a, b) => lightnessOf(a) - lightnessOf(b));
  const sorted = [...pal.colors].sort((a, b) => lightnessOf(a) - lightnessOf(b)), k = sorted.length;
  const dst = sorted.map((_, i) => sorted[(((i + shift) % k) + k) % k]);
  src.forEach((key, i) => {
    const t = src.length === 1 ? 0 : i / (src.length - 1);
    if (src.length <= k) { swaps[key] = dst[Math.round(t * (k - 1))]; return; }
    const x = t * (k - 1), j = Math.min(k - 2, Math.floor(x));
    swaps[key] = mix(dst[j], dst[j + 1], x - j);
  });
  return swaps;
}

// Returns the final colour for a source colour: its swap (palette, then manual), then the global shift.
export function colorMapper(config: PatternBackgroundConfig) {
  const bg = svgById(config.svg), pal = paletteById(config.palette);
  const swaps = { ...(bg && pal ? paletteSwaps(bg, pal, config.paletteShift) : {}), ...(config.colors || {}) };
  const hue = config.hue || 0, sat = config.saturation || 0, light = config.lightness || 0;
  return (key: string) => {
    let hex = swaps[key] || key;
    if (hue || sat || light) {
      let [h, s, l] = hexToHsl(hex);
      h = (h + hue + 360) % 360;
      s = clamp(s * (1 + sat / 100), 0, 1);
      l = clamp(l + light / 100, 0, 1);
      hex = hslToHex(h, s, l);
    }
    return hex;
  };
}

/* ---------------------------------------------------------------- tiles */

// Split a background-image value on its top-level commas.
function splitLayers(value: string) {
  const out: string[] = []; let cur = "", depth = 0, quote: string | null = null;
  for (const ch of value) {
    if (quote) { if (ch === quote) quote = null; }
    else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function svgOf(layer: string) {
  const m = layer.match(/^url\(\s*(["']?)data:image\/svg\+xml(?:;utf8)?,([\s\S]*)\1\s*\)$/);
  if (!m) return null;
  try { return decodeURIComponent(m[2]); } catch { return m[2]; }
}

// The natural tile size of each layer, or null when any layer has none -
// a % width or a cover/contain fit means there is no tile to scale.
export function tileSizes(bg: SvgBackground): [number, number][] | null {
  const fit = bg.css["background-size"];
  if (fit && /cover|contain/.test(fit)) return null;
  const sizes = splitLayers(bg.css["background-image"] || "").map((l) => {
    const svg = svgOf(l); if (!svg) return null;
    const root = svg.match(/<svg[^>]*>/); if (!root) return null;
    const w = root[0].match(/\swidth=['"]([\d.]+)(px)?['"]/), h = root[0].match(/\sheight=['"]([\d.]+)(px)?['"]/);
    return w && h ? ([+w[1], +h[1]] as [number, number]) : null;
  });
  return sizes.length && sizes.every(Boolean) ? (sizes as [number, number][]) : null;
}

const scaledSize = (sizes: [number, number][], f: number) => sizes.map(([w, h]) => `${+(w * f).toFixed(1)}px ${+(h * f).toFixed(1)}px`).join(", ");

/* ---------------------------------------------------------------- css */

// The svg layer's declarations (kebab-case) with every edit applied.
export function svgLayerCss(config: PatternBackgroundConfig, thumbnail = false): Record<string, string> {
  const bg = svgById(config.svg);
  if (!bg) return {};
  const map = colorMapper(config);
  const recolor = (text: string) => text.replace(HEX_RE, (_m, pre: string, hex: string) => {
    const { key, alpha } = parseHex(hex);
    return pre + map(key) + alpha;
  });
  const css: Record<string, string> = { ...bg.css };
  if (css["background-color"]) css["background-color"] = recolor(css["background-color"]);
  if (css["background-image"]) css["background-image"] = recolor(css["background-image"]);
  // `fixed` breaks inside Swiper's transformed slides, and the layer is sized to its box anyway.
  css["background-attachment"] = "scroll";
  const sizes = tileSizes(bg);
  // A big tile would show one corner of itself in a small thumbnail.
  if (sizes && thumbnail) css["background-size"] = scaledSize(sizes, Math.min(0.5, 140 / Math.max(...sizes[0])));
  else if (sizes && (config.scale ?? 1) !== 1) css["background-size"] = scaledSize(sizes, config.scale ?? 1);
  return css;
}

// The pattern tile's declarations, or null when there is no pattern.
export function patternLayerCss(config: PatternBackgroundConfig, thumbnail = false): Record<string, string> | null {
  const tile = patternByName(config.pattern);
  if (!tile) return null;
  const f = thumbnail ? Math.min(1, 40 / Math.max(tile.w, tile.h)) : (config.patternScale ?? 1);
  const url = `url("${patternUrl(tile.name)}")`;
  const size = `${+(tile.w * f).toFixed(1)}px ${+(tile.h * f).toFixed(1)}px`;
  return {
    "-webkit-mask-image": url, "mask-image": url,
    "-webkit-mask-size": size, "mask-size": size,
    "-webkit-mask-repeat": "repeat", "mask-repeat": "repeat",
    "-webkit-mask-position": "center", "mask-position": "center",
    "background-color": config.patternColor || DEFAULT_CONFIG.patternColor,
  };
}

// kebab-case declarations -> a React style object.
export function toStyle(css: Record<string, string>): CSSProperties {
  const style: Record<string, string> = {};
  for (const [prop, value] of Object.entries(css)) {
    const key = prop.startsWith("-webkit-") ? "Webkit" + prop.slice(8).replace(/-(\w)/g, (_m, c) => c.toUpperCase()) : prop.replace(/-(\w)/g, (_m, c) => c.toUpperCase());
    style[key] = value;
  }
  return style as CSSProperties;
}

/* ---------------------------------------------------------------- the dice */
// The texture kit's dice (intro/texture-kit.js).

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const between = (lo: number, hi: number, step = 0.01) => +(Math.round((lo + Math.random() * (hi - lo)) / step) * step).toFixed(2);

// `palettes` narrows the svg roll's palette pick - the panel passes the topic it is filtered to.
export type RollOptions = { palettes?: number[] };

// Original colours as often as a palette: these backgrounds were coloured by someone,
// and a set palette on top is an alternative, not a fix.
export function rollSvg(options: RollOptions = {}): PatternBackgroundConfig {
  const ids = options.palettes?.length ? options.palettes : PALETTES.map((p) => p.id);
  return {
    svg: pick(SVG_BACKGROUNDS.map((b) => b.id)),
    colors: {}, hue: 0, saturation: 0, lightness: 0, scale: 1, svgRotate: 0, svgZoom: 1,
    palette: Math.random() < 0.5 ? pick(ids) : null, paletteShift: 0,
  };
}

// Black at one of four set strengths, so a rolled pattern always reads and never rolls to nothing.
export function rollPattern(): PatternBackgroundConfig {
  return {
    pattern: pick(OVERLAY_PATTERNS.map((p) => p.name)),
    patternScale: between(0.5, 3, 0.1), patternOpacity: pick([0.25, 0.5, 0.75, 1]),
    patternRotate: Math.floor(Math.random() * 4) * 90, patternColor: "#000000", patternBlend: "normal",
  };
}

export function rollImage(): PatternBackgroundConfig {
  return { image: pick(IMAGE_BACKGROUNDS), imageOpacity: 1 };
}

// A whole random background: one base layer - image, svg OR pattern, never two - with its own
// settings rolled. What a puzzle gets when its pool has no templates.
export function rollBackground(options: RollOptions = {}): PatternBackgroundConfig {
  return { ...DEFAULT_CONFIG, ...pick([rollImage, rollSvg, rollPattern])(options) };
}

/* ---------------------------------------------------------------- export */

// Only the props that differ from the defaults - what a template's snapshot stores.
export function minimalConfig(config: PatternBackgroundConfig): PatternBackgroundConfig {
  const out: Record<string, unknown> = {};
  const defaults = DEFAULT_CONFIG as Record<string, unknown>;
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) continue;
    if (key === "colors" && (!value || !Object.keys(value as object).length)) continue;
    if (key === "colors" && !config.svg) continue;
    if (["palette", "hue", "saturation", "lightness", "scale", "svgRotate", "svgZoom"].includes(key) && !config.svg) continue;
    if (key.startsWith("pattern") && key !== "pattern" && !config.pattern) continue;
    if (key === "imageOpacity" && !config.image) continue;
    if (key === "paletteShift" && config.palette == null) continue;
    if (JSON.stringify(value) === JSON.stringify(defaults[key])) continue;
    out[key] = value;
  }
  return out as PatternBackgroundConfig;
}
