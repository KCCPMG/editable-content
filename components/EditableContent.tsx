"use client"
import React, { useRef, useState, useEffect, forwardRef, MutableRefObject } from "react";
import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionCoveredBy, createWrapper, unwrapSelectionFromQuery } from '@/utils/utils';
import { EditableContentProps } from "./ContentEditableExperimentComponents";
import EditTextButton from "./ContentEditableExperimentComponents/EditTextButton";



export default function EditableContent({initialHTML, editTextButtons}: EditableContentProps) {

  const contentRef = useRef<null | HTMLDivElement>(null);
  const [contentRefState, setContentRefState] = useState<MutableRefObject<null | HTMLDivElement> | null>(null);
  const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<Number | null>(null)
  const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  const [selectionFocusOffset, setSelectionFocusOffset] = useState<Number | null>(null)
  const [selectionToString, setSelectionToString] = useState<string>("")


  useEffect(() => {

    if (contentRef.current && initialHTML) {
      setContentRefState(contentRef)
      contentRef.current.innerHTML = initialHTML;
    }


    document.addEventListener('selectionchange', function(e) {
      const gotSelection = window.getSelection();

      console.log(
        Boolean(gotSelection), 
        Boolean(contentRef.current), 
        gotSelection && contentRef.current && selectionIsDescendentOfNode(gotSelection, contentRef.current)
      );

      if (gotSelection && contentRef.current && selectionIsDescendentOfNode(gotSelection, contentRef.current)) {
        setSelectionAnchorNode(gotSelection.anchorNode);
        setSelectionAnchorOffset(gotSelection.anchorOffset);
        setSelectionFocusNode(gotSelection.focusNode);
        setSelectionFocusOffset(gotSelection.focusOffset);
        setSelectionToString(gotSelection.toString());
      } else {
        setSelectionAnchorNode(null);
        setSelectionAnchorOffset(null);
        setSelectionFocusNode(null);
        setSelectionFocusOffset(null);
        setSelectionToString("");
      }
    })
  }, [])


  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div>
        {
          
          contentRef.current ? editTextButtons.map(etb => {
            console.log("should re-render button");
            const query = generateQuery(etb.wrapperArgs);
            const selection = window.getSelection();
            const selected = selection ? selectionCoveredBy(selection, query, contentRef.current!): false; // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient

            console.log(JSON.stringify({selected, selection, query}));

            return ( 
              <EditTextButton
                {...etb}
                key={etb.dataKey}
                onClick={
                  selected ? 
                    () => {
                      if (selection) unwrapSelectionFromQuery(selection, query, contentRef.current!) // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
                    } :
                    () => {
                      const wrapper = createWrapper(etb.wrapperArgs, document);
                      
                      if (selection) wrapInElement(selection, wrapper);
                    }
                }
                selected={selected}

              />
            )
          }): [] 
        }
      </div>
      <div
        contentEditable
        ref={contentRef}
        style={{
          width: "100%",
          height: "150px",
          margin: "auto",
          border: "2px solid black",
        }}
      >
      
      </div>
      <div>
        <p>Selection:</p>
        {selectionToString}
      </div>
    </>
  )
}
