"use client"
import React, { useRef, useState, useEffect, MouseEventHandler, isValidElement, ReactElement } from "react";
import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes } from '@/utils/utils';
import { EditableContentProps } from "./ContentEditableExperimentComponents";
import EditTextButton from "./ContentEditableExperimentComponents/EditTextButton";
import ControlTextButton from "./ContentEditableExperimentComponents/ControlTextButton";
import { createRoot, Root } from "react-dom/client";
import { Button } from "@mui/material";
import { renderToString } from "react-dom/server";
import { WrapperArgs } from "./ContentEditableExperimentComponents";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from 'uuid';

const contentChange = new CustomEvent("contentChange");


(window as any).wrapInElement = wrapInElement;
(window as any).selectionIsDescendentOfNode = selectionIsDescendentOfNode;
(window as any).generateQuery = generateQuery;
(window as any).selectionIsCoveredBy = selectionIsCoveredBy;
(window as any).createWrapper = createWrapper;
(window as any).unwrapSelectionFromQuery = unwrapSelectionFromQuery;
(window as any).resetSelectionToTextNodes = resetSelectionToTextNodes;
(window as any).selectionHasTextNodes = selectionHasTextNodes;
(window as any).getSelectionChildNodes = getSelectionChildNodes;
(window as any).selectionContainsOnlyText = selectionContainsOnlyText;
(window as any).getButtonStatus = getButtonStatus;
(window as any).getRangeLowestAncestorElement = getRangeLowestAncestorElement;
(window as any).promoteChildrenOfNode = promoteChildrenOfNode;
(window as any).deleteEmptyElements = deleteEmptyElements;
(window as any).setSelection = setSelection;
(window as any).moveSelection = moveSelection;
(window as any).getRangeChildNodes = getRangeChildNodes;
(window as any).limitingContainer = document.querySelector("[contenteditable]");



export default function EditableContent({initialHTML, editTextButtons}: EditableContentProps) {

  const contentRef = useRef<null | HTMLDivElement>(null);
  const [contentRefCurrentInnerHTML, setContentRefCurrentInnerHTML] = useState<string>("");
  const [selectionToString, setSelectionToString] = useState<string>("");
  const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<Number | null>(null);
  const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  const [selectionFocusOffset, setSelectionFocusOffset] = useState<Number | null>(null);
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [portals, setPortals] = useState<Array<React.ReactPortal>>([])

  // useEffect(() => {
  //   // placeholder, likely unnecessary
  //   console.log({hasSelection});
  // }, [hasSelection])

  // on render
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
    document.addEventListener('selectionchange', (e) => {
      const selection = window.getSelection();
      if (!selection || 
        !contentRef.current ||
        !selectionIsDescendentOfNode(selection, contentRef.current)
      ) {
        console.log("selection not in div")
        updateSelection();
      }
      else {
        handleSelectionChange();
      } 
    })

    contentRef?.current?.addEventListener("contentChange", updateContent)

    // teardown
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      contentRef?.current?.removeEventListener("contentChange", updateContent);
    }

  }, [])


  useEffect(() => {
    updateContent();
  }, [portals])
  /**
   * if changes need to be made to selection, make those changes, 
   * otherwise update selection pieces of state
   */
  function handleSelectionChange() {
    const selection = window.getSelection();
    if (selection && 
      contentRef.current && 
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
    console.log("updateContent");
    setContentRefCurrentInnerHTML(contentRef?.current?.innerHTML || "");
    contentRef.current?.focus();
  }

  // createRoot approach - causes browser warning and may not be workable for easy insertion
  // const rootRef = useRef<null |  Root>(null);
  // const domNodeRef = useRef<null | HTMLDivElement>(null);
  // domNodeRef.current = document.createElement('div');
  // rootRef.current = createRoot(document.createElement('div'));
  // const sampleComponent = rootRef.current.render(
  //   <SampleButton />
  // )


  // Alternate approach
  const SampleButton = function() {
    return (
      <Button
        onClick={(e) => {console.log("clicked")}}
      >
        Click me and something happens
      </Button>
    )
  }

  const sampleButtonHTMLString = renderToString(<SampleButton />);
  const sampleButton = new DOMParser().parseFromString(sampleButtonHTMLString, "text/html").body.children[0];
  // console.log({sampleButton});

  function reactNodeToElement(reactNode: ReactNode) {
    const stringified = renderToString(reactNode);
    const parsedElement = new DOMParser().parseFromString(stringified, "text/html").body.children[0];
    return parsedElement;
  }

  function elementToWrapperArgs(rn: ReactNode): WrapperArgs {

    const element = reactNodeToElement(rn);

    let mappedAttributes: {[key: string] : string | undefined} = {}

    for (let attr of Array.from(element.attributes)) {
      const attrName = attr.name;
      const attrValue = attr.value;

      mappedAttributes[attrName] = mappedAttributes[attrValue]
    }
    
    // set all react elements to unbreakable, might change this later
    const wrapperArgs = {
      element: element.tagName,
      classList: element.className.split(" "),
      id: element.getAttribute('id') || undefined,
      attributes: mappedAttributes,
      // unbreakable: true
      // eventListeners: getEventListeners(element)      
    };

    return wrapperArgs;
  }

  function createContentPortal(component: ReactElement) {
    const uuid = uuidv4();
    const id = "portal-container-"+uuid;
    const newDiv = document.createElement("div");
    newDiv.setAttribute('id', id);
    newDiv.style.display = "inline";

    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const text = range?.toString();
    const contents = range?.extractContents();
    range?.insertNode(newDiv);
    
    const foundNewDiv = contentRef?.current?.querySelector(`#${id}`)
    
    // curently only handling range text, not nested elements
    if (contentRef.current && contentRef.current && foundNewDiv) {
      const clone = React.cloneElement(component, {}, text);
      const portal = createPortal(clone, foundNewDiv)
      setPortals([...portals, portal]);
    }
  }


  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div>
        {
          editTextButtons.map(etb => {

            const {dataKey, selectCallback, deselectCallback, wrapperInstructions, contentPortal, ...otherProps} = etb;

            // if (isValidElement(wrapperInstructions)) wrapperInstructions.unbreakable = true;

            // if React Element, derive wrapper args from Element, else use what's given
            const wrapperArgs = isValidElement(wrapperInstructions) ?
              elementToWrapperArgs(wrapperInstructions) : // placeholder
              wrapperInstructions;

            console.log({dataKey, wrapperInstructions, wrapperArgs})

            const query = generateQuery(wrapperArgs);
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
    
            const status = getButtonStatus(selection, wrapperArgs.unbreakable, query, contentRef.current)
            
            if (!hasSelection) {
              status.enabled = false;
              status.selected = false;
            }
            const {selected, enabled} = status;

            return ( 
              <EditTextButton
                {...otherProps}
                wrapperArgs
                key={dataKey}
                disabled={!enabled}
                onMouseDown={(e: Event) => {e.preventDefault();}}
                selected={selected}
                onClick={
                  () => {
                    if (selection) {         
                      if (selected) {
                        if (wrapperArgs.unbreakable) {
                          const range = selection.getRangeAt(0);
                          const element = getRangeLowestAncestorElement(range);
                          if (element) {
                            
                            const childNodes = Array.from(element.childNodes);
                            
                            const startNodeIndex = childNodes.findIndex(cn => cn === range.startContainer);
                            const startNodeOffset = range.startOffset;
                            const endNodeIndex = childNodes.findIndex(cn => cn === range.endContainer);
                            const endNodeOffset = range.endOffset;
                            
                            const parentNode = element.parentNode;
                            
                            for (let i=0; i<childNodes.length; i++) {
                              console.log(i, element, childNodes[i])
                              parentNode?.insertBefore(childNodes[i], element);
                              
                              if (i === startNodeIndex) {
                                range.setStart(childNodes[i], startNodeOffset);
                              }
                              
                              if (i === endNodeIndex) {
                                range.setEnd(childNodes[i], endNodeOffset);
                              }
                            }
                            
                            parentNode?.removeChild(element);
                            
                            contentRef.current?.dispatchEvent(contentChange);
                            resetSelectionToTextNodes();
                          }
                  
                        } else {
                          unwrapSelectionFromQuery(selection, query, contentRef.current!) // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
                          contentRef.current?.dispatchEvent(contentChange);
                        }
                        
                        if (deselectCallback) {
                          deselectCallback();
                        } 
                      } else {
                        if (contentPortal) {
                          createContentPortal(wrapperInstructions);
                        
                        } else {
                          const wrapper = createWrapper(wrapperArgs, document);
                          wrapInElement(selection, wrapper, contentRef.current!);
                          contentRef.current?.dispatchEvent(contentChange);
                          if (selectCallback) {
                            selectCallback(wrapper);
                          } 
                        }
                        
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
        spellCheck={false}
        onInput={updateContent}
        onFocus={() => {
          setHasSelection(true);
        }}
        onBlur={() => {
          // console.log("blurring contenteditable")
          setHasSelection(false)
        }}
        onKeyDown={(e) => {
          const selection = window.getSelection(); 
          if (!selection || selection.rangeCount === 0 || !contentRef.current) return;
          const range = selection.getRangeAt(0);

          if (e.code === "Enter") {
            e.preventDefault();
            range.extractContents();
            
            const br = document.createElement("br");
            const textNode = document.createTextNode('\u200B');
            range.insertNode(textNode);
            range.insertNode(br);
            
            range.setStart(textNode, 0);
            range.setEnd(textNode, textNode.length);
            
            selection.removeAllRanges();
            selection.addRange(range);  
            contentRef.current?.dispatchEvent(contentChange);   
          }

          if (e.code === "Space") { 
            e.preventDefault();
            const spaceNode = document.createTextNode("\u0020\u200B");
            range.extractContents();
            range.insertNode(spaceNode);
            range.setStartAfter(spaceNode);
            range.collapse();
            selection.removeAllRanges();
            selection.addRange(range);
            contentRef.current?.dispatchEvent(contentChange);
          }

          if (e.code === "ArrowLeft") {
            if (
              !e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              e.preventDefault();
              moveSelection(selection, contentRef.current, "left");
            }
          }

          if (e.code === "ArrowRight") {
            if (
              !e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              e.preventDefault();
              moveSelection(selection, contentRef.current, "right");
            }
          }    
        }}
        ref={contentRef}
        style={{
          width: "100%",
          height: "150px",
          margin: "auto",
          border: "2px solid black",
          overflowY: "scroll"
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
      {portals.map(portal => portal)};
    </>
  )
}
