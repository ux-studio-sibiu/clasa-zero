"use client";

// Dev panel for the puzzles' background templates. Shown only when the URL has ?background-tools.
// The texture kit from the randomize-studio intro page (effects-collection/randomize-studio/intro/
// texture-kit.js) minus its Static fx layer and element picker: the same window, ink-on-paper styling
// and layer eyes / dice / locks - plus, on every prop that can vary, a toggle between fixed and random.
// What is on screen plus those rules is a template; Q (or Save) writes it to Sanity, filed under the
// puzzle types whose pools it joins. While the panel is open, every puzzle shows the look being edited.

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import "./background-tools.scss";
import { useBackgroundToolsStore, draftTemplate, visibleConfig } from "../zustand-stores/background-tools-store";
import { useBackgroundStore } from "../zustand-stores/background-store";
import {
  DEFAULT_CONFIG, IMAGE_BACKGROUNDS, OVERLAY_PATTERNS, PALETTES, SVG_BACKGROUNDS,
  colorMapper, colorsOf, imageUrl, minimalConfig, patternLayerCss, rollBackground, svgById, svgLayerCss, tileSizes, toStyle,
} from "../pattern-background/engine";
import {
  PUZZLE_TYPES, fromSanity, isRule, pickTemplate,
  type BackgroundTemplate, type ChoiceRule, type LayerName, type NumberRule, type PuzzleType, type SanityTemplateDoc,
} from "../pattern-background/templates";

const MAX_SWATCHES = 16;
const API = "/api/background-templates";
const PALETTE_TOPICS = ["All", ...[...new Set(PALETTES.flatMap((p) => p.topics))].sort()];
const PUZZLE_LABEL = Object.fromEntries(PUZZLE_TYPES.map((t) => [t.key, t.label])) as Record<PuzzleType, string>;
const ALL_FILTER_KEYS: string[] = [...PUZZLE_TYPES.map((t) => t.key), "none"];

// Template names: a colour, a trait and an animal - 30 of each, 27,000 combinations.
const NAME_COLORS = ["amber", "azure", "beige", "bronze", "cherry", "cobalt", "coral", "cream", "crimson", "denim", "ember", "emerald", "fuchsia", "ginger", "golden", "honey", "indigo", "ivory", "jade", "lemon", "lilac", "mint", "navy", "olive", "peach", "plum", "rusty", "saffron", "silver", "teal"];
const NAME_TRAITS = ["bold", "brave", "breezy", "bubbly", "calm", "cheeky", "clever", "cosy", "curious", "dizzy", "dreamy", "eager", "fancy", "fluffy", "fuzzy", "gentle", "giddy", "grumpy", "happy", "jolly", "lazy", "lucky", "mellow", "nimble", "proud", "quiet", "sleepy", "sneaky", "sunny", "witty"];
const NAME_ANIMALS = ["badger", "beaver", "bison", "camel", "corgi", "crane", "dingo", "dolphin", "falcon", "ferret", "gecko", "hamster", "hedgehog", "heron", "koala", "lemur", "llama", "lynx", "marmot", "moose", "narwhal", "otter", "panda", "parrot", "puffin", "quokka", "raccoon", "sloth", "walrus", "yak"];
const pickWord = (list: string[]) => list[Math.floor(Math.random() * list.length)];
// A fresh name - re-rolled a few times if it is already taken.
function generateName(taken: string[]) {
  let name = "";
  for (let i = 0; i < 12 && (!name || taken.includes(name)); i++) name = `${pickWord(NAME_COLORS)}-${pickWord(NAME_TRAITS)}-${pickWord(NAME_ANIMALS)}`;
  return name;
}
const signed = (v: number) => `${v > 0 ? "+" : ""}${v}`;
const fmt = (v: number) => String(+v.toFixed(2));
// The puzzle on screen, read off the slide - the panel needs nothing from the game but this.
const activePuzzleType = () => document.querySelector(".swiper-slide-active [data-puzzle-type]")?.getAttribute("data-puzzle-type") as PuzzleType | null;

type Choice = { from: "all" | (string | number)[]; deny?: (string | number)[]; topics?: string[] };
const asChoice = (rule: unknown) => (isRule(rule) && "from" in rule ? (rule as Choice) : null);

export default function BackgroundTools() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  useEffect(() => { setActive(new URLSearchParams(window.location.search).has("background-tools")); }, [pathname]);
  if (!active) return null;
  return <BackgroundToolsPanel />;
}

function BackgroundToolsPanel() {
  const s = useBackgroundToolsStore();
  const { config, rules, hidden, locked, minimized, pinned, meta, id, set, setRule } = s;
  const templates = useBackgroundStore((b) => b.templates);
  const [paletteTopic, setPaletteTopic] = useState("All");
  const [tab, setTab] = useState<"svg" | "color" | "adjust">("svg");
  // Each layer opens and shuts on its own - opening one never shuts another, so nothing above a clicked
  // heading changes and it stays where it is. To start with, the layers that are showing are open.
  const [openLayers, setOpenLayers] = useState<Record<LayerName, boolean>>(() => ({ image: !hidden.image, svg: !hidden.svg, pattern: !hidden.pattern }));
  const toggleOpen = (layer: LayerName, open = !openLayers[layer]) => setOpenLayers({ ...openLayers, [layer]: open });
  const [shut, setShut] = useState<Record<string, boolean>>({});
  const [templateNote, setTemplateNote] = useState("");
  const [pickingPuzzles, setPickingPuzzles] = useState(false);
  const pickerRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  // The list filter: null follows the puzzle on screen; ticking a box pins a choice of your own.
  const [filtering, setFiltering] = useState(false);
  const [filterTypes, setFilterTypes] = useState<string[] | null>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const filterDropRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [onScreen, setOnScreen] = useState<PuzzleType | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // A fresh list (the game read it at start; another tab may have saved since) and the quota.
  useEffect(() => {
    useBackgroundStore.getState().load();
    fetch(API).then((r) => r.json()).then((j) => setRemaining(j.remaining)).catch(() => {});
  }, []);

  // The look being edited goes onto the puzzle on screen when it changes - incoming puzzles arrive with
  // their own pick - or, pinned, onto every puzzle. "puzzle" colour stays each puzzle's own.
  useEffect(() => {
    const targetId = document.querySelector(".swiper-slide-active [data-bg-id]")?.getAttribute("data-bg-id") ?? null;
    useBackgroundStore.getState().setPreview({ config: visibleConfig(config, hidden), usePuzzleColor: rules.color === "puzzle", pinned, targetId });
  }, [config, hidden, rules.color, pinned]);
  useEffect(() => () => useBackgroundStore.getState().setPreview(null), []);

  // Which puzzle is on screen, for "this puzzle" and the list filter.
  useEffect(() => {
    const tick = () => setOnScreen(activePuzzleType());
    tick();
    const timer = setInterval(tick, 800);
    return () => clearInterval(timer);
  }, []);

  // The two floating lists: "use on" under its field, the filter under the header button.
  const dropPos = useFloating(pickingPuzzles, () => setPickingPuzzles(false), pickerRef, dropRef, panelRef, "left");
  const filterPos = useFloating(filtering, () => setFiltering(false), filterRef, filterDropRef, panelRef, "right");

  // Q: open the save fields. It never writes on its own - only Save does.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]");
      if (e.key.toLowerCase() !== "q" || typing || e.ctrlKey || e.metaKey || e.altKey) return;
      e.preventDefault();
      s.setMinimized(false);
      setShut((x) => ({ ...x, templates: false }));
      if (!meta.puzzleTypes.length && activePuzzleType()) s.setMeta({ puzzleTypes: [activePuzzleType()!] });
      setTimeout(() => nameRef.current?.focus(), 0);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [meta.puzzleTypes, s]);

  // Thumbnails never change, so they are built once.
  const svgThumbs = useMemo(() => Object.fromEntries(SVG_BACKGROUNDS.map((b) => [b.id, toStyle(svgLayerCss({ svg: b.id }, true))])), []);
  const patternThumbs = useMemo(() => Object.fromEntries(OVERLAY_PATTERNS.map((p) => [p.name, toStyle(patternLayerCss({ pattern: p.name, patternColor: "currentColor" }, true)!)])), []);

  const palettes = PALETTES.filter((p) => paletteTopic === "All" || p.topics.includes(paletteTopic));
  const rollOptions = { palettes: palettes.map((p) => p.id) };

  const shown = visibleConfig(config, hidden);
  const bg = svgById(config.svg);
  const map = colorMapper(config);
  const { baseKey, keys } = bg ? colorsOf(bg) : { baseKey: null, keys: [] as string[] };
  const swatches = [...(baseKey ? [baseKey] : []), ...keys].slice(0, MAX_SWATCHES);
  const hiddenShades = keys.length + (baseKey ? 1 : 0) - swatches.length;
  const palette = PALETTES.find((p) => p.id === config.palette);
  const scalable = !!(bg && tileSizes(bg));
  const off: Record<LayerName, boolean> = { image: hidden.image || !config.image, svg: hidden.svg || !config.svg, pattern: hidden.pattern || !config.pattern };
  const editing = templates.find((d) => d._id === id);
  // The list, filtered by puzzle - by default just the one on screen. "none" is the templates in no pool.
  const filterKeys = filterTypes ?? (onScreen ? [onScreen] : ALL_FILTER_KEYS);
  const filtered = filterKeys.length < ALL_FILTER_KEYS.length;
  const shownTemplates = templates.filter((d) => (d.puzzleTypes.length ? d.puzzleTypes.some((t) => filterKeys.includes(t)) : filterKeys.includes("none")));
  const filterLabel = filterKeys.map((k) => (k === "none" ? "no pool" : PUZZLE_LABEL[k as PuzzleType])).join(", ") || "nothing";
  const toggleFilter = (k: string) => setFilterTypes(filterKeys.includes(k) ? filterKeys.filter((x) => x !== k) : [...filterKeys, k]);

  const say = (text: string) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1600);
  };
  const toggleShut = (key: string) => setShut({ ...shut, [key]: !shut[key] });
  // Switching a layer on is asking to set it up, so it opens - and shuts whichever was open.
  const toggleEye = (layer: LayerName) => {
    if (!config[layer]) set({ [layer]: layer === "svg" ? SVG_BACKGROUNDS[0].id : layer === "pattern" ? OVERLAY_PATTERNS[0].name : IMAGE_BACKGROUNDS[0] });
    const turningOn = off[layer];
    if (turningOn === hidden[layer]) s.toggleHidden(layer);
    if (turningOn) toggleOpen(layer, true);   // switching it off leaves the layout alone
  };

  /* ---- choice rules: a random library draws from the filter, minus what is right-clicked ---- */
  const toggleChoice = (key: "image" | "svg" | "pattern" | "palette", from: Choice["from"], extra: Partial<Choice> = {}) =>
    setRule(key, asChoice(rules[key]) ? undefined : ({ from, ...extra } as ChoiceRule<string>));
  const deny = (key: "image" | "svg" | "pattern" | "palette", value: string | number) => {
    const r = asChoice(rules[key]);
    if (!r) return;
    const list = r.deny?.includes(value) ? r.deny.filter((x) => x !== value) : [...(r.deny || []), value];
    setRule(key, { ...r, deny: list.length ? list : undefined } as ChoiceRule<string>);
  };
  const isDenied = (key: "image" | "svg" | "pattern" | "palette", value: string | number) => !!asChoice(rules[key])?.deny?.includes(value);
  const onPaletteTopic = (t: string) => {
    setPaletteTopic(t);
    const r = asChoice(rules.palette);
    if (r) setRule("palette", { ...r, topics: t === "All" ? undefined : [t] } as ChoiceRule<number>);
  };

  /* ---- templates ---- */
  // A write through the route: keeps the quota in step and puts any refusal in the note. The JSON on
  // success, null when it failed (the note already says why).
  const callApi = async (method: "POST" | "PATCH" | "DELETE", body: object, failed: string) => {
    setSaving(true);
    try {
      const res = await fetch(API, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (typeof json.remaining === "number") setRemaining(json.remaining);
      if (!res.ok) { setTemplateNote(json.error || failed); return null; }
      return json;
    } catch { setTemplateNote("Could not reach the server."); return null; }
    finally { setSaving(false); }
  };
  const save = async () => {
    if (!meta.name.trim()) { setTemplateNote("Name it first."); nameRef.current?.focus(); return; }
    // The loaded template under its own name is an update; any other name is a new template.
    const update = !!editing && meta.name.trim() === editing.name;
    if (update && !s.rev) { setTemplateNote("Reload this template before updating it."); return; }
    const body = { ...meta, template: draftTemplate(s), snapshot: minimalConfig(shown), ...(update ? { id, rev: s.rev } : {}) };
    const json = await callApi(update ? "PATCH" : "POST", body, "Save failed.");
    if (!json) return;
    const doc = fromSanity(json.doc as SanityTemplateDoc);
    if (!doc) { setTemplateNote("Saved, but it came back unreadable - reload."); return; }
    useBackgroundStore.getState().upsert(doc);
    s.saved(doc);
    say(update ? "Template updated" : "Template saved");
    setTemplateNote(`${update ? "Updated" : "Saved"} "${doc.name}" - ${doc.puzzleTypes.length ? `in ${doc.puzzleTypes.map((t) => PUZZLE_LABEL[t]).join(", ")}` : "in no pool yet"}.`);
  };
  // Permanent, so it asks first. What is on screen stays, as an unsaved draft.
  const removeTemplate = async (docId: string) => {
    const doc = templates.find((d) => d._id === docId);
    if (!doc || !window.confirm(`Delete "${doc.name}" from Sanity?\n\nIt leaves every pool it is in, and cannot be undone from here.`)) return;
    if (!(await callApi("DELETE", { id: docId }, "Delete failed."))) return;
    useBackgroundStore.getState().remove(docId);
    if (docId === id) s.forget();
    say("Template deleted");
    setTemplateNote(`Deleted "${doc.name}" - the look stays on screen as an unsaved draft.`);
  };
  const loadTemplate = (docId: string) => {
    const doc = templates.find((d) => d._id === docId);
    if (!doc) return;
    s.load(doc);
    setTemplateNote(`Editing "${doc.name}".`);
  };
  // The "use on" summary: every puzzle, or the first two names and a count.
  const picked = PUZZLE_TYPES.filter((t) => meta.puzzleTypes.includes(t.key)).map((t) => t.label);
  const usedOn = !picked.length ? "nothing - never picked" : picked.length === PUZZLE_TYPES.length ? "every puzzle"
    : picked.length <= 2 ? picked.join(", ") : `${picked.slice(0, 2).join(", ")} +${picked.length - 2}`;
  // Pick exactly as the puzzle on screen would: a weighted pick from its pool, loaded and rolled -
  // or, with an empty pool, the same fully random background the game rolls.
  const pickLikeGame = () => {
    if (!onScreen) return;
    const doc = pickTemplate(templates, onScreen);
    if (doc) { loadTemplate(doc._id); s.rollTemplate(); setTemplateNote(`${PUZZLE_LABEL[onScreen]} picked "${doc.name}".`); }
    else { s.showLook(rollBackground(), onScreen); setTemplateNote(`${PUZZLE_LABEL[onScreen]} has no templates - this is the random background it gets.`); }
  };
  // From scratch: the empty look, unsaved, used on the puzzle on screen.
  const startBlank = () => {
    s.showLook(DEFAULT_CONFIG, onScreen);
    setTemplateNote("New blank template - turn a layer on, then name it and save.");
    nameRef.current?.focus();
  };
  const togglePuzzle = (t: PuzzleType) => s.setMeta({ puzzleTypes: meta.puzzleTypes.includes(t) ? meta.puzzleTypes.filter((x) => x !== t) : [...meta.puzzleTypes, t] });

  // The titlebar is the handle the whole window is dragged by.
  const startDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button") || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect(), dx = e.clientX - rect.left, dy = e.clientY - rect.top;
    const move = (ev: PointerEvent) => setPosition({ x: Math.max(0, Math.min(window.innerWidth - rect.width, ev.clientX - dx)), y: Math.max(0, Math.min(window.innerHeight - 48, ev.clientY - dy)) });
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); panelRef.current?.classList.remove("is-dragging"); };
    panelRef.current.classList.add("is-dragging");
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // Shorthands for the rows: a slider whose value can be fixed or a random range, and a layer's chance.
  const num = (key: keyof BackgroundTemplate & keyof typeof config, label: string, min: number, max: number, step: number, format: (v: number) => string, extra: { disabled?: boolean; title?: string } = {}) => (
    <RuleSlider label={label} min={min} max={max} step={step} format={format} {...extra}
      value={(config[key] as number) ?? 0} onChange={(v) => set({ [key]: v })}
      rule={rules[key] as NumberRule | undefined} onRule={(r) => setRule(key, r as never)} />
  );
  const chance = (layer: LayerName) => {
    const key = `${layer}Chance` as "imageChance" | "svgChance" | "patternChance";
    return <Slider label="chance" min={0} max={1} step={0.05} value={rules[key] ?? 1} format={(v) => `${Math.round(v * 100)}%`}
      title="How often this layer shows when a puzzle uses the template" onChange={(v) => setRule(key, v >= 1 ? undefined : v)} />;
  };
  const randomNote = (key: "image" | "svg" | "pattern") => {
    const r = asChoice(rules[key]);
    return r && <p className="hint">Random from {r.from === "all" ? "all" : `these ${r.from.length}`}{r.deny?.length ? `, minus ${r.deny.length}` : ""} &mdash; <b>right-click</b> a tile to leave it out.</p>;
  };
  const libraryRow = (key: "image" | "pattern", count: string) => (
    <>
      <div className="row"><label>library</label><span /><output>{count}</output>
        <RuleToggle on={!!asChoice(rules[key])} onClick={() => toggleChoice(key, "all")} /></div>
      {randomNote(key)}
    </>
  );

  const layerHead = (layer: LayerName, label: string) => (
    <h4 onClick={(e) => { if (!(e.target as HTMLElement).closest("button")) toggleOpen(layer); }}>
      <button type="button" className="eye-button" aria-pressed={!off[layer]} onClick={() => toggleEye(layer)} title={off[layer] ? "Show this on the puzzles" : "Hide this layer"} />
      <span className={`chev${openLayers[layer] ? "" : " is-closed"}`} />
      <span className="head-label">{label}</span>
      <button type="button" className="icon-button dice" data-mark="randomize" onClick={() => s.rollLayer(layer, rollOptions)} title="Randomize this layer" />
      <button type="button" className="lock-button" aria-pressed={locked[layer]} onClick={() => s.toggleLocked(layer)} title="Lock during randomize" />
    </h4>
  );
  // Open is only ever what you opened: loading a template, or a layer going off, never moves it.
  const isOpen = (layer: LayerName) => openLayers[layer];
  const layerClass = (layer: LayerName) => `layer${off[layer] ? " is-hidden" : ""}${isOpen(layer) ? "" : " is-collapsed"}`;

  return (
    <>
      {/* The studio's two faces - only fetched while the panel is open. */}
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" precedence="default" />

      <div className={`nsc-background-tools${minimized ? " is-minimized" : ""}`}>
        <aside ref={panelRef} className="panel" aria-label="Background tools" style={position ? { left: position.x, top: position.y, right: "auto" } : undefined}>
          <div className="panel-head" onPointerDown={startDrag}>
            <b>Background</b>
            <span className="spacer" />
            <button type="button" className="icon-button" data-mark="pin" aria-pressed={pinned} onClick={() => s.setPinned(!pinned)} title={pinned ? "Pinned: every puzzle shows this look, incoming ones too - click to unpin" : "Unpinned: only the puzzle on screen shows this look; incoming puzzles come as players see them - click to pin"} aria-label="Pin the look to every puzzle" />
            <button type="button" className="icon-button" data-mark="pick" disabled={!onScreen} onClick={pickLikeGame} title={onScreen ? `Pick like the game: what ${PUZZLE_LABEL[onScreen]} would get from its pool` : "Pick like the game - no puzzle on screen"} aria-label="Pick like the game" />
            <button type="button" className="icon-button" data-mark="minus" onClick={() => s.setMinimized(true)} title="Minimize" />
          </div>

          <div className="panel-body">
            <div className="group">
              <h3 className={config.color ? "" : "no-color"} onClick={(e) => { if (!(e.target as HTMLElement).closest("button, label, input, output")) toggleShut("background"); }}>
                <span className={`chev${shut.background ? " is-closed" : ""}`} />
                <span className="head-label">Background</span>
                <input type="range" className="alpha" min={0.1} max={1} step={0.1} value={config.opacity ?? 1} onChange={(e) => set({ opacity: +e.target.value })} title="Opacity of the whole background - the colour and the layers over it" aria-label="Background opacity" />
                <output className="alpha-value">{fmt(config.opacity ?? 1)}</output>
                <label className={`color-button${config.color ? " is-set" : ""}`} style={config.color ? ({ "--swatch": config.color } as React.CSSProperties) : undefined} title="Flat colour under the layers - right-click to clear" onContextMenu={(e) => { e.preventDefault(); set({ color: null }); }}>
                  <input type="color" value={config.color || "#ffffff"} onChange={(e) => set({ color: e.target.value })} aria-label="Flat background colour" />
                </label>
                <button type="button" className="icon-button dice" data-mark="randomize" onClick={() => s.randomize(rollOptions)} title="Randomize every layer" />
                <button type="button" className="icon-button" data-mark="eraser" onClick={() => { s.clear(); setTemplateNote("Cleared - every layer off, every rule fixed."); }} title="Clear all: every layer off, the colour gone, every rule back to fixed" aria-label="Clear all" />
              </h3>

              {!shut.background && (
                <div className="group-body">
                  <div className="row"><label>colour</label>
                    <div className="chips">
                      <label title="The colour in the header, or none"><input type="radio" name="bt-color" checked={rules.color !== "puzzle"} onChange={() => setRule("color", undefined)} />fixed</label>
                      <label title="Each puzzle's own colour - count colour's variant fill. Puzzles with none get no colour."><input type="radio" name="bt-color" checked={rules.color === "puzzle"} onChange={() => setRule("color", "puzzle")} />puzzle</label>
                    </div>
                  </div>

                  <div className={layerClass("image")}>
                    {layerHead("image", "Image")}
                    {isOpen("image") && (
                      <div className="layer-body">
                        {libraryRow("image", `${IMAGE_BACKGROUNDS.length}`)}
                        <div className="tiles image-tiles">
                          {IMAGE_BACKGROUNDS.map((n) => (
                            <button type="button" key={n} aria-pressed={n === config.image} className={isDenied("image", n) ? "is-denied" : ""} onClick={() => set({ image: n })} onContextMenu={(e) => { e.preventDefault(); deny("image", n); }} title={n} aria-label={n}>
                              <Image src={imageUrl(n)} alt="" fill sizes="64px" />
                            </button>
                          ))}
                        </div>
                        {num("imageOpacity", "opacity", 0, 1, 0.05, (v) => v.toFixed(2))}
                        {chance("image")}
                      </div>
                    )}
                  </div>

                  <div className={layerClass("svg")}>
                    {layerHead("svg", "Dynamic SVG")}
                    {isOpen("svg") && (
                      <div className="layer-body">
                        <div className="tabs" role="tablist" aria-label="Dynamic SVG">
                          {(["svg", "color", "adjust"] as const).map((t) => <button type="button" key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>)}
                          {tab === "svg" && <RuleToggle on={!!asChoice(rules.svg)} onClick={() => toggleChoice("svg", "all")} title={asChoice(rules.svg) ? "Random svg each time - click to fix it" : "Fixed svg - click to pick one at random each time"} />}
                        </div>

                        {tab === "svg" && (
                          <div role="tabpanel">
                            {randomNote("svg")}
                            <div className="tiles">
                              {SVG_BACKGROUNDS.map((b) => <button type="button" key={b.id} aria-pressed={b.id === config.svg} className={isDenied("svg", b.id) ? "is-denied" : ""} style={svgThumbs[b.id]} onClick={() => set({ svg: b.id, colors: {}, hue: 0, saturation: 0, lightness: 0, scale: 1, svgRotate: 0, svgZoom: 1 })} onContextMenu={(e) => { e.preventDefault(); deny("svg", b.id); }} title={b.name} aria-label={b.name} />)}
                            </div>
                            {chance("svg")}
                          </div>
                        )}

                        {tab === "color" && (
                          <div role="tabpanel">
                            <div className="row"><label>colours</label><span />
                              <button type="button" className="icon-button" data-mark="undo" onClick={() => set({ palette: null, paletteShift: 0, colors: {} })} title="Back to the original colours" /></div>
                            <div className="swatches">
                              {swatches.map((key) => (
                                <label key={key} className={`swatch${key === baseKey ? " is-base" : ""}${config.colors?.[key] ? " is-edited" : ""}`} style={{ background: `#${map(key)}` }} title={`#${key}`}>
                                  <input type="color" value={`#${map(key)}`} onChange={(e) => set({ colors: { ...config.colors, [key]: e.target.value.slice(1) } })} />
                                </label>
                              ))}
                            </div>
                            {hiddenShades > 0 && <p className="hint"><b>+{hiddenShades}</b> more shades in this gradient &mdash; shift them all with <b>hue / saturation / lightness</b>.</p>}
                            {(asChoice(rules.svg) || asChoice(rules.palette) || rules.paletteShift === "random") && Object.keys(config.colors || {}).length > 0 && <p className="hint">Hand-edited swatches are only kept while the svg, the palette and its order are all fixed.</p>}

                            <div className="row"><label>from set</label><span />
                              <button type="button" className="icon-button" data-mark="randomize" onClick={() => palettes.length && set({ palette: palettes[Math.floor(Math.random() * palettes.length)].id, paletteShift: 0, colors: {} })} title="Random palette" />
                              <button type="button" className="icon-button" data-mark="redo" disabled={!palette} onClick={() => set({ paletteShift: (config.paletteShift || 0) + 1, colors: {} })} title="Rotate which colour goes where" />
                              <RuleToggle on={!!asChoice(rules.palette)} onClick={() => toggleChoice("palette", "all", paletteTopic === "All" ? {} : { topics: [paletteTopic] })} title="Random palette each time - from the topic picked below, minus what is right-clicked" /></div>
                            <div className="row"><label>order</label><span className="inline-check"><input type="checkbox" id="bt-pal-rotate" checked={rules.paletteShift === "random"} onChange={(e) => setRule("paletteShift", e.target.checked ? "random" : undefined)} /><label htmlFor="bt-pal-rotate">random rotation</label></span></div>
                            <div className="chips tags">
                              {PALETTE_TOPICS.map((t) => <label key={t}><input type="radio" name="bt-palette-topic" checked={t === paletteTopic} onChange={() => onPaletteTopic(t)} />{t.toLowerCase()}</label>)}
                            </div>
                            <div className="palette-list">
                              <button type="button" className="is-none" aria-pressed={!palette} onClick={() => set({ palette: null, paletteShift: 0, colors: {} })} title="None - the colours the background was drawn in" />
                              {palettes.map((p) => (
                                <button type="button" key={p.id} aria-pressed={p.id === config.palette} className={isDenied("palette", p.id) ? "is-denied" : ""} onClick={() => set({ palette: p.id, paletteShift: 0, colors: {} })} onContextMenu={(e) => { e.preventDefault(); deny("palette", p.id); }} title={`${p.name} by ${p.by} · ${p.topics.join(", ")}`}>
                                  {p.colors.map((c, i) => <i key={i} style={{ background: `#${c}` }} />)}
                                </button>
                              ))}
                            </div>
                            {asChoice(rules.palette) && <p className="hint">Random from {asChoice(rules.palette)?.topics?.length ? <b>{asChoice(rules.palette)?.topics?.join(", ")}</b> : "all palettes"}{asChoice(rules.palette)?.deny?.length ? `, minus ${asChoice(rules.palette)?.deny?.length}` : ""} &mdash; <b>right-click</b> a palette to leave it out.</p>}
                            {!asChoice(rules.palette) && palette && <p className="hint"><b>{palette.name}</b> by {palette.by} &middot; {palette.topics.join(", ")}</p>}
                          </div>
                        )}

                        {tab === "adjust" && (
                          <div role="tabpanel">
                            <div className="row"><label>adjust</label><span />
                              <button type="button" className="icon-button" data-mark="undo" onClick={() => { set({ hue: 0, saturation: 0, lightness: 0, scale: 1, svgRotate: 0, svgZoom: 1 }); (["hue", "saturation", "lightness", "scale", "svgRotate", "svgZoom"] as const).forEach((k) => setRule(k, undefined)); }} title="Reset hue, saturation, lightness, scale, rotation and zoom" /></div>
                            {num("hue", "hue", -180, 180, 1, signed)}
                            {num("saturation", "saturation", -100, 100, 1, signed)}
                            {num("lightness", "lightness", -50, 50, 1, signed)}
                            {num("scale", "scale", 0.1, 4, 0.05, (v) => `${v.toFixed(2)}×`, { disabled: !scalable, title: scalable ? undefined : "This one is sized to cover the puzzle, so it has no tile to scale - zoom works on it" })}
                            {num("svgRotate", "rotation", 0, 360, 15, (v) => `${v}°`)}
                            {num("svgZoom", "zoom", 1, 4, 0.05, (v) => `${v.toFixed(2)}×`, { title: "Scales the drawing itself, so it works on the gradients that the tiled scale above cannot touch" })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={layerClass("pattern")}>
                    {layerHead("pattern", "Pattern")}
                    {isOpen("pattern") && (
                      <div className="layer-body">
                        {libraryRow("pattern", `${OVERLAY_PATTERNS.length}`)}
                        <div className="pattern-grid">
                          {OVERLAY_PATTERNS.map((p) => <button type="button" key={p.name} aria-pressed={p.name === config.pattern} className={isDenied("pattern", p.name) ? "is-denied" : ""} onClick={() => set({ pattern: p.name })} onContextMenu={(e) => { e.preventDefault(); deny("pattern", p.name); }} title={p.name} aria-label={p.name}><i style={patternThumbs[p.name]} /></button>)}
                        </div>
                        <div className="current-name">{config.pattern}</div>
                        {num("patternScale", "scale", 0.1, 8, 0.1, (v) => `${v.toFixed(1)}×`)}
                        {num("patternOpacity", "opacity", 0, 1, 0.05, (v) => v.toFixed(2))}
                        <div className="row"><label>colour</label><input type="color" value={config.patternColor || "#000000"} onChange={(e) => set({ patternColor: e.target.value })} /><span /></div>
                        {num("patternRotate", "rotation", 0, 360, 15, (v) => `${v}°`)}
                        {chance("pattern")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="group">
              <h3 onClick={(e) => { if (!(e.target as HTMLElement).closest("button")) toggleShut("templates"); }}>
                <span className={`chev${shut.templates ? " is-closed" : ""}`} />
                <span className="head-label is-fixed">Templates</span>
                <button ref={filterRef} type="button" className="icon-button" data-mark="filter" aria-pressed={filtered} aria-expanded={filtering} onClick={() => setFiltering(!filtering)} title={`Showing ${filtered ? filterLabel : "every template"}${filterTypes ? "" : " - follows the puzzle on screen"}`} aria-label="Filter templates" />
              </h3>
              {filtering && (
                <div ref={filterDropRef} className="puzzle-list" style={filterPos ?? { visibility: "hidden" }}>
                  {PUZZLE_TYPES.map((t) => (
                    <label key={t.key} className={t.key === onScreen ? "is-on-screen" : ""} title={t.key === onScreen ? "On screen now" : undefined}>
                      <input type="checkbox" checked={filterKeys.includes(t.key)} onChange={() => toggleFilter(t.key)} />{t.label.toLowerCase()}
                    </label>
                  ))}
                  <label><input type="checkbox" checked={filterKeys.includes("none")} onChange={() => toggleFilter("none")} />in no pool</label>
                  <span className="puzzle-section">
                    <button type="button" onClick={() => setFilterTypes(ALL_FILTER_KEYS)}>all</button>
                    <button type="button" onClick={() => setFilterTypes([])}>none</button>
                    <button type="button" aria-pressed={!filterTypes} onClick={() => setFilterTypes(null)} title="Follow the puzzle on screen">this one</button>
                  </span>
                </div>
              )}
              {!shut.templates && (
                <div className="group-body">
                  <div className="template-list">
                    {/* Always first, whatever the filter: an empty draft to build from. Selected while nothing is loaded. */}
                    <div className={`template-row is-new${id ? "" : " is-selected"}`}>
                      <button type="button" className="row-load" aria-pressed={!id} onClick={startBlank} title="Start a template from scratch - every layer off, no colour, every rule fixed">
                        <span className="name">new blank template…</span>
                      </button>
                    </div>
                    {shownTemplates.map((d) => (
                      // A row, not one button: the selected one also carries its trashcan, and a button cannot hold another.
                      <div key={d._id} className={`template-row${d.enabled ? "" : " is-off"}${d._id === id ? " is-selected" : ""}`}>
                        <button type="button" className="row-load" aria-pressed={d._id === id} onClick={() => loadTemplate(d._id)} title={`Load "${d.name}"${d.enabled ? "" : " - disabled, never picked"}`}>
                          <span className="name">{d.name}</span>
                        </button>
                        {d._id === id && <button type="button" className="row-delete" data-mark="trash" disabled={saving} onClick={() => removeTemplate(d._id)} title={`Delete "${d.name}" from Sanity`} aria-label={`Delete ${d.name}`} />}
                        <span className="meta">{d.enabled ? `×${d.weight}` : "off"}</span>
                      </div>
                    ))}
                    {!templates.length && <p className="template-empty">No templates yet - make a look and press Q.</p>}
                    {!!templates.length && !shownTemplates.length && <p className="template-empty">None for {filterLabel}{filterTypes ? "" : " - it gets a random background"}.</p>}
                  </div>

                  <div className="row"><label>name</label>
                    <input type="checkbox" className="enabled-check" checked={meta.enabled} onChange={(e) => s.setMeta({ enabled: e.target.checked })} title={meta.enabled ? "Enabled - the game picks it. Untick to keep it but never pick it." : "Disabled - kept, but never picked. Tick to put it back in its pools."} aria-label="Enabled" />
                    <span className="name-field">
                      <input ref={nameRef} type="text" placeholder={id ? "name" : "new template"} spellCheck={false} value={meta.name} onChange={(e) => s.setMeta({ name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") save(); }} />
                      <button type="button" className="icon-button" data-mark="randomize" onClick={() => { s.setMeta({ name: generateName(templates.map((d) => d.name)) }); nameRef.current?.focus(); }} title="Generate a name - colour-trait-animal" aria-label="Generate a name" />
                    </span>
                    <button type="button" className="icon-button" data-mark="save" disabled={saving} onClick={save} title={editing && meta.name.trim() === editing.name ? `Update "${editing.name}" in Sanity` : editing ? `Save as a new template - "${editing.name}" stays as it is` : "Save as a new template in Sanity"} aria-label={editing && meta.name.trim() === editing.name ? "Update template" : "Save as new template"} />
                  </div>
                  <div className="row"><label>use on</label>
                    <button ref={pickerRef} type="button" className={`puzzle-picker${pickingPuzzles ? " is-open" : ""}`} aria-expanded={pickingPuzzles} onClick={() => setPickingPuzzles(!pickingPuzzles)} title="The puzzles whose pools this template joins, and its weight there">
                      <span>{usedOn}</span>
                    </button>
                    <button type="button" className="icon-button" data-mark="randomize" onClick={s.rollTemplate} title="Sample: roll the random props - what a puzzle could get from this template" aria-label="Sample the template" />
                  </div>
                  {/* Floats over the panel: placed against the window frame rather than the scrolling body, so it
                      neither pushes the rows below it down nor gets clipped at the edge of the body. */}
                  {pickingPuzzles && (
                    <div ref={dropRef} className="puzzle-list" style={dropPos ?? { visibility: "hidden" }}>
                      {PUZZLE_TYPES.map((t) => (
                        <label key={t.key} className={t.key === onScreen ? "is-on-screen" : ""} title={t.key === onScreen ? "On screen now" : undefined}>
                          <input type="checkbox" checked={meta.puzzleTypes.includes(t.key)} onChange={() => togglePuzzle(t.key)} />{t.label.toLowerCase()}
                        </label>
                      ))}
                      <span className="puzzle-section">
                        <label htmlFor="bt-weight">weight</label>
                        <input id="bt-weight" type="number" className="short" min={0} max={100} step={1} value={meta.weight} onChange={(e) => s.setMeta({ weight: Math.max(0, Math.min(100, +e.target.value || 0)) })} title="How often it is picked against the others in a pool - 1 by default, 2 is twice as often" />
                      </span>
                      <span className="puzzle-section">
                        <button type="button" onClick={() => s.setMeta({ puzzleTypes: PUZZLE_TYPES.map((t) => t.key) })}>all</button>
                        <button type="button" onClick={() => s.setMeta({ puzzleTypes: [] })}>none</button>
                        <button type="button" disabled={!onScreen} onClick={() => onScreen && s.setMeta({ puzzleTypes: [onScreen] })} title="Only the puzzle on screen">this one</button>
                      </span>
                    </div>
                  )}
                  <p className="hint">
                    {templateNote || (editing ? `Editing "${editing.name}".` : "New template - Q jumps here.")}
                    {remaining !== null && <> &middot; <b>{remaining}</b> saves left this hour</>}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {minimized && <button type="button" className="panel-show" data-mark="plus" onClick={() => s.setMinimized(false)}>Maximize background panel</button>}
        <div className={`toast${toast ? " is-shown" : ""}`} role="status" aria-live="polite">{toast}</div>
      </div>
    </>
  );
}

// A list that floats under its button - or over it when the window has no room below - placed against
// the panel frame, so it covers the rows below instead of pushing them down and is not clipped by the
// scrolling body. Measured hidden first, then shown in the same frame; it closes on a click elsewhere,
// Esc, or a scroll that would leave it behind its button. `align` is which edge it lines up with.
function useFloating(open: boolean, close: () => void, anchor: React.RefObject<HTMLElement | null>, drop: React.RefObject<HTMLElement | null>, panel: React.RefObject<HTMLElement | null>, align: "left" | "right") {
  const [pos, setPos] = useState<React.CSSProperties | null>(null);
  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const frame = panel.current?.getBoundingClientRect(), at = anchor.current?.getBoundingClientRect(), h = drop.current?.offsetHeight ?? 0;
    if (!frame || !at) return;
    const border = 2, below = at.bottom + h <= window.innerHeight - 8;
    setPos({
      ...(align === "left" ? { left: at.left - frame.left - border } : { right: frame.right - at.right - border }),
      minWidth: at.width,
      ...(below ? { top: at.bottom - frame.top - border - 1 } : { bottom: frame.bottom - at.top - border - 1 }),
    });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { const n = e.target as Node; if (!drop.current?.contains(n) && !anchor.current?.contains(n)) close(); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    const scrolled = (e: Event) => { if (!drop.current?.contains(e.target as Node)) close(); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    document.addEventListener("scroll", scrolled, true);
    return () => { document.removeEventListener("pointerdown", away); document.removeEventListener("keydown", esc); document.removeEventListener("scroll", scrolled, true); };
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return pos;
}

// The fixed / random switch at the end of a row.
function RuleToggle({ on, onClick, title }: { on: boolean; onClick: () => void; title?: string }) {
  return <button type="button" className="rule-button" data-mark="randomize" aria-pressed={on} onClick={onClick} title={title || (on ? "Random each time - click to fix it" : "Fixed - click to make it random each time")} />;
}

function Slider({ label, min, max, step, value, onChange, format, disabled = false, title }: { label: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void; format: (v: number) => string; disabled?: boolean; title?: string }) {
  return (
    <div className={`row${disabled ? " is-disabled" : ""}`} title={title}>
      <label>{label}</label>
      <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(e) => onChange(+e.target.value)} />
      <output>{format(value)}</output>
    </div>
  );
}

// A slider that can instead be a random range: toggled on, it becomes min and max.
function RuleSlider({ rule, onRule, ...props }: Parameters<typeof Slider>[0] & { rule: NumberRule | undefined; onRule: (rule: NumberRule | undefined) => void }) {
  const range = isRule(rule) ? (rule as { range: [number, number] }).range : null;
  const toggle = () => onRule(range ? undefined : { range: [props.min, props.max], step: props.step });
  if (!range) return (
    <div className={`row${props.disabled ? " is-disabled" : ""}`} title={props.title}>
      <label>{props.label}</label>
      <input type="range" min={props.min} max={props.max} step={props.step} value={props.value} disabled={props.disabled} onChange={(e) => props.onChange(+e.target.value)} />
      <output>{props.format(props.value)}</output>
      <RuleToggle on={false} onClick={toggle} />
    </div>
  );
  const setEnd = (i: 0 | 1, v: number) => {
    const next: [number, number] = [...range] as [number, number];
    next[i] = Math.max(props.min, Math.min(props.max, v));
    if (next[0] > next[1]) next[i === 0 ? 1 : 0] = next[i];
    onRule({ range: next, step: props.step });
  };
  return (
    <div className="row is-random" title={props.title}>
      <label>{props.label}</label>
      <span className="range-inputs">
        <input type="number" min={props.min} max={props.max} step={props.step} value={range[0]} onChange={(e) => setEnd(0, +e.target.value)} aria-label={`${props.label} from`} />
        <i>to</i>
        <input type="number" min={props.min} max={props.max} step={props.step} value={range[1]} onChange={(e) => setEnd(1, +e.target.value)} aria-label={`${props.label} to`} />
      </span>
      <RuleToggle on onClick={toggle} />
    </div>
  );
}
