import React, { useState } from "react";
import useFitText from "use-fit-text";
import { resgisterAnswer } from "../utils/game-controller";

export default function Answer({ text, className, isDisabled = false, onClick = () => {}, children }: { text?: string; className: string; isDisabled?: boolean; onClick?: () => void; children?: React.ReactNode }) {
  
  const { fontSize, ref: innerTextRef } = text !== "" ? useFitText({ minFontSize: 100, maxFontSize: 200 }) : { fontSize: undefined, ref: undefined };

  const [disabled, setDisabled] = useState(isDisabled);
  const [pressed, setPressed] = useState(false);
  const isCorrectAnswer = className.toLowerCase().includes("correct-answer");

  var cssClass_disabled :string = disabled ? "disabled " : "";
  var cssClass_pressed :string = disabled ? "pressed " : "";

  return (
  <div className={`answer button margin-0-auto ${className} ${cssClass_disabled} ${cssClass_pressed}`} 
    onClick={(e) => {
    onClick(); 
    setDisabled(true);
    setPressed(true);
    resgisterAnswer(isCorrectAnswer);

    }}
    ref={innerTextRef} 
    style={text ? { fontSize } : undefined} // only applyes useFitText() if there is text
    >
    {text}
    {children}

    <div className="answer-icon answer-icon-correct svg-icon-ok"></div>
    <div className="answer-icon answer-icon-wrong svg-icon-cancel"></div>
  </div>
  );
}
