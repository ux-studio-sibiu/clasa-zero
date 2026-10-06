import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_CONFIG, rollImage, rollPattern, rollSvg, type PatternBackgroundConfig, type RollOptions } from "../pattern-background/engine";
import { LAYERS, draftFromTemplate, resolveTemplate, templateFromDraft, type BackgroundTemplate, type LayerName, type PuzzleType, type TemplateDoc, type TemplateMeta } from "../pattern-background/templates";

// State of the ?background-tools panel: the template being edited. `config` is the look on screen,
// `rules` the props that are not fixed (in template form), `meta` how it is filed, and `id`/`rev`
// which Sanity document it came from. The draft is kept in this browser so a reload loses nothing.

const LAYER_ROLLS = { image: rollImage, svg: rollSvg, pattern: rollPattern };
const NEW_META: TemplateMeta = { name: "", puzzleTypes: [], weight: 1, enabled: true };
export type DraftSource = "blank" | "current" | null;

interface BackgroundToolsState {
  config: PatternBackgroundConfig;
  rules: Partial<BackgroundTemplate>;
  hidden: Record<LayerName, boolean>;   // the layer eyes
  locked: Record<LayerName, boolean>;   // held through a re-roll
  meta: TemplateMeta;
  id: string | null;
  // Where an unsaved draft came from, for the list's two top rows: an empty look, or the puzzle on screen.
  source: DraftSource;
  rev: string | null;
  minimized: boolean;
  pinned: boolean;   // the edited look on every puzzle, incoming ones too - off by default
  set: (patch: PatternBackgroundConfig) => void;
  setRule: <K extends keyof BackgroundTemplate>(key: K, rule: BackgroundTemplate[K] | undefined) => void;
  randomize: (options: RollOptions) => void;
  rollLayer: (layer: LayerName, options: RollOptions) => void;
  rollTemplate: () => void;
  load: (doc: TemplateDoc) => void;
  showLook: (config: PatternBackgroundConfig, type: PuzzleType | null, source?: DraftSource) => void;
  saved: (doc: TemplateDoc) => void;
  forget: () => void;
  setMeta: (patch: Partial<TemplateMeta>) => void;
  clear: () => void;
  toggleHidden: (layer: LayerName) => void;
  toggleLocked: (layer: LayerName) => void;
  setMinimized: (minimized: boolean) => void;
  setPinned: (pinned: boolean) => void;
}

// What the puzzles see and what a save stores: a layer whose eye is off is left out.
export const visibleConfig = (config: PatternBackgroundConfig, hidden: Record<LayerName, boolean>): PatternBackgroundConfig =>
  ({ ...config, ...Object.fromEntries(LAYERS.map((l) => [l, hidden[l] ? null : config[l]])) });

export const draftTemplate = (s: Pick<BackgroundToolsState, "config" | "hidden" | "rules">) => templateFromDraft(visibleConfig(s.config, s.hidden), s.rules);

const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export const useBackgroundToolsStore = create<BackgroundToolsState>()(
  persist(
    (set, get) => ({
      config: { ...DEFAULT_CONFIG, ...rollSvg() },
      rules: {},
      hidden: { image: true, svg: false, pattern: true },
      locked: { image: false, svg: false, pattern: false },
      meta: NEW_META,
      id: null,
      source: null,
      rev: null,
      minimized: false,
      pinned: false,
      set: (patch) => set({ config: { ...get().config, ...patch } }),
      setRule: (key, rule) => {
        const rules = { ...get().rules };
        if (rule === undefined) delete rules[key]; else rules[key] = rule;
        set({ rules });
      },

      // The free roll, as in the texture kit: one base layer - image, svg or pattern - is picked and
      // rolled, and the others go off. A locked layer that is showing IS the base, so the unlocked ones go off.
      randomize: (options) => {
        const { locked, hidden, config } = get();
        const free = LAYERS.filter((l) => !locked[l]);
        const next = { ...config }, nextHidden = { ...hidden };
        if (LAYERS.some((l) => locked[l] && !hidden[l])) free.forEach((l) => { nextHidden[l] = true; });
        else if (free.length) {
          const base = pick(free);
          free.forEach((l) => { nextHidden[l] = l !== base; });
          Object.assign(next, LAYER_ROLLS[base](options));
        }
        set({ config: next, hidden: nextHidden });
      },
      // A layer's own dice: what it is, not whether it shows.
      rollLayer: (layer, options) => set({ config: { ...get().config, ...LAYER_ROLLS[layer](options) } }),
      // A sample of the template being edited - what a puzzle could get from it. Fixed props stay put.
      rollTemplate: () => {
        const s = get(), t = draftTemplate(s);
        const sample = resolveTemplate(t, { puzzleColor: s.config.color });
        // Keep layer settings for layers the sample left out (a chance below 1), so the next roll has them.
        const config = { ...s.config, ...sample, ...Object.fromEntries(LAYERS.filter((l) => !sample[l]).map((l) => [l, s.config[l]])) };
        set({ config, hidden: Object.fromEntries(LAYERS.map((l) => [l, s.hidden[l] || !sample[l]])) as Record<LayerName, boolean> });
      },

      load: (doc) => {
        const { config, rules } = draftFromTemplate(doc.template, doc.snapshot);
        set({
          config, rules, id: doc._id, rev: doc._rev ?? null, source: null,
          meta: { name: doc.name, puzzleTypes: doc.puzzleTypes, weight: doc.weight, enabled: doc.enabled },
          hidden: Object.fromEntries(LAYERS.map((l) => [l, doc.template[l] == null])) as Record<LayerName, boolean>,
        });
      },
      // A concrete look that is not a template, as a new unsaved draft: an empty one, a puzzle's own
      // background, or what an empty pool rolls.
      showLook: (config, type, source = null) => set({
        config: { ...DEFAULT_CONFIG, ...config }, rules: {}, id: null, rev: null, source,
        meta: { ...NEW_META, puzzleTypes: type ? [type] : [] },
        hidden: Object.fromEntries(LAYERS.map((l) => [l, !config[l]])) as Record<LayerName, boolean>,
      }),
      saved: (doc) => set({ id: doc._id, rev: doc._rev ?? null, meta: { name: doc.name, puzzleTypes: doc.puzzleTypes, weight: doc.weight, enabled: doc.enabled } }),
      // The template being edited was deleted: what is on screen stays, as a new unsaved draft.
      forget: () => set({ id: null, rev: null }),
      setMeta: (patch) => set({ meta: { ...get().meta, ...patch } }),
      clear: () => set({ config: { ...get().config, color: null, opacity: 1 }, rules: {}, hidden: { image: true, svg: true, pattern: true } }),

      toggleHidden: (layer) => set({ hidden: { ...get().hidden, [layer]: !get().hidden[layer] } }),
      toggleLocked: (layer) => set({ locked: { ...get().locked, [layer]: !get().locked[layer] } }),
      setMinimized: (minimized) => set({ minimized }),
      setPinned: (pinned) => set({ pinned }),
    }),
    // v2: presets dropped, templates and the image layer added - an older draft is not carried over.
    { name: "background-tools", version: 2, migrate: () => ({}) as BackgroundToolsState, storage: createJSONStorage(() => localStorage) }
  )
);
