"use client"
import React, { useRef, useState, useEffect, isValidElement, ReactElement, useCallback } from "react";
import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, resetRangeToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes, getAncestorNode, getLastValidCharacterIndex, getLastValidTextNode } from '@/utils/utils';
import { EditableContentProps, EditTextButtonObject, WrapperInstructions } from "./ContentEditableExperimentComponents";
import EditTextButton from "./ContentEditableExperimentComponents/EditTextButton";
import { renderToString } from "react-dom/server";
import { WrapperArgs } from "./ContentEditableExperimentComponents";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from 'uuid';
import { useEditableContentContext } from "@/context/EditableContentContext";


const reportState = new CustomEvent("reportState");


/**
 * create custom event
 * fire event on all *portals*
 * pass function to report state
 * if I put the event listener on the portal,
 * I would have to do so dynamically, in its useEffect
 * I would also have to put the event emitter on the portal
 * Alternatively, if there is some way I could access
 * the state directly from the portals?
 * If components take a prop, reportState: () => void
 */




export default function EditableContent({divStyle, buttonRowStyle, initialHTML, editTextButtons}: EditableContentProps) {

  // const contentRef = useRef<null | HTMLDivElement>(null);
  // const [contentRefCurrentInnerHTML, setContentRefCurrentInnerHTML] = useState<string>("");
  // const [selectionToString, setSelectionToString] = useState<string>("");
  // const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  // const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<Number | null>(null);
  // const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  // const [selectionFocusOffset, setSelectionFocusOffset] = useState<Number | null>(null);
  // const [hasSelection, setHasSelection] = useState<boolean>(false);
  // const [portals, setPortals] = useState<Array<React.ReactPortal>>([]);
  // const [portalsState, setPortalsState] = useState<{[key: string]: any}>({});
  // const [mustReportState, setMustReportState] = useState<{[key: string]: any}>({});
  // const [divToSetSelectionTo, setDivToSetSelectionTo] = useState<HTMLElement | null>(null)

  const {
    contentRef, 
    contentRefCurrentInnerHTML, 
    setContentRefCurrentInnerHTML,
    selectionToString, 
    setSelectionToString,
    selectionAnchorNode, 
    setSelectionAnchorNode,
    selectionAnchorOffset, 
    setSelectionAnchorOffset,
    selectionFocusNode, 
    setSelectionFocusNode,
    selectionFocusOffset, 
    setSelectionFocusOffset,
    hasSelection, 
    setHasSelection,
    portals, 
    setPortals,
    divToSetSelectionTo, 
    setDivToSetSelectionTo,
    appendPortalToDiv,
    updateSelection,
    updateContent
  } = useEditableContentContext();

  // make sure all react elements are unbreakable
  editTextButtons = editTextButtons.map(etb => {
    if (!etb.isReactComponent) return etb;

    else {
      const { component } = etb;
      const newProps = {...component.props};
      newProps['data-unbreakable'] = '';
      const clonedComponent = React.cloneElement(component, newProps);
      return({
        ...etb,
        component: clonedComponent
      })
    }
  })

  // on render
  useEffect(() => {
    // populate div with html and update state
    if (contentRef.current) {
      if (initialHTML) {
        contentRef.current.innerHTML = initialHTML;
        // load react portals
        const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]"));
        reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd as HTMLDivElement));
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

    // teardown
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    }

  }, [])

  // on portal change
  useEffect(() => {
    updateContent();
    
    // clean up divs which no longer contain a portal
    if (!contentRef.current) return;
    const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));

    toDelete.forEach(td => promoteChildrenOfNode(td));
    resetSelectionToTextNodes();


    // TODO: Delete these once done testing
    (window as any).portals = portals;
    (window as any).setPortals = setPortals;
  }, [portals])

  // on divToSetSelectionTo change
  useEffect(() => {
    // once react portal has rendered, set selection to text within, clear divToSetSelectionTo
    if (divToSetSelectionTo) {
      if (divToSetSelectionTo.childNodes.length > 0) {
        window.getSelection()?.setBaseAndExtent(divToSetSelectionTo, 0, divToSetSelectionTo, divToSetSelectionTo.childNodes.length);
        resetSelectionToTextNodes();
        setDivToSetSelectionTo(null);
      }
    }
  }, [divToSetSelectionTo])


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
      console.log("selectionHasTextNodes", selectionHasTextNodes(selection, contentRef.current));
      if (selectionHasTextNodes(selection, contentRef.current)) {
        resetSelectionToTextNodes();
      } else {
        const textNode = document.createTextNode('\u200B\u200B');
        // contentRef.current.append(textNode);
        const range = selection.getRangeAt(0);
        range.insertNode(textNode)
        range.setStart(textNode, 1);
        range.setEnd(textNode, 1);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    else {
      updateSelection();
    } 
  }


  return (
    <>
      {/* <div style={buttonRowStyle}>
        {
          editTextButtons.map(etb => {
            return editTextButtonObjectToEditTextButton(etb);
          })
        }
      </div> */}
      <div
        contentEditable
        spellCheck={false}
        onInput={updateContent}
        onFocus={() => { setHasSelection(true) }}
        onBlur={() => { setHasSelection(false) }}
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
            updateContent(); 
          }

          if (e.code === "Space") { 
            e.preventDefault();
            const spaceNode = document.createTextNode("\u0020\u200B");
            range.extractContents();
            range.insertNode(spaceNode);
            range.setStart(spaceNode, 2);
            range.collapse();
            selection.removeAllRanges();
            selection.addRange(range);
            updateContent();
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
        style={divStyle ? divStyle : {
          width: "100%",
          height: "150px",
          margin: "auto",
          border: "2px solid black",
          overflowY: "scroll"
        }}
      >
      </div>
      {portals.map(portal => portal)}
    </>
  )
}
