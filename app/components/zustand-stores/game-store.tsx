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
    showCorrectAnswer: boolean,

    questionWeight_Add: number,
    questionWeight_CountColor: number,
    questionWeight_Pairs: number,
    questionWeight_Question_Sanity: number,
    questionWeight_Question_Scale_1: number,
    questionWeight_Question_Series_Shape: number,
    questionWeight_Question_Series: number,
    questionWeight_Question_Shape: number,
    questionWeight_Question_Weekdays: number,
    
  }, 
  settingsPossibleValues:{
    timer: number[];
    showCorrectAnswer: boolean[],

    questionWeight_Add: number[],
    questionWeight_CountColor: number[],
    questionWeight_Pairs: number[],
    questionWeight_Question_Sanity: number[],
    questionWeight_Question_Scale_1: number[],
    questionWeight_Question_Series_Shape: number[],
    questionWeight_Question_Series: number[],
    questionWeight_Question_Shape: number[],
    questionWeight_Question_Weekdays: number[],

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
        showCorrectAnswer: false,

        questionWeight_Add: 1,
        questionWeight_CountColor: 1,
        questionWeight_Pairs: 1,
        questionWeight_Question_Sanity: 1,
        questionWeight_Question_Scale_1: 1,
        questionWeight_Question_Series_Shape: 1,
        questionWeight_Question_Series: 1,
        questionWeight_Question_Shape: 1,
        questionWeight_Question_Weekdays: 1,
      },
      settingsPossibleValues: {
        timer: [0, 5, 30, 60, 120, 180], // seconds
        showCorrectAnswer: [false, true],

        questionWeight_Add: [1,0],
        questionWeight_CountColor: [1,0],
        questionWeight_Pairs: [1,0],
        questionWeight_Question_Sanity: [1,0],
        questionWeight_Question_Scale_1: [1,0],
        questionWeight_Question_Series_Shape: [1,0],
        questionWeight_Question_Series: [1,0],
        questionWeight_Question_Shape: [1,0],
        questionWeight_Question_Weekdays: [1,0],
      },

      changeSetting: (key) =>
        set((state) => {
          const values = state.settingsPossibleValues[key] as (number | boolean)[];
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
          showCorrectAnswer: state.settings.showCorrectAnswer,

           questionWeight_Add: state.settings.questionWeight_Add,
           questionWeight_CountColor: state.settings.questionWeight_CountColor,
           questionWeight_Pairs: state.settings.questionWeight_Pairs,
           questionWeight_Question_Sanity: state.settings.questionWeight_Question_Sanity,
           questionWeight_Question_Scale_1: state.settings.questionWeight_Question_Scale_1,
           questionWeight_Question_Series_Shape: state.settings.questionWeight_Question_Series_Shape,
           questionWeight_Question_Series: state.settings.questionWeight_Question_Series,
           questionWeight_Question_Shape: state.settings.questionWeight_Question_Shape,
           questionWeight_Question_Weekdays: state.settings.questionWeight_Question_Weekdays,
        }
      }),
    }
  )
);