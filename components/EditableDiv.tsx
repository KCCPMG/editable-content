"use client";
import { useState } from "react";

export default function EditableDiv() {

  const [text, setText] = useState("Edit me")

  function updateText(input: string) {
    setText(input.toUpperCase())
  }

  return (
    <div style={{
      width: 500,
      margin: "auto",
      marginTop: 60
    }}>
      <h1>Editable Div</h1>
      <div
        contentEditable
        style={{
          border: "1px solid black",
        }}
        onInput={(e: React.ChangeEvent<HTMLInputElement>) => {

          console.log(e);
          console.log(e.target.innerText);
          // const target = e.target as {innerText: string};
          // updateText(e.target.innerText);
        }}
      >
        {/* {text} */}
      </div>
    </div>
  )
}