"use client"
import React, { useEffect, useRef, useState } from "react";
import { useEditableContentContext } from "./EditableContentContext";
import { moveSelection, resetSelectionToTextNodes, resetSelectionToUsableText, extendSelection, extendWordSelection } from "./utils/selection_movements";
import { selectionIsDescendentOfNode, selectionHasTextNodes, isValidTextEndpoint, getAllTextNodes } from "./utils/checks";
import { clearAndResetSelection, cushionTextNode, promoteChildrenOfNode } from "./utils/dom_operations";
import { ContentProps } from "./types";




export default function EditableContent({ className, disableNewLines }: ContentProps) {

  const {
    contextInstanceIdRef,
    contentRef,
    setContentRefCurrentInnerHTML,
    hasSelection,
    setHasSelection,
    portals,
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
  const editableContentRef = useRef<null | HTMLDivElement>(null);



  /**
   * On initial render only
   * Assigns editableContentRef.current to
   * contentRef.current if they are not already
   * the same (this safely works across both renders
   * in development mode). Once the assignment
   * has been made, populates the contentRef.current's
   * innerHTML with the dehydratedHTML, and then
   * calls setContentRefCurrentInnerHTML. Note that
   * this does *not* call updateContent, which contains
   * cleanup logic that would cause deletion of react
   * portal divs during their initial population. This 
   * also adds the selectionchange event handler, updates
   * the initialRenders achieved state for determining if
   * it is safe to execute post-render logic, and returns
   * the teardown logic of assigning null to contentRef and
   * removing the selectionchange handler.
   */
  useEffect(() => {

    if (editableContentRef.current) {
      
      // assign contentRef if not assigned
      if (!contentRef.current || (contentRef.current != editableContentRef.current)) {
        assignContentRef(editableContentRef.current);
      }

      // contentRef.current is editableContentRef
      if (contentRef.current == editableContentRef.current) {

        // populate div with html and update state
        contentRef.current.innerHTML = dehydratedHTML;
        setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
      }
    }

    // assign selectionchange event listener
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

    setInitialRendersAchieved((initialRendersAchieved) => initialRendersAchieved + 1)

    // teardown
    return () => {
      // remove selection listener, clear contentRef for reassignment
      try {
        document.removeEventListener('selectionchange', handleSelectionChange);
      } catch(err) {
        console.log("selection change handler error", err);
      }
      try {
        assignContentRef(null);
      } catch(err) {
        console.log("assignContentRef error:", err);
      }
    }
  }, [])


  /**
   * On change to initialRendersAchieved
   * If initial renders have been achieved, (2 
   * for development, 1 for production), then
   * setSafeToUpdateInUseEffect(true)
   */
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


  /**
   * On change to safeToUpdateInUseEffect
   * If safeToUpdateInUseEffect, and contentRef 
   * has been successfully assigned to 
   * editableContentRef, populate react divs, 
   * either by creating the react portals if 
   * they do not exist, or by resetting them if 
   * they do.
   */
  useEffect(() => {

    if (safeToUpdateInUseEffect) {

      if (
        editableContentRef.current &&
        (contentRef.current == editableContentRef.current)
      ) {

        if (portals.length === 0) {
          const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]")) as Array<HTMLDivElement>;
          reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd as HTMLDivElement));
        }
        else {
          resetPortalContainers();
        }
      }
    }
  }, [safeToUpdateInUseEffect])


  /**
   * On portals change
   * Only runs after refs assigned and initial renders
   * complete: calls updateContent to run clean up
   * and setContentRefInnerHTML to reflect changes
   * made to dom by react portals, deletes react divs for
   * portals which have been deleted, and then makes sure
   * selection is on text nodes.
   */
  useEffect(() => {

    // do *not* run until refs assigned, initial render complete
    if (
      contentRef.current && 
      (contentRef.current == editableContentRef.current) &&
      safeToUpdateInUseEffect
    ) {

      // collect and delete portal divs marked for deletion
      const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));
      toDelete.forEach(td => promoteChildrenOfNode(td));
      
      updateContent(); // cleans up, sets contentRefInnerHTML

      if (hasSelection) {
        resetSelectionToTextNodes();
      }
    }

  }, [portals])


  /**
   * on divToSetSelectionTo change
   * If there is a div which should have the
   * selection, set selection to text within
   * the div.
   */
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
        ref={editableContentRef}
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
              // pass, appears to be working with default
              // e.preventDefault();
              // extendWordSelection(selection, contentRef.current, "left");
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
              // pass, appears to be working with default
              // e.preventDefault();
              // extendWordSelection(selection, contentRef.current, "right");
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
