"use client"
import React, { useRef } from "react";

export default function ContentEditableExperiment() {

  const myRef = useRef<null | HTMLDivElement>(null);

  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div
        ref={myRef}
        style={{
          width: "100%",
          height: "150px",
          margin: "auto",
          border: "2px solid black",
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            console.log("tab!");
            console.log({e});
            console.log({myRef});
            if (myRef.current) {
              console.log({selection: window.getSelection()});
              myRef.current!.textContent += "tab"
            }
            
          }
          console.log("key down", {text: myRef.current?.innerText})
        }}
        // onKeyDownCapture={(e) => console.log("key down capture", {text: myRef.current?.innerText})}
        // onKeyUp={(e) => console.log("key up", {text: myRef.current?.innerText})}
        // onKeyUpCapture={(e) => console.log("key up capture", {text: myRef.current?.innerText})}
        // onChange={(e) => console.log("keydown", {text: myRef.current?.innerText})}
        // onChangeCapture={(e) => console.log("keydown", {text: myRef.current?.innerText})}
        // onInput={(e) => console.log("input", {text: myRef.current?.innerText})}
        // onInputCapture={(e) => console.log("input capture", {text: myRef.current?.innerText})}

        contentEditable
      >

      </div>
    </>
  )
}