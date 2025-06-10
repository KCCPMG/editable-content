"use client"
import { useState } from "react"

export default function PureReactDiv() {

  const [content, setContent] = useState("");

  return (
    <div
      style={{
        height: "100px",
        width: "500px",
        border: "1px solid black"
      }}
      tabIndex={1}
      onKeyDown={(e) => {
        e.preventDefault();
        // console.log(e);
        const specialCharactersObj: {
          [key: string]: Function
        } = {
          "Tab": function() {
            setContent(content + "    ")
          }
        }
        if (specialCharactersObj[e.key]) {
          specialCharactersObj[e.key]()
        } 
        if (!specialCharactersObj[e.key]) {
          setContent(content + e.key);
        }
      }}
      onChange={(e) => {console.log(e)}}
      onPaste={(e) => console.log(e)}
    >
      {content}
    </div>
  )
}