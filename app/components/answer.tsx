import React, { useState } from "react";
import useFitText from "use-fit-text";
import { resgisterAnswer } from "../utils/game-controller";

export default function Answer({ text, className, isDisabled = false, onClick = () => {}, children }: { text?: string; className: string; isDisabled?: boolean; onClick?: () => void; children?: React.ReactNode }) {
  
  const { fontSize, ref: innerTextRef } = useFitText({ minFontSize: 100, maxFontSize: 200, });

  const [disabled, setDisabled] = useState(isDisabled);
  const isCorrectAnswer = className.toLowerCase().includes("correct-answer");

  var cssClass_disabled :string = disabled ? "disabled " : "";

  return (
  <div className={`answer button style-2x margin-0-auto ${className} ${cssClass_disabled}`} 
    onClick={(e) => {
    onClick(); 
    setDisabled(true);
    resgisterAnswer(isCorrectAnswer);

    }}
    ref={innerTextRef} 
    style={{ fontSize }}>
    {text}
    {children}

    <div className="answer-icon answer-icon-correct svg-icon-ok"></div>
    <div className="answer-icon answer-icon-wrong svg-icon-cancel"></div>
  </div>
  );
}
