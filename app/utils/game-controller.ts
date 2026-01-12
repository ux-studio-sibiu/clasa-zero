
//game-controller.ts

import { useSwiperStore } from "../components/zustand-stores/swiper-store";
import { useGameStore } from "../components/zustand-stores/game-store";


export function startGame() {
  const { addSlide, addPreloadSlide} = useSwiperStore.getState();
  addSlide(); 
  addSlide(); 
  addPreloadSlide();
}

export function continueGame() {
  const { addSlide, addPreloadSlide, unlockNext, goToNext } = useSwiperStore.getState();
  addSlide();
  addPreloadSlide();
  // unlockNext();
  setTimeout(() => {goToNext();}, 100);
}

export function endGame() {
  const { addEndSlide, unlockNext, goToNext } = useSwiperStore.getState();
  useGameStore.setState({ gameOver: true });
  addEndSlide();
  // unlockNext();
  setTimeout(goToNext, 100);
}

export function resgisterAnswer(isAnswerCorrect?: boolean) {
  const { questionsCount, gameLength } = useGameStore.getState();
  let { lives } = useGameStore.getState();

  // wrong answer case
  if (!isAnswerCorrect) {
    useGameStore.setState({ lives: lives - 1 });
    lives = useGameStore.getState().lives; // Read the updated value of lives
    if (lives == 0) { endGame(); return; }
    return
  }

  // end game: no more lives
  if (lives == 0) { endGame(); return; }
  
  // end game: reached last question
  if (questionsCount >= gameLength && gameLength != 0) { endGame(); return; }

  continueGame();
}
function addPreloadSlide() {
  throw new Error("Function not implemented.");
}

