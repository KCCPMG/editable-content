"use client";
import { useState, useEffect } from "react";

export default function EditableDiv() {

  const [text, setText] = useState("Edit me");

  function updateText(input: string) {
    setText(input.toUpperCase())
  }



  useEffect(() => {
    console.log(document);
    console.log(text)
  }, [text])

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
        suppressContentEditableWarning={true}
        onKeyDown={(e) => console.log("key down")}
        onKeyDownCapture={(e) => console.log("key down capture")}
        onKeyUp={(e) => console.log("key up")}
        onKeyUpCapture={(e) => console.log("key up capture")}
        onChange={(e) => console.log("keydown")}
        onChangeCapture={(e) => console.log("keydown")}
        onInput={(e) => console.log("input")}
        onInputCapture={(e) => console.log("input capture")}
        // onInput={(e: React.ChangeEvent<HTMLInputElement>) => {
        //   // e.preventDefault();
        //   setText(e.target.innerText);

        //   console.log(e);
        //   console.log(e.target.innerText);
        //   // console.log(text);
        //   // const target = e.target as {innerText: string};
        //   // updateText(e.target.innerText);
        // }}
      >
        {text}
      </div>
    </div>
  )
}