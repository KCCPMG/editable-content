"use client";
import { useState, useRef, KeyboardEvent } from 'react';


type ReactDynamicTextareaProps = {
  startingSpanProps?: Array<ReactSpanProps>
}


export default function ReactDynamicTextarea({startingSpanProps} : ReactDynamicTextareaProps) {

  const divRef = useRef<HTMLDivElement | null>(null);

  const [spanProps, setSpanProps] = useState<Array<ReactSpanProps>>(startingSpanProps || [ {text: "Bleeberblab blooberblub"}, {text: "\n"}, {text: "new line please"} ]);

  const [cursorPosition, setCursorPosition] = useState(spanProps.reduce((textSum, sp) => {return sp.text.length + textSum}, 0));


  const refFocus = () => {
    if (divRef.current) {
      divRef.current.focus();
    } 
  }

  // function handleChange(e: KeyboardEvent) {

  //   switch (e.key) {
  //     case "ArrowDown":
  //       setCursorPosition(text.length);
  //       break;
  //     case "ArrowUp":
  //       setCursorPosition(0);
  //       break;
  //     case "ArrowLeft":
  //       setCursorPosition(Math.max(cursorPosition - 1, 0));
  //       break;
  //     case "ArrowRight":
  //       setCursorPosition(Math.min(cursorPosition + 1, text.length));
  //       break;
  //     case "Enter":
  //       updateText("<br />");
  //       break;
  //     case " ":
  //       updateText(" ");
  //       break;
  //     case "Escape":
  //       // Do nothing
  //       break;
  //     case "Backspace":
  //       if (cursorPosition === 0) break;
  //       setText(text.slice(0, cursorPosition -1) + text.slice(cursorPosition));
  //       setCursorPosition(cursorPosition - 1);
  //       break;
  //     default:
  //       updateText(e.key);
  //       return; // Quit when this 
  //   }

  // }

  // function updateText(char: string) {
  //   setText(text.slice(0,cursorPosition) + char + text.slice(cursorPosition));
  //   setCursorPosition(cursorPosition + 1);
  // }

  return (
    <div
      ref={divRef}
      tabIndex={0}
      style={{
        border: "2px solid",
        margin: "15px",
        padding: "2px"
      }}
      onClick={() => {
        // console.log("clicked");
        refFocus();
      }}
      onFocus={(e) => {
        // console.log("focused!");
      }}
      // onKeyDown={handleChange}
    >
      <p>Hello /n <br/> \n Hello</p>
      {spanProps.map(sp => {
        return <ReactSpan {...sp} />
      })}
    </div>
  )

}


type ReactSpanProps = {
  text: string
}


function ReactSpan({text} : ReactSpanProps) {

  return (
    <span>
      {text}
    </span>
  )
}