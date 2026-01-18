import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GameStoreState {
  gameLength: number;
  lives: number;
  questionsCount: number;
  answeredCount: number;
  gameOver: boolean;
  timeLeft: number;

  settings: {
    timer: number;
    
  }, 
  settingsPossibleValues:{
    timer: number[];

  }

  changeSetting: <K extends keyof GameStoreState["settings"]>(key: K) => void;
  startTimer: () => void;
}

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      gameLength: 0, // 0 = infinite
      lives: 3,
      questionsCount: 1,
      answeredCount: 0,
      gameOver: false,
      timeLeft: 0,

      settings: {
        timer: 0,
      },
      settingsPossibleValues: {
        timer: [0, 5, 30, 60, 120, 180], // seconds
      },

      changeSetting: (key) =>
        set((state) => {
          const values = state.settingsPossibleValues[key];
          const currentValue = state.settings[key];
          if (!Array.isArray(values)) return {};
          const currentIdx = values.indexOf(currentValue);
          const nextIdx = (currentIdx + 1) % values.length;
            return { settings: { ...state.settings, [key]: values[nextIdx] } };
        }),

      startTimer: () => {
        const timer = get().settings.timer;
        set({ timeLeft: timer });
      }

    }),
    {
      name: "game-store", // name of the item in the storage (must be unique)
      partialize: (state) => ({
        settings: {
          timer: state.settings.timer,
        }
      }),
    }
  )
);