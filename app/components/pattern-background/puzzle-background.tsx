"use client";

import { useId, useState } from "react";
import PatternBackground from "./pattern-background";
import { useBackgroundStore } from "../zustand-stores/background-store";
import type { PuzzleType } from "./templates";

// A puzzle's background: one pick from its pool, made once when the puzzle mounts. Drop it where the
// puzzle draws its background; `color` is what a template's "puzzle" colour resolves to.
//   <PuzzleBackground type="count-color" color={variant.backgroundFillColor} />
export default function PuzzleBackground({ type, color }: { type: PuzzleType; color?: string | null }) {
  const bgId = useId();
  const [config] = useState(() => useBackgroundStore.getState().pick(type, bgId, color));
  const preview = useBackgroundStore((s) => s.preview);
  const previewed = preview && (preview.pinned || preview.targetId === bgId);
  const shown = previewed ? { ...preview.config, ...(preview.usePuzzleColor ? { color: color ?? null } : {}) } : config;
  return (
    <div className="nsc-puzzle-background" data-puzzle-type={type} data-bg-id={bgId}>
      <PatternBackground {...shown} />
    </div>
  );
}
