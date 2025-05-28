"use client"
import React, { useRef, useState, useEffect, forwardRef, MutableRefObject } from "react";
import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, selectionHasTextNodes } from '@/utils/utils';
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
    // console.log("hasSelection:", hasSelection);
    // console.log("hasSelection useEffect, now calling updateSelection", {hasSelection, selection: window.getSelection()})
    // updateSelection();
  }, [hasSelection])

  useEffect(() => {
    if (contentRef.current && initialHTML) {
        if (initialHTML) {
          contentRef.current.innerHTML = initialHTML;
        } else {
          contentRef.current.innerHTML = "";
        } 
        
        setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
        contentRef.current.addEventListener("contentChange", updateContent)
    }

    document.addEventListener('selectionchange', handleSelectionChange);
    // contentRef?.current?.addEventListener('onfocus', () => {setHasSelection(true)})
    // contentRef?.current?.addEventListener('onblur', () => {setHasSelection(false)})

    return () => {
      document.removeEventListener('selectionchange', updateSelection);
      contentRef?.current?.removeEventListener("contentChange", updateContent);
    }

  }, [])


  function handleSelectionChange() {
    // if changes need to be made to selection, make those changes, otherwise update selection pieces of state
    const selection = window.getSelection();
    if (selection && contentRef.current && selection?.anchorNode == contentRef.current && selection?.focusNode == contentRef.current) {
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
    // console.log("inside of updateSelection")
    const gotSelection = window.getSelection();
    // console.log(gotSelection);

    // console.log({
    //   gotSelection : Boolean(gotSelection), 
    //   contentRefCurrent: Boolean(contentRef.current), 
    //   selectionIsDescendentOfNode: gotSelection && contentRef.current && selectionIsDescendentOfNode(gotSelection, contentRef.current)
    // });

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
      // console.log("ok");
      // console.log(contentRef.current.childNodes);
      // if (contentRef.current.childNodes.length === 0) {
      //   console.log("repopulate");
      //   contentRef.current.append(document.createTextNode(""));
      // }
      // if (
      //   gotSelection.anchorNode?.nodeType !== Node.TEXT_NODE ||
      //   gotSelection.focusNode?.nodeType !== Node.TEXT_NODE
      // ) {
      //   resetSelectionToTextNodes();
      //   console.log("Reset Selection: ", gotSelection);
      // }
      setSelectionToString(gotSelection.toString());
      setSelectionAnchorNode(gotSelection.anchorNode);
      setSelectionAnchorOffset(gotSelection.anchorOffset);
      setSelectionFocusNode(gotSelection.focusNode);
      setSelectionFocusOffset(gotSelection.focusOffset);
      // setHasSelection(true);
    } else {
      console.log("not ok");
      setSelectionToString("");
      // setHasSelection(false);
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
            // console.log("should re-render button");
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

            const selected = selection ? hasSelection && selectionIsCoveredBy(selection, query, contentRef.current!): false; // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
            
            // console.log({selection, query, selected})

            // console.log(JSON.stringify({selected, selection, query}));

            return ( 
              <EditTextButton
                {...etb}
                key={etb.dataKey}
                disabled={!hasSelection}
                // selectionChildNodes
                onMouseDown={(e: Event) => {e.preventDefault();}}
                selected={selected}
                onClick={
                  (e: Event) => {
                    e.preventDefault();
                    if (selection) {

                      console.log({selection, selected})

                      if (selected) {
                        unwrapSelectionFromQuery(selection, query, contentRef.current!) // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
                        // console.log("calling updateSelection from within selected click handler");
                        // updateSelection();
                        contentRef.current?.dispatchEvent(contentChange);
                      } else {
                        const wrapper = createWrapper(etb.wrapperArgs, document);
                        // console.log({wrapper, selection});
                        wrapInElement(selection, wrapper, contentRef.current!);
                        console.log(contentRef.current?.innerHTML);
                        // console.log({selection});
                        console.log("calling updateSelection from within deselected click handler");
                        // updateSelection();
                        console.log({selection});
                        contentRef.current?.dispatchEvent(contentChange);
                      }

                    }
                    // else null
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
          // updateSelection();
        }}
        onBlur={() => setHasSelection(false)}
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
