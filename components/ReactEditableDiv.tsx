"use client";
import { useState, useRef, KeyboardEvent, FC, ReactElement } from 'react';


type ReactEditableDivProps = {
  initialContent: string | Array<ReactElement<typeof ReactParagraph>>
}

export function ReactEditableDiv({initialContent}: ReactEditableDivProps) {

  const [paragraphs, setParagraphs] = useState<Array<ReactElement<typeof ReactParagraph>>>(
    typeof initialContent === "string" ? 
    [<ReactParagraph initialContent={initialContent} />] :
    initialContent

  );

  return (
    <div 
      style={{
        width: "100%",
        height: "150px",
        margin: "auto",
        border: "2px solid black",
      }}
    >
      {paragraphs.map(p => p)}
    </div>
  )

}



type ReactParagraphProps = {
  initialContent?: string | ReactElement<typeof ReactSpan>
}

export function ReactParagraph({initialContent} : ReactParagraphProps) {
  // stub

  const [contentType, setContentType] = useState<"string" | "ReactSpan">(
    typeof initialContent === ("string" || undefined) ? "string" : "ReactSpan"
  )

  const [content, setContent] = useState<string | ReactElement<typeof ReactSpan>>(initialContent || "");


  return (
    <p
      style={{
        margin: "0"
      }}
    >
      {content}
    </p>
  )
}


type ReactSpanProps = {
  initialContent: string | ReactElement<typeof ReactSpan>
}

export function ReactSpan({initialContent}: ReactSpanProps) {

  const [contentType, setContentType] = useState<"string" | "ReactSpan">(
    typeof initialContent === "string" ? "string" : "ReactSpan"
  )

  const [content, setContent] = useState<string | ReactElement<typeof ReactSpan>>(initialContent);

  return (
    <span>{content}</span>
  )
}