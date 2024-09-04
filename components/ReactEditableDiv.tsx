"use client";
import { useState, useRef, KeyboardEvent, FC, ReactElement } from 'react';


type ReactEditableDivProps = {
  initialContent: string | typeof ReactParagraph
}



type ReactParagraphProps = {
  initialContent: string | ReactElement<typeof ReactSpan>
}

export function ReactParagraph({initialContent} : ReactParagraphProps) {
  // stub

  const [contentType, setContentType] = useState<"string" | "ReactSpan">(
    typeof initialContent === "string" ? "string" : "ReactSpan"
  )

  const [content, setContent] = useState<string | ReactElement<typeof ReactSpan>>(initialContent);


  return (
    <p>{content}</p>
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