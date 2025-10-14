"use client"
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ContentProps } from "./types";
import { useEditableContentContext } from "./EditableContentContext";
import { promoteChildrenOfNode } from "./utils/dom_operations";


export default function RenderedContent({className}: ContentProps) {

  const {
    contentRef, 
    setHasSelection,
    portals, 
    appendPortalToDiv,
    dehydratedHTML,
    resetPortalContainers,
    assignContentRef,
    updateContent
  } = useEditableContentContext();

  const [safeToUpdateInUseEffect, setSafeToUpdateInUseEffect] = useState<boolean>(false);
  const [initialRendersAchieved, setInitialRendersAchieved] = useState<number>(0);
  const renderedContentRef = useRef<null | HTMLDivElement>(null);
  

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

    if (renderedContentRef.current) {
      
      // assign contentRef if not assigned
      if (!contentRef.current || (contentRef.current != renderedContentRef.current)) {
        assignContentRef(renderedContentRef.current);
      }

      // contentRef.current is editableContentRef
      if (contentRef.current == renderedContentRef.current) {

        // populate div with html and update state
        contentRef.current.innerHTML = dehydratedHTML;
        // setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
      }
    }

    setInitialRendersAchieved((initialRendersAchieved) => initialRendersAchieved + 1)

    // teardown
    return () => {
      try {
        console.log("\nteardown");
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
        renderedContentRef.current &&
        (contentRef.current == renderedContentRef.current)
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
      (contentRef.current == renderedContentRef.current) &&
      safeToUpdateInUseEffect
    ) {
    
      // collect and delete portal divs marked for deletion
      const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));
      toDelete.forEach(td => promoteChildrenOfNode(td));
      
      updateContent(); // cleans up, sets contentRefInnerHTML
      
    }

  }, [portals])


  return (
    <>
      <div
        ref={renderedContentRef}
        className={className}
        spellCheck={false}
        // style={{ whiteSpace: "pre-wrap" }}
      >
      </div>
      {portals}
    </>
  )
}
