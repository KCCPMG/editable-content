"use client"
import React, { useRef } from "react";

export default function ContentEditableExperiment() {

  const myRef = useRef<null | HTMLDivElement>(null);

  function handleBold() {
    console.log("Bold");
    console.log(window.getSelection());


    const selection = window.getSelection();
    
    // Check if the selection is within the specific div
    if (myRef.current && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (myRef.current.contains(range.startContainer) || myRef.current.contains(range.endContainer)) {
            // Get the selected text
            const selectedText = selection.toString();
            range.surroundContents(document.createElement('strong'));

        } 
    }
  }

  function handleItalics() {
    console.log("Italics");
    console.log(window.getSelection());

    const selection = window.getSelection();
    
    // Check if the selection is within the specific div
    if (myRef.current && selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (myRef.current.contains(range.startContainer) || myRef.current.contains(range.endContainer)) {
          // Get the selected text
          const selectedText = selection.toString();
          range.surroundContents(document.createElement('i'));

      } 
    }
  }

  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div>
        <button onClick={handleBold}><strong>B</strong></button>
        <button onClick={handleItalics}><i>I</i></button>
      </div>
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
      <p>This text should not change</p>
    </>
  )
}