import { getSelectionDirection, getAllTextNodes, isValidTextEndpoint, textNodeIsCushioned, getLastValidCharacterIndex, areUninterruptedSiblingTextNodes, getNextRightEndpoint, getNextPosition } from "./checks";
import { ZWS_RE } from "./constants";
import { cushionTextNode } from "./dom_operations";

export function setSelection(startContainer: Node, startOffset: number, endContainer: Node, endOffset: number) {
  const range = new Range();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  return selection;
}



export function resetSelectionToTextNodes(): Selection | null {
  let selection = window.getSelection();
  if (!selection) return selection;

  const range = selection.getRangeAt(0);
  const originalStartContainer = range.startContainer;

  const modifiedRange = resetRangeToTextNodes(range);
  if (!modifiedRange) return null;

  selection = window.getSelection();
  if (!selection) return null;

  // this is causing an infinite loop if reset called on every selection
  // selection.removeAllRanges(); 
  // selection.addRange(modifiedRange);

  return selection;
}

export function resetRangeToTextNodes(range: Range) {

  // console.log("resetRangeToTextNodes");

  // console.log(range.startContainer, range.startContainer.nodeType !== Node.TEXT_NODE, range.endContainer.nodeType !== Node.TEXT_NODE);

  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    // console.log("range.startContainer not text node")
    const startNode = range.startContainer.childNodes[range.startOffset];
    if (!startNode) return null;
    const tw = document.createTreeWalker(startNode);
    while (true) {
      if (tw.currentNode.nodeType === Node.TEXT_NODE) {
        // console.log("found text node:", tw.currentNode)
        range.setStart(tw.currentNode, 0);
        break;
      } else {
        if (!tw.nextNode()) break;
      }
    }
  }

  if (range.endContainer.nodeType !== Node.TEXT_NODE) {

    const commonAncestor = range.commonAncestorContainer;

    let lastTextNode = range.startContainer;
    const tw = document.createTreeWalker(commonAncestor);
    // advance to new start container
    while (tw.currentNode !== range.startContainer) {
      tw.nextNode();
    }
    while (range.isPointInRange(tw.currentNode, 0)) {
      if (tw.currentNode.nodeType === Node.TEXT_NODE) {
        lastTextNode = tw.currentNode;
      }
      if (!tw.nextNode()) break; // advance tw, break loop if null
    }
    range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0);
  }

  return range;
}


/**
 * If window.getSelection() is on text (both start and end are text
 * nodes), makes sure that both of those text nodes are cushioned,
 * and makes sure that the offset of both start and end containers
 * are after the first zero-width space and before the last zero-width
 * space.
 * @returns 
 */
export function resetSelectionToUsableText() {
  let selection = window.getSelection();
  if (!selection) return selection;

  const range = selection.getRangeAt(0);

  // if selection is not set to text, return
  if (!(range.startContainer instanceof Text && range.endContainer instanceof Text)) {
    return
  }

  // else continue

  // make sure text nodes are cushioned
  if (!(textNodeIsCushioned(range.startContainer))) {
    cushionTextNode(range.startContainer);
  }

  if (!(textNodeIsCushioned(range.endContainer))) {
    cushionTextNode(range.endContainer);
  }

  /**
   * If range.startOffset is 0 (before zero-width space), increase by 1
   * else if range.startOffset is at end of text (after zero-width space),
   * decrement by 1
   * Text content is guaranteed by cushionTextNode to exist and have textContent
   * of length of 2, minimum (2 zero-width spaces)
   */
  if (range.startOffset === 0) {
    range.setStart(range.startContainer, 1);
  }

  else if (range.startOffset === range.startContainer.textContent!.length) {
    range.setStart(range.startContainer, range.startOffset - 1);
  }


  // Repeat process for range.endContainer
  if (range.endOffset === 0) {
    range.setEnd(range.endContainer, 1);
  }

  else if (range.endOffset === range.endContainer.textContent!.length) {
    range.setEnd(range.endContainer, range.endOffset - 1);
  }
  
}


export function experimental_resetRangeToTextNodes(range: Range) {

  // console.log(range.startContainer, range.startContainer.nodeType !== Node.TEXT_NODE, range.endContainer.nodeType !== Node.TEXT_NODE);

  // console.log("resetting range to text nodes");

  const collapsed: boolean = range.collapsed;


  // console.log({range});

  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    const startNode = range.startContainer.childNodes[range.startOffset];
    if (!startNode) return null;
    const tw = document.createTreeWalker(startNode);
    while (true) {
      if (tw.currentNode.nodeType === Node.TEXT_NODE) {

        const currentNode = tw.currentNode;
        const content = currentNode.textContent;

        if (!content || (content.length === 0)) {
          // console.log("first if");
          range.setStart(currentNode, 0);
          break;
        }

        // if purely cushioned node, place after first zero-width space
        if (tw.currentNode.textContent?.split("").every(ch => ch === '\u200B')) {
          // console.log("second if");
          range.setStart(tw.currentNode, 1);
          break;
        }

        // otherwise place before first non-zero-width space
        else {
          for (let i = 0; i < content.length; i++) {
            // console.log("third if");
            // console.log(currentNode);
            if (content[i] !== '\u200B') {
              range.setStart(currentNode, i);
              break;
            }
          }
          console.log("this should never hit");
          break;

        }

        // original
        // range.setStart(tw.currentNode, 0);
        // break;
      } else {
        if (!tw.nextNode()) break;
      }
    }
  } else {

    const currentNode = range.startContainer;
    const content = currentNode.textContent;

    // console.log("startContainer is text node");    

    if (!content || (content.length === 0)) {
      console.log("first if");
      range.setStart(currentNode, 0);
    }

    // if it's fine, leave it
    // effectively does nothing except divert from later else ifs
    else if (
      content[range.startOffset] &&
      content[range.startOffset] !== '\u200B'
    ) {
      range.setStart(currentNode, range.startOffset);
    }

    // if purely cushioned node, place after first zero-width space
    else if (currentNode.textContent?.split("").every(ch => ch === '\u200B')) {
      // console.log("second if");
      range.setStart(currentNode, 1);
    }

    // go outwards from startOffset to find nearest non-zws
    else for (let i = 1; i < content.length; i++) {
      // console.log("last for loop ", i);
      if (
        range.startOffset - i >= 0 &&
        content[range.startOffset - i] !== '\u200B'
      ) {
        range.setStart(currentNode, range.startOffset - i + 1);
        break;
      } else if (
        range.startOffset <= content.length &&
        content[range.startOffset + i]
      ) {
        range.setStart(currentNode, range.startOffset + i - 1);
        break;
      }
    }


    // otherwise place before first non-zero-width space
    // else {
    //   for (let i=0; i<content.length; i++) {
    //     console.log("third if");
    //     console.log(currentNode);
    //     if (content[i] !== '\u200B') {
    //       range.setStart(currentNode, i);
    //       break;
    //     }
    //   }

    // }

    // original
    // range.setStart(tw.currentNode, 0);
    // break;

  }

  // console.log("after setting start", range.startContainer, range.startOffset);

  // if this range is meant to be collapsed, collapse to start
  if (collapsed) {
    range.setEnd(range.startContainer, range.startOffset);
  }

  // otherwise find correct distinct end
  else if (range.endContainer.nodeType !== Node.TEXT_NODE) {

    // console.log("sanity check 1");
    const commonAncestor = range.commonAncestorContainer;

    let lastTextNode = range.startContainer;
    const tw = document.createTreeWalker(commonAncestor);
    // advance to new start container
    while (tw.currentNode !== range.startContainer) {
      // console.log("sanity check 2");
      tw.nextNode();
    }
    while (range.isPointInRange(tw.currentNode, 0)) {
      // console.log("sanity check 3");
      if (tw.currentNode.nodeType === Node.TEXT_NODE) {
        lastTextNode = tw.currentNode;
      }
      if (!tw.nextNode()) break; // advance tw, break loop if null
    }
    // console.log("sanity check 4");
    range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0);
  }

  return range;
}




export function moveSelection(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right") {

  const direction = getSelectionDirection(selection);
  const range = selection.getRangeAt(0);
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

  if (
    !range ||
    !anchorNode || 
    !focusNode
  ) return;

  // range is collapsed
  if (direction === "none") {

    if (moveDirection === "left") {
      if (!(range.startContainer instanceof Text)) return;
      const nextPosition = getNextPosition(range.startContainer, range.startOffset, limitingContainer, "left", "[^\u200B]", false, 0, true, true);
      if (nextPosition === null) return;
      // else
      return selection.setBaseAndExtent(nextPosition.currentNode, nextPosition.offset, nextPosition.currentNode, nextPosition.offset)
    }
    else if (moveDirection === "right") {
      if (!(range.startContainer instanceof Text)) return;
      const nextPosition = getNextPosition(range.startContainer, range.startOffset-1, limitingContainer, "right", "[^\u200B]", true, 0, true, true);
      if (nextPosition === null) return;
      // else
      return selection.setBaseAndExtent(nextPosition.currentNode, nextPosition.offset, nextPosition.currentNode, nextPosition.offset)
    }
  }

  else {

    if (moveDirection === "left" && direction === "backward") {
      selection.setBaseAndExtent(focusNode, focusOffset, focusNode, focusOffset);
    }
    else if (moveDirection === "left" && direction === "forward") {
      selection.setBaseAndExtent(anchorNode, anchorOffset, anchorNode, anchorOffset);
    }
    else if (moveDirection === "right" && direction === "backward") {
      selection.setBaseAndExtent(anchorNode, anchorOffset, anchorNode, anchorOffset);
    }
    else if (moveDirection === "right" && direction === "forward") {
      selection.setBaseAndExtent(focusNode, focusOffset, focusNode, focusOffset);
    }

  }
}



export function extendSelection(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right") {

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  const range = selection.getRangeAt(0);
  if (
    !range ||
    !anchorNode || 
    !focusNode ||
    !(anchorNode instanceof Text) ||
    !(focusNode instanceof Text)
  ) return;


  if (moveDirection === "left") {
    if (!(range.startContainer instanceof Text)) return;
    const nextPosition = getNextPosition(focusNode, focusOffset, limitingContainer, "left", "[^\u200B]", false, 0, false, true);
    if (nextPosition === null) return;
    // else
    return selection.setBaseAndExtent(anchorNode, anchorOffset, nextPosition.currentNode, nextPosition.offset)
  }
  else if (moveDirection === "right") {
    if (!(range.startContainer instanceof Text)) return;
    const nextPosition = getNextPosition(focusNode, focusOffset-1, limitingContainer, "right", "[^\u200B]", true, 0, false, true);
    if (nextPosition === null) return;
    // else
    return selection.setBaseAndExtent(anchorNode, anchorOffset, nextPosition.currentNode, nextPosition.offset)
  }

}


export function extendWordSelection(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right") {

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  const range = selection.getRangeAt(0);
  if (
    !range ||
    !anchorNode || 
    !focusNode ||
    !(anchorNode instanceof Text) ||
    !(focusNode instanceof Text)
  ) return;


  if (moveDirection === "left") {
    if (!(range.startContainer instanceof Text)) return;
    const nextPosition = getNextPosition(focusNode, focusOffset-1, limitingContainer, "left", "\\u200B| \\S", false, 1, false, true);
    
    if (nextPosition === null) return;
    // else
    return selection.setBaseAndExtent(anchorNode, anchorOffset, nextPosition.currentNode, nextPosition.offset)
  }

  else if (moveDirection === "right") {
    if (!(range.startContainer instanceof Text)) return;
    const nextPosition = getNextPosition(focusNode, focusOffset, limitingContainer, "right", "\\S |\\S\\u200B$", false, 1, false, true);
    if (nextPosition === null) return;
    // else
    return selection.setBaseAndExtent(anchorNode, anchorOffset, nextPosition.currentNode, nextPosition.offset)
  }

}


// const { focusNode, focusOffset } = window.getSelection();