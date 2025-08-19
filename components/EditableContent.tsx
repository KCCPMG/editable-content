"use client"
import React, { isValidElement, ReactPortal, useEffect, useLayoutEffect, useRef, useState } from "react";
import { EditableContentProps } from ".";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { createPortal } from "react-dom";
import { experimental_moveSelection, moveSelection, resetRangeToTextNodes, resetSelectionToTextNodes, resetSelectionToUsableText, shiftSelection } from "@/utils/selection_movements";
import { selectionIsDescendentOfNode, selectionHasTextNodes, isValidTextEndpoint, getSelectionDirection, getAllTextNodes, searchCombinedText, getLastValidCharacterIndex, getNextPosition } from "@/utils/checks";
import { cushionTextNode, promoteChildrenOfNode } from "@/utils/dom_operations";


export default function EditableContent({ className, disableNewLines }: EditableContentProps) {

  const {
    contextInstanceId,
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
        console.log("should add", reactContainerDivs.length, "portals");
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

  const [safeToUpdateInUseEffect, setSafeToUpdateInUseEffect] = useState<boolean>(false);

  // on portal change
  useEffect(() => {
    // console.log("post-sanity check check on portals")

    // clean up divs which no longer contain a portal
    if (!contentRef.current) return;

    // if (!safeToUpdateInUseEffect.current) updateContent();
    // else safeToUpdateInUseEffect.current = true;


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


  // run on initial render to unlock future runs of updateContent on portals changes
  // but to prevent it from running right away
  useEffect(function () {
    setSafeToUpdateInUseEffect(true);
  }, [])

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
        resetSelectionToUsableText();
        updateSelection();
        return;
      }

      // else - selection is not fine, reset selection
      // console.log("should reset selection");
      // console.log("result of resetSelectionToTextNodes:", resetSelectionToTextNodes());
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
        onBlurCapture={(e) => {
          if (
            !e.relatedTarget || 
            e.relatedTarget.tagName !== 'BUTTON' || 
            e.relatedTarget.getAttribute('data-context-id') !== contextInstanceId
          ) {
            setHasSelection(false);
          }
          // else, relatedTarget is button, retain hasSelection as true
        }}
        onKeyDown={(e) => {
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0 || !contentRef.current) return;
          const range = selection.getRangeAt(0);

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
              
              // original
              // moveSelection(selection, contentRef.current, "left");
              
              // recent experiment
              experimental_moveSelection(selection, contentRef.current, "left");
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
              // moveSelection(selection, contentRef.current, "right");
              experimental_moveSelection(selection, contentRef.current, "right");
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
              if (direction === "none") {
                e.preventDefault();
                shiftSelection(selection, contentRef.current, "right");
                selection.getRangeAt(0).deleteContents();
                updateContent();
              }
            }
          }

          if (e.code === "Backspace") {
            console.log("backspace");
            if (range.toString().length === 0) {

              e.preventDefault();

              if (!(range.startContainer instanceof Text)) {
                console.log("range.startContainer is not instance of text")
                console.log(range.startContainer);
                return null;
              }

              const allTextNodes = getAllTextNodes([contentRef.current]);
              // let textNode = range.startContainer;
              // let offset = range.startOffset;

              // if (offset === 0) {
              //   const textNodeIndex = allTextNodes.findIndex(tn => tn === textNode) - 1;
              //   if (textNodeIndex < 0) return;
              //   else {
              //     textNode = allTextNodes[textNodeIndex];
              //     offset = textNode.textContent.length;
              //   }
              // }

              const leftEndpoint = searchCombinedText({
                textNodes: allTextNodes,
                reSource: "[^\u200B]",
                getLast: true,
                upTo: {
                  textNode: range.startContainer,
                  nodeOffset: range.startOffset - 1
                }

              })


              console.log({
                start: {
                  currentNode: range.startContainer.textContent,
                  offset: range.startOffset
                },
                leftEndpoint: {
                  currentNode: leftEndpoint?.currentNode.textContent,
                  offset: leftEndpoint?.offset
                }
              });

              if (leftEndpoint) {
                range.setStart(leftEndpoint?.currentNode, leftEndpoint.offset);
                
                // handle break to only delete one break at a time
                const breaks = Array.from(contentRef.current.querySelectorAll('br'))
                  .filter(b => range.comparePoint(b,0) === 0)

                if (breaks.length > 0) {
                  console.log("\nbreaks.length > 0,", breaks.length, "\n")
                  const breakToDelete = breaks[breaks.length - 1];
                  console.log(breakToDelete);
                  
                  let textNodeIndex = allTextNodes.findIndex(tn => tn === range.endContainer);

                  while (textNodeIndex > 0) {
                    
                    const currentTextNode = allTextNodes[textNodeIndex];
                    if (currentTextNode.compareDocumentPosition(breakToDelete) === 4) {
                      const currentTextNodeOffset = getLastValidCharacterIndex(currentTextNode);
                      console.log({currentTextNode, currentTextNodeOffset})
                      range.setStart(currentTextNode, currentTextNodeOffset);
                      console.log(range);
                      break;
                    }
                    textNodeIndex--;
                  }

                }
                
                console.log(range);
                const startContainer = range.startContainer;
                const startOffset = range.startOffset;
                range.extractContents();
                range.setStart(startContainer, startOffset);
                // console.(range);
                range.collapse(true);
                console.log(range);

              }
              updateContent();
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
