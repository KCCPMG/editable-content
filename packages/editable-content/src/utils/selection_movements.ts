import { getSelectionDirection, textNodeIsCushioned, getNextPosition } from "./checks";
import { cushionTextNode } from "./dom_operations";



/**
 * Resets the window selection using resetRangeToTextNodes
 * @returns 
 */
export function resetSelectionToTextNodes(): Selection | null {
  let selection = window.getSelection();
  if (!selection) return selection;

  const range = selection.getRangeAt(0);

  const modifiedRange = resetRangeToTextNodes(range);
  if (!modifiedRange) return null;

  selection = window.getSelection();
  if (!selection) return null;

  return selection;
}

/**
 * Given a range, makes sure startContainer and endContainer are
 * text, or finds first text and last text nodes in the range, and
 * resets the range in the beginning and ending respectively of 
 * those nodes, allowing one space for the cushioning of an assumed
 * zero-width space
 * @param range 
 * @returns 
 */
export function resetRangeToTextNodes(range: Range) {

  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    
    const startNode = range.startContainer.childNodes[range.startOffset];
    if (!startNode) return null;
    const tw = document.createTreeWalker(startNode);
    while (true) {
      if (tw.currentNode.nodeType === Node.TEXT_NODE) {
        
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


/**
 * Move selection left or right by one non-zero-width space character,
 * resetting on breaks and sibling interruptions. If range is over more
 * than one character, collapses to the appropriate end of the range
 * @param selection 
 * @param limitingContainer 
 * @param moveDirection 
 * @returns 
 */
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


/**
 * Extends selection left or right, skipping over non-zero-width space 
 * characters, resetting on breaks but not on sibling interruptions
 * @param selection 
 * @param limitingContainer 
 * @param moveDirection 
 * @returns 
 */
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


/**
 * Extends selection to the end of the next word (current if the cursor
 * is on it), as defined by a white space or the beginning or ending of 
 * the total text of the limitingContainer.
 * @param selection 
 * @param limitingContainer 
 * @param moveDirection 
 * @returns 
 */
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