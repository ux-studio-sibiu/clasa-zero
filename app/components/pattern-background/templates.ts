// Background templates - looks saved to Sanity with some props fixed and some left to chance.
//
// A template mirrors PatternBackgroundConfig key for key. Every value is either a plain value
// (fixed) or a rule (rolled each time a puzzle asks for a background):
//
//   NumberRule   3                         fixed
//                { range: [0, 360], step: 15 }
//   ChoiceRule   "liquid-cheese" | null    fixed (null = layer off)
//                { from: "all", deny: ["bk37"] }
//                { from: ["a1", "a4"] }
//   palette      also { topics: ["summer"] } - narrows "all" to palettes with any of those topics
//   paletteShift "random" - a random rotation of the palette's colours
//   color        "puzzle" - the colour the puzzle passes in (none when it passes none)
//   *Chance      0..1, how often that layer shows at all (default 1)
//
// Adding a prop: add it to PatternBackgroundConfig, then to NUMBER_KEYS / LAYER_KEYS below.

import {
  DEFAULT_CONFIG, IMAGE_BACKGROUNDS, OVERLAY_PATTERNS, PALETTES, PATTERN_BLENDS, SVG_BACKGROUNDS, rollBackground,
  type PatternBackgroundConfig, type PatternBlend,
} from "./engine";

/* ---------------------------------------------------------------- puzzle types */

// One key per puzzle component. Pools are keyed by these, in Sanity and in the game.
export const PUZZLE_TYPES = [
  { key: "add", label: "Add" },
  { key: "shape", label: "Shape" },
  { key: "series", label: "Series" },
  { key: "series-shape", label: "Series shape" },
  { key: "pairs", label: "Pairs" },
  { key: "scale-1", label: "Scale" },
  { key: "count-color", label: "Count colour" },
  { key: "weekdays", label: "Weekdays" },
  { key: "missing-ones", label: "Missing ones" },
  { key: "hands", label: "Hands" },
  { key: "sanity", label: "Sanity question" },
] as const;
export type PuzzleType = (typeof PUZZLE_TYPES)[number]["key"];
const PUZZLE_KEYS: string[] = PUZZLE_TYPES.map((t) => t.key);

/* ---------------------------------------------------------------- shapes */

export type NumberRule = number | { range: [number, number]; step?: number };
export type ChoiceRule<T> = T | null | { from: "all" | T[]; deny?: T[] };
export type PaletteRule = ChoiceRule<number> | { from: "all" | number[]; deny?: number[]; topics?: string[] };

export type BackgroundTemplate = {
  v: 1;
  color?: string | null | "puzzle";
  opacity?: NumberRule;
  image?: ChoiceRule<string>; imageChance?: number; imageOpacity?: NumberRule;
  svg?: ChoiceRule<string>; svgChance?: number;
  palette?: PaletteRule; paletteShift?: number | "random";
  colors?: Record<string, string>;
  hue?: NumberRule; saturation?: NumberRule; lightness?: NumberRule; scale?: NumberRule; svgRotate?: NumberRule; svgZoom?: NumberRule;
  pattern?: ChoiceRule<string>; patternChance?: number; patternColor?: string; patternBlend?: PatternBlend;
  patternOpacity?: NumberRule; patternScale?: NumberRule; patternRotate?: NumberRule;
};
export type TemplateKey = Exclude<keyof BackgroundTemplate, "v">;

// A template as stored: the template itself plus how it is filed.
export type TemplateMeta = { name: string; puzzleTypes: PuzzleType[]; weight: number; enabled: boolean };
export type TemplateDoc = TemplateMeta & { _id: string; _rev?: string; template: BackgroundTemplate; snapshot: PatternBackgroundConfig };

const NUMBER_KEYS = ["opacity", "imageOpacity", "hue", "saturation", "lightness", "scale", "svgRotate", "svgZoom", "patternOpacity", "patternScale", "patternRotate"] as const;
const LAYER_KEYS = {
  image: ["image", "imageChance", "imageOpacity"],
  svg: ["svg", "svgChance", "palette", "paletteShift", "colors", "hue", "saturation", "lightness", "scale", "svgRotate", "svgZoom"],
  pattern: ["pattern", "patternChance", "patternColor", "patternBlend", "patternOpacity", "patternScale", "patternRotate"],
} as const satisfies Record<string, readonly TemplateKey[]>;
export type LayerName = keyof typeof LAYER_KEYS;
export const LAYERS = Object.keys(LAYER_KEYS) as LayerName[];

const CATALOGUE = {
  image: IMAGE_BACKGROUNDS,
  svg: SVG_BACKGROUNDS.map((b) => b.id),
  pattern: OVERLAY_PATTERNS.map((p) => p.name),
};

export const isRule = (v: unknown): v is { from?: unknown; range?: unknown } => typeof v === "object" && v !== null && !Array.isArray(v);

/* ---------------------------------------------------------------- resolving */

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

function rollNumber(rule: NumberRule | undefined, fallback: number) {
  if (rule === undefined) return fallback;
  if (typeof rule === "number") return rule;
  const [lo, hi] = rule.range, step = rule.step || (hi - lo > 10 ? 1 : 0.05);
  return +(lo + Math.round((Math.random() * (hi - lo)) / step) * step).toFixed(2);
}

function rollChoice<T>(rule: ChoiceRule<T> | undefined, all: T[]): T | null {
  if (!isRule(rule)) return (rule as T | null | undefined) ?? null;
  const r = rule as { from: "all" | T[]; deny?: T[] };
  const list = (r.from === "all" ? all : r.from).filter((x) => !r.deny?.includes(x));
  return list.length ? pick(list) : null;
}

function rollPalette(rule: PaletteRule | undefined) {
  if (!isRule(rule)) return (rule as number | null | undefined) ?? null;
  const topics = "topics" in rule && rule.topics?.length ? rule.topics : null;
  const all = PALETTES.filter((p) => !topics || p.topics.some((t) => topics.includes(t))).map((p) => p.id);
  return rollChoice(rule as ChoiceRule<number>, all);
}

// Hand-edited swatches name the colours of one drawing in one palette, so they only survive
// when both are fixed.
const keepsColors = (t: Pick<BackgroundTemplate, "svg" | "palette" | "paletteShift">) =>
  typeof t.svg === "string" && !isRule(t.palette) && t.paletteShift !== "random";

// One concrete look from a template. `puzzleColor` is what `color: "puzzle"` resolves to.
export function resolveTemplate(t: BackgroundTemplate, ctx: { puzzleColor?: string | null } = {}): PatternBackgroundConfig {
  const out: PatternBackgroundConfig = { ...DEFAULT_CONFIG, colors: {} };
  out.color = t.color === "puzzle" ? ctx.puzzleColor ?? null : t.color ?? null;
  out.opacity = rollNumber(t.opacity, 1);
  const shows = (rule: unknown, chance?: number) => rule != null && Math.random() < (chance ?? 1);

  if (shows(t.image, t.imageChance)) {
    out.image = rollChoice(t.image, CATALOGUE.image);
    out.imageOpacity = rollNumber(t.imageOpacity, 1);
  }
  if (shows(t.svg, t.svgChance)) {
    out.svg = rollChoice(t.svg, CATALOGUE.svg);
    out.palette = rollPalette(t.palette);
    const size = PALETTES.find((p) => p.id === out.palette)?.colors.length || 1;
    out.paletteShift = t.paletteShift === "random" ? Math.floor(Math.random() * size) : t.paletteShift ?? 0;
    if (keepsColors(t)) out.colors = t.colors || {};
    for (const k of ["hue", "saturation", "lightness", "scale", "svgRotate", "svgZoom"] as const) out[k] = rollNumber(t[k], DEFAULT_CONFIG[k]);
  }
  if (shows(t.pattern, t.patternChance)) {
    out.pattern = rollChoice(t.pattern, CATALOGUE.pattern);
    out.patternColor = t.patternColor ?? DEFAULT_CONFIG.patternColor;
    out.patternBlend = t.patternBlend ?? "normal";
    for (const k of ["patternOpacity", "patternScale", "patternRotate"] as const) out[k] = rollNumber(t[k], DEFAULT_CONFIG[k]);
  }
  return out;
}

// A weighted pick from the enabled templates tagged with a puzzle type - null when its pool is empty.
export function pickTemplate(templates: TemplateDoc[], type: PuzzleType) {
  const pool = templates.filter((d) => d.enabled && d.weight > 0 && d.puzzleTypes.includes(type));
  if (!pool.length) return null;
  let r = Math.random() * pool.reduce((sum, d) => sum + d.weight, 0);
  return pool.find((d) => (r -= d.weight) < 0) || pool[pool.length - 1];
}

// What a puzzle gets: a look from its pool, or a fully random background when the pool is empty.
// `noImage` keeps a jpg out of that random background (templates still show theirs).
export function pickBackground(templates: TemplateDoc[], type: PuzzleType, ctx: { puzzleColor?: string | null; noImage?: boolean } = {}) {
  const doc = pickTemplate(templates, type);
  return doc ? resolveTemplate(doc.template, ctx) : rollBackground({ noImage: ctx.noImage });
}

/* ---------------------------------------------------------------- the panel's draft */

// The panel edits a concrete look (`config`, layers it hides already nulled) plus `rules`: the props
// that are not fixed, in template form. Saving merges the two; loading splits them again.
export function templateFromDraft(config: PatternBackgroundConfig, rules: Partial<BackgroundTemplate>): BackgroundTemplate {
  const t: BackgroundTemplate = { v: 1 };
  const set = (k: TemplateKey, fixed: unknown) => { const v = rules[k] ?? fixed; if (v !== undefined) (t as Record<string, unknown>)[k] = v; };
  set("color", config.color ?? null);
  set("opacity", config.opacity);
  for (const layer of LAYERS) {
    if (config[layer] == null) continue;   // a hidden layer is not part of the template
    for (const k of LAYER_KEYS[layer]) set(k, (config as Record<string, unknown>)[k]);
  }
  if (t.svg != null && !keepsColors(t)) delete t.colors;
  return t;
}

export function draftFromTemplate(t: BackgroundTemplate, snapshot?: PatternBackgroundConfig) {
  const rules: Partial<BackgroundTemplate> = {};
  for (const [k, v] of Object.entries(t) as [TemplateKey, unknown][]) {
    if (isRule(v) && k !== "colors") (rules as Record<string, unknown>)[k] = v;
    else if ((k === "color" && v === "puzzle") || (k === "paletteShift" && v === "random") || k.endsWith("Chance")) (rules as Record<string, unknown>)[k] = v;
  }
  return { config: { ...DEFAULT_CONFIG, ...(snapshot || resolveTemplate(t)) }, rules };
}

/* ---------------------------------------------------------------- validation */
// Shared by the API route (which writes to Sanity with a token that could write anything) and
// the Studio schema, so both reject the same things.

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
const HEX = /^#[0-9a-f]{6}$/i;
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

function checkNumber(k: string, v: unknown) {
  if (isNum(v)) return null;
  if (isRule(v) && Array.isArray((v as { range?: unknown }).range)) {
    const { range, step } = v as { range: unknown[]; step?: unknown };
    if (range.length === 2 && range.every(isNum) && (range[0] as number) <= (range[1] as number) && (step === undefined || (isNum(step) && step > 0))) return null;
  }
  return `${k}: expected a number or { range: [min, max], step? }`;
}

function checkChoice(k: string, v: unknown, all: (string | number)[], extra: string[] = []) {
  if (v === null || all.includes(v as string | number)) return null;
  if (!isRule(v)) return `${k}: unknown value ${JSON.stringify(v)}`;
  const r = v as Record<string, unknown>;
  const bad = Object.keys(r).filter((x) => !["from", "deny", ...extra].includes(x));
  if (bad.length) return `${k}: unknown field ${bad[0]}`;
  const listOk = (l: unknown) => Array.isArray(l) && l.every((x) => all.includes(x));
  if (!(r.from === "all" || listOk(r.from))) return `${k}.from: "all" or a list of known values`;
  if (r.deny !== undefined && !listOk(r.deny)) return `${k}.deny: a list of known values`;
  if (r.topics !== undefined && !(Array.isArray(r.topics) && r.topics.every((x) => typeof x === "string"))) return `${k}.topics: a list of topics`;
  return null;
}

export function validateTemplate(input: unknown): Result<BackgroundTemplate> {
  if (!isRule(input)) return { ok: false, error: "template: expected an object" };
  const t = input as Record<string, unknown>;
  if (t.v !== 1) return { ok: false, error: "template.v: expected 1" };
  for (const [k, v] of Object.entries(t)) {
    let error: string | null = null;
    if (k === "v") continue;
    else if ((NUMBER_KEYS as readonly string[]).includes(k)) error = checkNumber(k, v);
    else if (k.endsWith("Chance")) error = isNum(v) && v >= 0 && v <= 1 ? null : `${k}: a number from 0 to 1`;
    else if (k === "image" || k === "svg" || k === "pattern") error = checkChoice(k, v, CATALOGUE[k]);
    else if (k === "palette") error = checkChoice(k, v, PALETTES.map((p) => p.id), ["topics"]);
    else if (k === "paletteShift") error = v === "random" || (isNum(v) && v >= 0) ? null : `${k}: a number or "random"`;
    else if (k === "color") error = v === null || v === "puzzle" || (typeof v === "string" && HEX.test(v)) ? null : `${k}: #rrggbb, "puzzle" or null`;
    else if (k === "patternColor") error = typeof v === "string" && HEX.test(v) ? null : `${k}: #rrggbb`;
    else if (k === "patternBlend") error = PATTERN_BLENDS.includes(v as PatternBlend) ? null : `${k}: one of ${PATTERN_BLENDS.join(", ")}`;
    else if (k === "colors") error = isRule(v) && Object.entries(v).every(([a, b]) => /^[0-9a-f]{6}$/.test(a) && typeof b === "string" && /^[0-9a-f]{6}$/.test(b)) ? null : `${k}: { rrggbb: rrggbb }`;
    else error = `unknown field ${k}`;
    if (error) return { ok: false, error };
  }
  return { ok: true, value: t as BackgroundTemplate };
}

export function validateMeta(input: Record<string, unknown>, partial = false): Result<Partial<TemplateMeta>> {
  const out: Partial<TemplateMeta> = {};
  const has = (k: string) => input[k] !== undefined;
  if (has("name") || !partial) {
    if (typeof input.name !== "string" || !input.name.trim() || input.name.length > 80) return { ok: false, error: "name: 1-80 characters" };
    out.name = input.name.trim();
  }
  if (has("puzzleTypes") || !partial) {
    if (!Array.isArray(input.puzzleTypes) || !input.puzzleTypes.every((x) => PUZZLE_KEYS.includes(x))) return { ok: false, error: "puzzleTypes: a list of puzzle type keys" };
    out.puzzleTypes = [...new Set(input.puzzleTypes as PuzzleType[])];
  }
  if (has("weight") || !partial) {
    if (!isNum(input.weight) || input.weight < 0 || input.weight > 100) return { ok: false, error: "weight: 0-100" };
    out.weight = input.weight;
  }
  if (has("enabled") || !partial) {
    if (typeof input.enabled !== "boolean") return { ok: false, error: "enabled: true or false" };
    out.enabled = input.enabled;
  }
  return { ok: true, value: out };
}

// The snapshot is only ever loaded back into the panel, so it is filtered rather than refused.
export function cleanSnapshot(input: unknown): PatternBackgroundConfig {
  if (!isRule(input)) return {};
  const known = Object.keys(DEFAULT_CONFIG);
  return Object.fromEntries(Object.entries(input).filter(([k]) => known.includes(k))) as PatternBackgroundConfig;
}

/* ---------------------------------------------------------------- sanity <-> doc */
// The template and snapshot are stored as JSON text: the format is expected to keep changing, and a
// text field needs no schema migration when it does. The validator above is what keeps it honest.

export type SanityTemplateDoc = TemplateMeta & { _id: string; _rev?: string; template: string; snapshot?: string };

export function fromSanity(d: SanityTemplateDoc): TemplateDoc | null {
  try {
    const template = validateTemplate(JSON.parse(d.template));
    if (!template.ok) { console.warn(`background template "${d.name}" skipped - ${template.error}`); return null; }
    return {
      _id: d._id, _rev: d._rev, name: d.name, puzzleTypes: d.puzzleTypes || [], weight: d.weight ?? 1, enabled: d.enabled !== false,
      template: template.value, snapshot: cleanSnapshot(d.snapshot ? JSON.parse(d.snapshot) : {}),
    };
  } catch {
    console.warn(`background template "${d.name}" skipped - not valid JSON`);
    return null;
  }
}

export const TEMPLATE_QUERY = `*[_type == "backgroundTemplate"] | order(name asc) { _id, _rev, name, puzzleTypes, weight, enabled, template, snapshot }`;
