import { useEffect, useRef, useState } from "react";
import { useGameStore } from "./../components/zustand-stores/game-store";

export function useGameTimer(gameActive: boolean) {
  const timerSeconds = useGameStore((s) => s.timeLeft);
  const [remaining, setRemaining] = useState(timerSeconds);

  const intervalRef = useRef<number | null>(null);

  // 1️⃣ Start / reset timer
  useEffect(() => {
    if (!gameActive || timerSeconds === 0) return;

    setRemaining(timerSeconds);

    intervalRef.current = window.setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameActive, timerSeconds]);

  // 2️⃣ React to timer reaching zero
  useEffect(() => {
    if (remaining === 0 && gameActive) {
      clearInterval(intervalRef.current!);
      useGameStore.setState({ gameOver: true });
    }
  }, [remaining, gameActive]);

  return remaining;
}