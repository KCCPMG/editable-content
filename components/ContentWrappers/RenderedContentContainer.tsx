"use client"
import React, { useEffect, useLayoutEffect } from "react";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { Paper, Typography, Button } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { promoteChildrenOfNode } from "@/utils/dom_operations";
import RenderedContent from "../RenderedContent";



type RenderedContentContainerProps = {
  setEditMode:  Dispatch<SetStateAction<boolean>>
}


export default function RenderedContentContainer(
  {setEditMode}: RenderedContentContainerProps
) {

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
    resetPortalContainers,
    assignContentRef
  } = useEditableContentContext();



  // on initial render
  useLayoutEffect(() => {

    setHasSelection(false);

    if (contentRef.current) {
      // if (initialHTML) {
      contentRef.current.innerHTML = dehydratedHTML;
      
      console.log("portals.length:", portals.length);

      // load react portals
      const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]")) as Array<HTMLDivElement>;
      if (portals.length === 0) {
        reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd as HTMLDivElement));
      } else resetPortalContainers();

    }

    // teardown
    return () => {
      contentRef.current = null;
      // document.removeEventListener('selectionchange', handleSelectionChange);
    }

  }, [contentRef])


  // on portal change
  useEffect(() => {
    
    // clean up divs which no longer contain a portal
    if (!contentRef.current) return;
    const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));

    toDelete.forEach(td => promoteChildrenOfNode(td));

  }, [portals])


  return (
    <Paper 
      elevation={16}
      sx={{
        border: "1px solid black",
        borderRadius: "8px",
        overflow: 'hidden',
        padding: '4px',
        paddingRight: '10px'
      }}
    >
      <Typography variant="h5">Rendered Content</Typography>
      <hr/>
      {/* <div
        spellCheck={false}
        ref={assignContentRef}
        style={{
          height: "250px",
          overflowY: "scroll"
        }}
        // style={divStyle ? divStyle : {
        //   width: "100%",
        //   height: "150px",
        //   margin: "auto",
        //   // border: "2px solid black",
        //   overflowY: "scroll"
        // }}
      >
      </div>
      {portals} */}
      <RenderedContent />
      <hr/>
      <Button onClick={() => setEditMode(true)}>
        Edit Text
      </Button>
    </Paper>
  )
}
