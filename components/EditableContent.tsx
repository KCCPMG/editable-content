"use client"
import React, { useEffect, useState } from "react";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { moveSelection, resetSelectionToTextNodes, resetSelectionToUsableText, extendSelection, extendWordSelection } from "@/utils/selection_movements";
import { selectionIsDescendentOfNode, selectionHasTextNodes, isValidTextEndpoint, getAllTextNodes } from "@/utils/checks";
import { clearAndResetSelection, cushionTextNode, promoteChildrenOfNode } from "@/utils/dom_operations";
import { ContentProps } from ".";




export default function EditableContent({ className, disableNewLines }: ContentProps) {

  const {
    contextInstanceIdRef,
    contentRef,
    setContentRefCurrentInnerHTML,
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
    resetPortalContainers,
    assignContentRef
  } = useEditableContentContext();

  const [safeToUpdateInUseEffect, setSafeToUpdateInUseEffect] = useState<boolean>(false);
  const [initialRendersAchieved, setInitialRendersAchieved] = useState<number>(0);


  // on initial render
  useEffect(() => {

    console.log(process.env.NODE_ENV);

    if (contentRef.current) {

      // populate div with html and update state
      contentRef.current.innerHTML = dehydratedHTML;

      // identify portal divs, load react portals
      const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]")) as Array<HTMLDivElement>;
      if (portals.length === 0) {
        reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd as HTMLDivElement));
      }
      else resetPortalContainers();

      setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
      setInitialRendersAchieved((initialRendersAchieved) => initialRendersAchieved + 1)
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
      // remove selection listener, clear contentRef for reassignment
      document.removeEventListener('selectionchange', handleSelectionChange);
      contentRef.current = null;
    }

  }, [contentRef])

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      if (initialRendersAchieved >= 2) {
        setSafeToUpdateInUseEffect(true);
      }
    }
    else {
      if (initialRendersAchieved >= 1) {
        setSafeToUpdateInUseEffect(true);
      }
    }
  }, [initialRendersAchieved])


  // on portal change
  useEffect(() => {

    // clean up divs which no longer contain a portal
    if (!contentRef.current) return;

    // only update content if initial render useEffect has completed
    if (safeToUpdateInUseEffect) updateContent();

    // collect and delete portal divs marked for deletion
    const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));

    toDelete.forEach(td => promoteChildrenOfNode(td));
    if (hasSelection) {
      console.log("reset selection in portals useEffect");
      resetSelectionToTextNodes();
    }

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
   * run on initial render to unlock future runs of updateContent on portals 
   * changes but to prevent it from running right away
   */
  useEffect(function () {
    setSafeToUpdateInUseEffect(true);
  }, [])



  function handleSelectionChange() {
    const selection = window.getSelection();

    if (selection && contentRef.current) {

      const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

      if (!anchorNode || !focusNode) return;

      if (!selectionHasTextNodes(selection, contentRef.current)) return;

      // check if selection is fine, if so, updateSelection (no reset)
      if (
        anchorNode.nodeType === Node.TEXT_NODE &&
        focusNode.nodeType === Node.TEXT_NODE &&
        isValidTextEndpoint(anchorNode, anchorOffset, true) &&
        isValidTextEndpoint(focusNode, focusOffset, true)
      ) {
        resetSelectionToUsableText();
        updateSelection();
        return;
      }

      // else - selection is not fine, reset selection
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
        className={className}
        spellCheck={false}
        // style={{ whiteSpace: "pre" }}
        onFocus={() => { 
          // create empty text node if necessary
          if (contentRef.current && getAllTextNodes([contentRef.current]).length === 0) {
            const textNode = new Text("\u200B\u200B");
            contentRef.current.append(textNode);
            window.getSelection()?.setBaseAndExtent(textNode, 1, textNode, 1);
            updateContent();
          }
          
          setHasSelection(true);
        }}
        onBlurCapture={(e) => {
          // if blurring because button is being clicked, do not setHasSelection to false
          if (
            !e.relatedTarget || 
            e.relatedTarget.tagName !== 'BUTTON' || 
            e.relatedTarget.getAttribute('data-context-id') !== contextInstanceIdRef.current
          ) {
            setHasSelection(false);
          }
          // else, relatedTarget is button, retain hasSelection as true
        }}
        onKeyDown={(e) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0 || !contentRef.current) return;
          const range = selection.getRangeAt(0);

          // delete range before replacing with character to prevent text merging
          if (
            e.key.length === 1 && 
            range.startContainer instanceof Text &&
            range.endContainer instanceof Text
          ) {
            e.preventDefault();
            e.stopPropagation();
            if (range.toString().length > 0) {
              range.startContainer.insertData(range.startOffset, e.key)
              range.setStart(range.startContainer, range.startOffset+1);
              range.extractContents();
              return;

            } 
            const char = e.key === " " ? "\u00a0" : e.key
            range.startContainer.insertData(range.startOffset, char);
            range.setEnd(range.startContainer, range.startOffset + 1);
            range.collapse();
            updateContent();
            return;
          }

          if (e.code === "Enter") {
            e.preventDefault();
            if (disableNewLines) return;
            // else continue

            const br = document.createElement('br')
            range.extractContents();
            range.insertNode(br);

            // recushion prior node
            if (range.startContainer instanceof Text) {
              cushionTextNode(range.startContainer);
            }

            // this should always be true, text node should exist to begin with or is created above
            if (br.nextSibling! instanceof Text) {
              cushionTextNode(br.nextSibling);
              range.setStart(br.nextSibling, 1);
              range.collapse();
            }
            
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
              extendSelection(selection, contentRef.current, "left");
            } else if (
              e.shiftKey &&
              (
                e.altKey ||
                e.ctrlKey
              ) &&
              !e.metaKey
            ) {
              e.preventDefault();
              extendWordSelection(selection, contentRef.current, "left");
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
              e.preventDefault();
              extendSelection(selection, contentRef.current, "right");
            } else if (
              e.shiftKey &&
              (
                e.altKey ||
                e.ctrlKey
              ) &&
              !e.metaKey
            ) {
              e.preventDefault();
              extendWordSelection(selection, contentRef.current, "right");
            }
          }

          if (e.code === "Delete") {
            e.preventDefault();
            
            if (range.toString().length === 0) {
              extendSelection(selection, contentRef.current, "right");
            } 
            clearAndResetSelection(selection);
            updateContent();
          }

          if (e.code === "Backspace") {

            e.preventDefault();
            
            if (range.toString().length === 0) {
              extendSelection(selection, contentRef.current, "left");
            } 

            clearAndResetSelection(selection);
            updateContent();
          }

        }}
        
      >
      </div>
      {portals}
    </>
  )
}
