import React, { useState } from "react";
import useFitText from "use-fit-text";


export default function Answer({ text, className, isDisabled = false, onClick }: { text: string; className: string; isDisabled?: boolean; onClick: () => void }) {
  
  const { fontSize, ref: innerTextRef } = useFitText({ minFontSize: 100, maxFontSize: 200, });

  const [disabled, setDisabled] = useState(isDisabled);
  var cssClass_disabled :string = disabled ? "disabled " : "";

  return (
    <div className={`answer button style-2 margin-0-auto ${className} ${cssClass_disabled}`} 
      onClick={() => {onClick(); setDisabled(true);}}
      ref={innerTextRef} 
      style={{ fontSize }}>
      {text}

      <div className="answer-icon answer-icon-correct svg-icon-ok"></div>
      <div className="answer-icon answer-icon-wrong svg-icon-cancel"></div>
    </div>
  );
}
