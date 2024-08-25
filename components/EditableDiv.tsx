"use client";
import { SyntheticEvent, useState } from "react";

export default function EditableDiv() {

  const [text, setText] = useState("Edit me")

  function updateText(input: string) {
    setText(input.toUpperCase())
  }

  return (
    <div 
      contentEditable 
      onInput={(e: SyntheticEvent) => {
        console.log(e);
        console.log(e.target.innerText);
        // updateText(e.target.innerText);
      }}
    >
      {text}
    </div>
  )
}