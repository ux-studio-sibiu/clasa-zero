import { create } from "zustand";
import client from "@/sanity/sanity.client";
import type { PatternBackgroundConfig } from "../pattern-background/engine";
import { TEMPLATE_QUERY, fromSanity, pickBackground, type PuzzleType, type SanityTemplateDoc, type TemplateDoc } from "../pattern-background/templates";

// The puzzles' backgrounds: every template, read from Sanity once when the game starts, and the
// pick a puzzle makes from its pool. The ?background-tools panel writes templates back through
// /api/background-templates and patches this list, so the running game sees a save straight away.
interface BackgroundStoreState {
  templates: TemplateDoc[];
  // While the panel is open: the look being edited. Pinned, every puzzle shows it; unpinned, only the
  // puzzle whose background has `targetId` - the one on screen when the look last changed.
  preview: { config: PatternBackgroundConfig; usePuzzleColor: boolean; pinned: boolean; targetId: string | null } | null;
  // The first puzzle background of a game, by its id - its random roll leaves the jpg out, so the
  // first screen never waits on a photo. Reset when a game starts.
  firstBgId: string | null;
  load: (newGame?: boolean) => Promise<void>;
  pick: (type: PuzzleType, bgId: string, puzzleColor?: string | null) => PatternBackgroundConfig;
  upsert: (doc: TemplateDoc) => void;
  remove: (id: string) => void;
  setPreview: (preview: BackgroundStoreState["preview"]) => void;
}

export const useBackgroundStore = create<BackgroundStoreState>((set, get) => ({
  templates: [],
  preview: null,
  firstBgId: null,
  // A failed read leaves every pool empty, which is still a game: each puzzle rolls a random background.
  load: async (newGame = false) => {
    if (newGame) set({ firstBgId: null });
    try {
      const docs = await client.fetch<SanityTemplateDoc[]>(TEMPLATE_QUERY);
      set({ templates: docs.map(fromSanity).filter((d): d is TemplateDoc => !!d) });
    } catch (e) { console.warn("background templates not loaded", e); }
  },
  // Claimed by id rather than counted: in development React runs a puzzle's setup twice, with the same id.
  pick: (type, bgId, puzzleColor) => {
    if (!get().firstBgId) set({ firstBgId: bgId });
    return pickBackground(get().templates, type, { puzzleColor, noImage: get().firstBgId === bgId });
  },
  upsert: (doc) => {
    const others = get().templates.filter((d) => d._id !== doc._id);
    set({ templates: [...others, doc].sort((a, b) => a.name.localeCompare(b.name)) });
  },
  remove: (id) => set({ templates: get().templates.filter((d) => d._id !== id) }),
  setPreview: (preview) => set({ preview }),
}));
