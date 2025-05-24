"use client"
import React, { useRef, useState, useEffect, forwardRef, MutableRefObject } from "react";
import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery } from '@/utils/utils';
import { EditableContentProps } from "./ContentEditableExperimentComponents";
import EditTextButton from "./ContentEditableExperimentComponents/EditTextButton";
import ControlTextButton from "./ContentEditableExperimentComponents/ControlTextButton";

const contentChange = new CustomEvent("contentChange");


export default function EditableContent({initialHTML, editTextButtons}: EditableContentProps) {

  const contentRef = useRef<null | HTMLDivElement>(null);
  const [contentRefCurrentInnerHTML, setContentRefCurrentInnerHTML] = useState<string>("");
  const [selectionToString, setSelectionToString] = useState<string>("");
  const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<Number | null>(null);
  const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  const [selectionFocusOffset, setSelectionFocusOffset] = useState<Number | null>(null);
  const [hasSelection, setHasSelection] = useState<boolean>(false);



  function updateSelection() {
    const gotSelection = window.getSelection();

    console.log({
      gotSelection : Boolean(gotSelection), 
      contentRefCurrent: Boolean(contentRef.current), 
      selectionIsDescendentOfNode: gotSelection && contentRef.current && selectionIsDescendentOfNode(gotSelection, contentRef.current)
    });

    if (gotSelection && contentRef.current && selectionIsDescendentOfNode(gotSelection, contentRef.current)) {
      setSelectionToString(gotSelection.toString());
      setSelectionAnchorNode(gotSelection.anchorNode);
      setSelectionAnchorOffset(gotSelection.anchorOffset);
      setSelectionFocusNode(gotSelection.focusNode);
      setSelectionFocusOffset(gotSelection.focusOffset);
      setHasSelection(true);
    } else {
      setSelectionToString("");
      setHasSelection(false);
    }
  }


  function updateContent() {
    setContentRefCurrentInnerHTML(contentRef?.current?.innerHTML || "");
    console.log("content change");
  }

  useEffect(() => {

    if (contentRef.current && initialHTML) {
      contentRef.current.innerHTML = initialHTML;

      setContentRefCurrentInnerHTML(contentRef.current.innerHTML);

      contentRef.current.addEventListener("contentChange", updateContent)
    }

    document.addEventListener('selectionchange', updateSelection);

    return () => {
      document.removeEventListener('selectionchange', updateSelection);
      contentRef?.current?.removeEventListener("contentChange", updateContent);
    }

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
            const selected = selection ? selectionIsCoveredBy(selection, query, contentRef.current!): false; // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient

            // console.log(JSON.stringify({selected, selection, query}));

            return ( 
              <EditTextButton
                {...etb}
                key={etb.dataKey}
                disabled={!hasSelection}
                // selectionChildNodes
                onClick={
                  selected ? 
                    () => {
                      if (selection) {
                        unwrapSelectionFromQuery(selection, query, contentRef.current!) // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
                        updateSelection();
                        contentRef.current?.dispatchEvent(contentChange);
                      }
                    } :
                    () => {
                      if (selection) {
                        const wrapper = createWrapper(etb.wrapperArgs, document);
                        wrapInElement(selection, wrapper, contentRef.current!);
                        updateSelection();
                        contentRef.current?.dispatchEvent(contentChange);
                      } 

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
        {contentRef.current && 
          <ControlTextButton 
            refDiv={contentRef.current}
            callback={function(div) {
              div.innerHTML = "";
            }}
          />
        }
      </div>
      <div>
        <p>
          <span>Selection: </span>
          {selectionToString}
        </p>
      </div>
      <div>
        <p>
          <span>ContentRef.current Inner HTML: </span>
          {contentRefCurrentInnerHTML}
        </p>
      </div>
    </>
  )
}
