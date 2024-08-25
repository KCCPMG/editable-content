"use client";
import { useState, useRef, KeyboardEvent } from 'react';


export default function ReactDynamicTextarea() {

  const divRef = useRef<HTMLDivElement | null>(null);

  const [text, setText] = useState("Blabberblob blooberblub");

  const [cursorPosition, setCursorPosition] = useState(text.length);


  const refFocus = () => {
    if (divRef.current) {
      divRef.current.focus();
    } 
  }

  function handleChange(e: KeyboardEvent) {

    switch (e.key) {
      case "ArrowDown":
        setCursorPosition(text.length);
        break;
      case "ArrowUp":
        setCursorPosition(0);
        break;
      case "ArrowLeft":
        setCursorPosition(Math.max(cursorPosition - 1, 0));
        break;
      case "ArrowRight":
        setCursorPosition(Math.min(cursorPosition + 1, text.length));
        break;
      case "Enter":
        updateText("<br />");
        break;
      case " ":
        updateText(" ");
        break;
      case "Escape":
        // Do nothing
        break;
      case "Backspace":
        if (cursorPosition === 0) break;
        setText(text.slice(0, cursorPosition -1) + text.slice(cursorPosition));
        setCursorPosition(cursorPosition - 1);
        break;
      default:
        updateText(e.key);
        return; // Quit when this 
    }

  }

  function updateText(char: string) {
    setText(text.slice(0,cursorPosition) + char + text.slice(cursorPosition));
    setCursorPosition(cursorPosition + 1);
  }

  return (
    <div
      ref={divRef}
      tabIndex={0}
      style={{
        border: "2px solid red",
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
      onKeyDown={handleChange}
    >
      <p>Hello /n <br/> \n Hello</p>
      {text}
    </div>
  )

}