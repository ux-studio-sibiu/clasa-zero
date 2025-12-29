import { create } from "zustand";

interface GameStoreState {
  gameLength: number;
  lives: number;
  questionsCount: number;
  answeredCount: number;
  gameOver: boolean;
}

export const useGameStore = create<GameStoreState>(() => ({
  gameLength: 5, // 0 = infinite
  lives: 3,
  questionsCount: 1,
  answeredCount: 0,
  gameOver: false,
}));