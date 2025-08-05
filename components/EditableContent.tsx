"use client"
import React, { isValidElement, ReactPortal, useEffect, useLayoutEffect } from "react";
import { EditableContentProps } from ".";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { createPortal } from "react-dom";
import { moveSelection, resetSelectionToTextNodes, shiftSelection } from "@/utils/selection_movements";
import { selectionIsDescendentOfNode, selectionHasTextNodes, isValidTextEndpoint, getSelectionDirection } from "@/utils/checks";
import { promoteChildrenOfNode } from "@/utils/dom_operations";


export default function EditableContent({className, disableNewLines }: EditableContentProps) {

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
    updateContent,
    dehydratedHTML,
    updatePortalProps,
    resetPortalContainers,
    assignContentRef
  } = useEditableContentContext();


  // experiment
  // useLayoutEffect(() => {
  //   console.log("useEffect");
  //   console.log("if contentRef.current: ", !!contentRef.current)
  //   if (contentRef.current) {

  //     // populate div with html and update state
  //     contentRef.current.innerHTML = dehydratedHTML;
  //     console.log("initialRender in if block"); 
  //   }  
  // }, [contentRef])



  // on initial render
  useEffect(() => {
    console.log("useEffect");
    console.log("if contentRef.current: ", !!contentRef.current)
    if (contentRef.current) {

      // populate div with html and update state
      contentRef.current.innerHTML = dehydratedHTML;
      console.log("initialRender in if block");

      // console.log(contentRef.current.innerHTML);
      // console.log(portals.length);

      // load react portals
      const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]")) as Array<HTMLDivElement>;
      if (portals.length === 0) {
        console.log("should add", reactContainerDivs.length,"portals");
        reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd as HTMLDivElement));
      } 
      else {
        console.log("should reset portal containers");
        resetPortalContainers();
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
        updateSelection();
      }
      else {
        handleSelectionChange();
      } 
    })

    // teardown
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      contentRef.current = null;
    }

  }, [contentRef])

  // on portal change
  useEffect(() => {
    // console.log("post-sanity check check on portals")
    
    // clean up divs which no longer contain a portal
    if (!contentRef.current) return;
    updateContent();
    const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));

    toDelete.forEach(td => promoteChildrenOfNode(td));
    if (hasSelection) {
      console.log("reset selection in portals useEffect");
      resetSelectionToTextNodes();
    }


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
        console.log("reset selection in divToSetSelectionTo useEffect");
        resetSelectionToTextNodes();
        setDivToSetSelectionTo(null);
      }
    }
  }, [divToSetSelectionTo])


  /**
   * if changes need to be made to selection, make those changes, 
   * otherwise update selection pieces of state
   */
  function old_handleSelectionChange() {
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
      // resetSelectionToTextNodes();
      updateSelection();
    } 
  }


  function handleSelectionChange() {
    const selection = window.getSelection();

    if (selection && contentRef.current) {

      const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

      if (!anchorNode || !focusNode) return;

      // console.log(!selectionHasTextNodes(selection, contentRef.current))
      if (!selectionHasTextNodes(selection, contentRef.current)) return;

      // check if selection is fine, if so, updateSelection (no reset)
      // console.log((
      //   anchorNode.nodeType === Node.TEXT_NODE &&
      //   focusNode.nodeType === Node.TEXT_NODE &&
      //   isValidTextEndpoint(anchorNode, anchorOffset, true) &&
      //   isValidTextEndpoint(focusNode, focusOffset, true)
      // ))
      if (
        anchorNode.nodeType === Node.TEXT_NODE &&
        focusNode.nodeType === Node.TEXT_NODE &&
        isValidTextEndpoint(anchorNode, anchorOffset, true) &&
        isValidTextEndpoint(focusNode, focusOffset, true)
      ) {
        updateSelection();
        return;
      }

      // else - selection is not fine, reset selection
      console.log("should reset selection");
      console.log("result of resetSelectionToTextNodes:", resetSelectionToTextNodes());
      updateSelection();
      return;

    }
    // else - no selection or contentRef.current, do nothing
  }


  return (
    <>
      <div
        contentEditable
        ref={assignContentRef}
        spellCheck={false}
        onInput={updateContent}
        onFocus={() => { setHasSelection(true) }}
        onBlur={(e) => { setHasSelection(false) }}
        onKeyDown={(e) => {
          const selection = window.getSelection(); 
          if (!selection || selection.rangeCount === 0 || !contentRef.current) return;
          const range = selection.getRangeAt(0);

          if (e.code === "Enter") {
            e.preventDefault();
            if (disableNewLines) return;
            range.extractContents();
            
            const br = document.createElement("br");
            const textNode = document.createTextNode('\u200B\u200B');
            range.insertNode(textNode);
            range.insertNode(br);
            
            range.setStart(textNode, 1);
            range.collapse();
            
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
            else if (              
              e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              e.preventDefault();
              shiftSelection(selection, contentRef.current, "left");
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
            else if (              
              e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              // console.log("shift key and left")
              e.preventDefault();
              shiftSelection(selection, contentRef.current, "right");
            } 
          }   
          
          if (e.code === "Delete") {
            if (
              !e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              console.log("delete");
              // TODO: replace use of getSelectionDirection with something simpler 
              const direction = getSelectionDirection(selection);
              if (direction === "none"){
                e.preventDefault();
                shiftSelection(selection, contentRef.current, "right");
                selection.getRangeAt(0).deleteContents();
                updateContent();
              }
            }
          }

        }}
        className={className}
        // style={divStyle ? divStyle : {
        //   width: "100%",
        //   height: "150px",
        //   margin: "auto",
        //   border: "2px solid black",
        //   overflowY: "scroll"
        // }}
      >
      </div>
      {portals}
    </>
  )
}


