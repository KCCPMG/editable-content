"use client"
import React, { useEffect, useLayoutEffect } from "react";
import { EditableContentProps } from ".";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { promoteChildrenOfNode } from "@/utils/dom_operations";


export default function RenderedContent({className}: EditableContentProps) {

  const {
    contentRef, 
    setHasSelection,
    portals, 
    appendPortalToDiv,
    dehydratedHTML,
    resetPortalContainers,
    assignContentRef
  } = useEditableContentContext();


  // on initial render - populate portal containers without deleting for being empty
  useLayoutEffect(() => {

    setHasSelection(false);

    if (contentRef.current) {
      // populate with dehydratedHTML
      contentRef.current.innerHTML = dehydratedHTML;

      // identify portal divs, load react portals
      const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]")) as Array<HTMLDivElement>;
      if (portals.length === 0) {
        reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd as HTMLDivElement));
      } else resetPortalContainers();
    }

    // teardown
    return () => {
      contentRef.current = null; // clear contentRef to be reassigned
    }

  }, [contentRef])


  // on portal change
  useEffect(() => {
    
    if (!contentRef.current) return;

    // clean up divs which no longer contain a portal
    const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));
    toDelete.forEach(td => promoteChildrenOfNode(td));

  }, [portals])


  return (
    <>
      <div
        spellCheck={false}
        ref={assignContentRef}
        className={className}
      >
      </div>
      {portals}
    </>
  )
}
