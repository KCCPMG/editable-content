"use client"
import React, { useRef, useState, useEffect } from "react";
import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, selectionHasTextNodes, getSelectionChildNodes } from '@/utils/utils';
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

  useEffect(() => {
    // placeholder, likely unnecessary
  }, [hasSelection])

  useEffect(() => {
    // populate div with html and update state
    if (contentRef.current) {
      if (initialHTML) {
        contentRef.current.innerHTML = initialHTML;
      } else {
        contentRef.current.innerHTML = "";
      }   
      setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
    }
    
    // assign event listeners
    document.addEventListener('selectionchange', handleSelectionChange);
    contentRef?.current?.addEventListener("contentChange", updateContent)


    // teardown
    return () => {
      document.removeEventListener('selectionchange', updateSelection);
      contentRef?.current?.removeEventListener("contentChange", updateContent);
    }

  }, [])

  /**
   * if changes need to be made to selection, make those changes, 
   * otherwise update selection pieces of state
   */
  function handleSelectionChange() {
    const selection = window.getSelection();
    if (selection && 
      contentRef.current && 
      // selection?.anchorNode == contentRef.current && 
      // selection?.focusNode == contentRef.current
      selection?.anchorNode?.nodeType !== Node.TEXT_NODE &&
      selection?.focusNode?.nodeType !== Node.TEXT_NODE
    ) {
      if (selectionHasTextNodes(selection, contentRef.current)) {
        resetSelectionToTextNodes();
      } else {
        const textNode = document.createTextNode('\u200B');
        contentRef.current.append(textNode);
        const range = selection.getRangeAt(0);
        range.setStart(textNode, 0);
        range.setEnd(textNode, textNode.length);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    else {
      updateSelection();
    } 
  }

  function updateSelection() {
    const gotSelection = window.getSelection();

    // if selection is within contentRef.current or IS contentRef.current
    if (
      gotSelection && 
      contentRef.current && 
      (selectionIsDescendentOfNode(gotSelection, contentRef.current) || 
        (
          gotSelection.anchorNode === contentRef.current &&
          gotSelection.focusNode === contentRef.current
        ))
    ) {
      setSelectionToString(gotSelection.toString());
      setSelectionAnchorNode(gotSelection.anchorNode);
      setSelectionAnchorOffset(gotSelection.anchorOffset);
      setSelectionFocusNode(gotSelection.focusNode);
      setSelectionFocusOffset(gotSelection.focusOffset);
    } else {
      setSelectionToString("");
    }
  }


  function updateContent() {
    setContentRefCurrentInnerHTML(contentRef?.current?.innerHTML || "");
    contentRef.current?.focus();
  }


  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div>
        {
          editTextButtons.map(etb => {
            const query = generateQuery(etb.wrapperArgs);
            const selection = window.getSelection();

            if (hasSelection && selection) {
              const {anchorNode, focusNode, anchorOffset, focusOffset} = selection;
  
              if (
                anchorNode == contentRef.current && 
                focusNode == contentRef.current &&
                anchorOffset == 0 && 
                focusOffset == 0
              ) {
                const thisRange = selection.getRangeAt(0);
                thisRange.insertNode(document.createTextNode(""));   
                selection.removeAllRanges();
                selection.addRange(thisRange);
              }
            }

            const selected = selection ? 
              hasSelection && selectionIsCoveredBy(selection, query, contentRef.current!): false; 
              // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient

            if (etb.wrapperArgs.unbreakable) {
              if (selection && contentRef.current) {
                const childNodes = getSelectionChildNodes(selection, contentRef.current);
              }
            }

            return ( 
              <EditTextButton
                {...etb}
                key={etb.dataKey}
                disabled={!hasSelection}
                onMouseDown={(e: Event) => {e.preventDefault();}}
                selected={selected}
                onClick={
                  (e: Event) => {
                    e.preventDefault();
                    if (selection) {

                      if (selected) {
                        unwrapSelectionFromQuery(selection, query, contentRef.current!) // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
                        contentRef.current?.dispatchEvent(contentChange);
                      } else {
                        const wrapper = createWrapper(etb.wrapperArgs, document);
                        wrapInElement(selection, wrapper, contentRef.current!);
                        contentRef.current?.dispatchEvent(contentChange);
                      }

                    }
                    // if no selection, no click handler
                  }
                }
              />
            )
          })
        }
      </div>
      <div
        contentEditable
        onFocus={() => {
          setHasSelection(true);
        }}
        onBlur={() => setHasSelection(false)}
        onKeyDown={(e) => {
          if (e.code === "Enter") {
            e.preventDefault();
            const selection = window.getSelection(); 
            if (hasSelection && selection) {
              const range = selection.getRangeAt(0);
              range.extractContents();
              
              const br = document.createElement("br");
              const textNode = document.createTextNode('\u200B');
              range.insertNode(textNode);
              range.insertNode(br);
              
              range.setStart(textNode, 0);
              range.setEnd(textNode, textNode.length);
              
              selection.removeAllRanges();
              selection.addRange(range);
            }

          }
        }}
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
