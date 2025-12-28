import { create } from "zustand";

interface GameStoreState {
  gameLength: number;
  answeredCount: number;
}

export const useGameStore = create<GameStoreState>(() => ({
  gameLength: 5, // 0 = infinite
  answeredCount: 0,
}));