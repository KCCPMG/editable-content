import { getSelectionDirection, getAllTextNodes, isValidTextEndpoint, textNodeIsCushioned, getLastValidCharacterIndex, areUninterruptedSiblingTextNodes, getNextRightEndpoint } from "./checks";
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


  // begin on start
  if (!(textNodeIsCushioned(range.startContainer))) {
    cushionTextNode(range.startContainer);
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

  /**
   * Repeat process for range.endContainer and 
   */
  if (!(textNodeIsCushioned(range.endContainer))) {
    cushionTextNode(range.endContainer);
  }

  if (range.endOffset === 0) {
    range.setStart(range.endContainer, 1);
  }

  else if (range.endOffset === range.endContainer.textContent!.length) {
    range.setStart(range.endContainer, range.endOffset - 1);
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

// TODO: Better pair move left and move right logic
// TODO: Write getFirstValidIndex in utils/checks.ts, invoke here
/**
 * Move selection to jump over zero-width spaces within same text node or if 
 * next text node in moveDirection is a sibling. 
 * -If moving left, character to the right must be non-zero-width space, 
 *  and 0 is an acceptable value (assuming not breaking other rules)
 * -If moving right, character to the left must be non-zero-width space,
 *  and textContent.length is an acceptable value
 * @param selection 
 * @param limitingContainer 
 * @param moveDirection 
 * @returns 
 */
export function experimental_moveSelection(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right") {

  const direction = getSelectionDirection(selection);
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  if (selection.rangeCount === 0) return;
  if (!anchorNode || !focusNode) return;

  const textNodes = getAllTextNodes([limitingContainer]);
  if (!(anchorNode instanceof Text)) resetSelectionToTextNodes();

  // if still not text, return
  if (!(anchorNode instanceof Text)) return;

  // range is not collapsed
  if (direction !== "none") {
    if (moveDirection === "right") {
      return selection.collapseToEnd();
    } else if (moveDirection === "left") {
      return selection.collapseToStart();
    }
  }

  // range is collapsed
  if (direction === "none") {

    let indexOfTextNode = textNodes.findIndex(tn => tn === anchorNode);
    let currentNode = anchorNode;

    /**
     * If moving left, character to the right must be non-zero-width space, 
     * and 0 is an acceptable value (assuming not breaking other rules)
     */
    if (moveDirection === "left") {

      if (anchorOffset > 0) {

        const newIndex = getLastValidCharacterIndex(currentNode as Text, true, anchorOffset - 1);

        if (newIndex >= 0) {
          // if this is skipping a zero-width space node, place cursor on left side of valid character
          if (
            currentNode.textContent![newIndex] === '\u200B'
          ) {
            if (newIndex !== 0) {
              // valid character, set cursor to left of character
              return selection.setBaseAndExtent(currentNode, newIndex - 1, currentNode, newIndex - 1);
            }
            // else - continue, exit if block, go to while loop
          }
          else {
            return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
          }
        }
      }
      // else 

      while (true) {

        indexOfTextNode--;
        if (indexOfTextNode < 0) return;

        // determine if is sibling
        // const isSibling = (textNodes[indexOfTextNode].parentNode === anchorNode.parentNode);
        const isSibling = areUninterruptedSiblingTextNodes(anchorNode, textNodes[indexOfTextNode])

        currentNode = textNodes[indexOfTextNode];

        if (isSibling) {
          const newIndex = getLastValidCharacterIndex(currentNode as Text, false);
          if (newIndex >= 0) {
            // if this is skipping a zero-width space node, place cursor on left side of valid character
            if (
              ((anchorOffset - newIndex) > 1) || // this check may be redundant
              currentNode.textContent![newIndex] === '\u200B'
            ) {
              if (newIndex !== 0) {
                return selection.setBaseAndExtent(currentNode, newIndex - 1, currentNode, newIndex - 1);
              }
              // else continue, exit if block, go to while loop
            }
            else {
              return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
            }
          }
        } else {

          const newIndex = getLastValidCharacterIndex(currentNode as Text, true);
          // console.log({ newIndex })
          if (newIndex >= 0) {
            return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
          } else continue;
        }

      }
    }

    /**
     * If moving right, character to the left must be non-zero-width space,
     * and textContent.length is an acceptable value
     */
    else if (moveDirection === "right") {

      const endpoint = getNextRightEndpoint(textNodes, indexOfTextNode, anchorOffset);
      if (endpoint) {
        const {currentNode, newIndex} = endpoint;
        return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
      }
      else return;

      // if (currentNode.textContent) {
      //   if (anchorOffset < currentNode.textContent!.length) {
          
      //     // find first non-zero-width space character
      //     const reMatch = currentNode
      //       .textContent
      //       .slice(anchorOffset)
      //       .match(/[^\u200B]/);
            
      //     if (reMatch && reMatch.index !== undefined) {
      //       const newIndex = reMatch.index + anchorOffset + 1;
      //       return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
      //     }

      //     // else, go into next text node
      //   }
      //   // else, go into next text node
      // }
      // // else, go into next text node

      // while (indexOfTextNode < textNodes.length) {

      //   indexOfTextNode++;
      //   if (indexOfTextNode >= textNodes.length) return;

      //   // determine if is sibling
      //   // const isSibling = (textNodes[indexOfTextNode].parentNode === anchorNode.parentNode);
      //   const isSibling = areUninterruptedSiblingTextNodes(anchorNode, textNodes[indexOfTextNode])
      //   currentNode = textNodes[indexOfTextNode];
      //   if (!(currentNode instanceof Text)) return; // narrow type

      //   if (isSibling && currentNode.textContent !== null) {
      //     const reMatch = currentNode
      //       .textContent
      //       .match(/[^\u200B]/);
          
      //     if (reMatch && reMatch.index !== undefined) {
      //       const newIndex = reMatch.index + 1;
      //       return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
      //     }
          
      //   } else {

      //     // if empty text
      //     if (currentNode.textContent === "") {
      //       return selection.setBaseAndExtent(currentNode, 0, currentNode, 0);
      //     }

      //     // if only character is zero-width space
      //     if (currentNode.textContent === "\u200B") {
      //       return selection.setBaseAndExtent(currentNode, 1, currentNode, 1);
      //     }

      //     // if is fully cushioned node
      //     if (
      //       currentNode.textContent !== null && 
      //       currentNode.textContent.split("").every(ch => ch === '\u200B')
      //     ) {
      //       return selection.setBaseAndExtent(currentNode, 1, currentNode, 1);
      //     }

      //     /**
      //      * else - find first non-zero-width space character as above, but 
      //      * place cursor *before* first valid character
      //      */
      //     if (currentNode.textContent) {
      //       const reMatch = currentNode
      //         .textContent
      //         .match(/[^\u200B]/);
  
              
      //       if (reMatch && reMatch.index !== undefined) {
      //         const newIndex = reMatch.index;
      //         return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
      //       }
      //     }
      //   }


      // }

    }

  }


}


export function moveSelection(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right") {

  const direction = getSelectionDirection(selection);
  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  if (selection.rangeCount === 0) return;
  if (!anchorNode || !focusNode) return;

  const textNodes = getAllTextNodes([limitingContainer]);


  // range is collapsed
  if (direction === "none") {

    let indexOfTextNode = textNodes.findIndex(tn => tn === anchorNode);

    if (moveDirection === "left") {

      if (anchorOffset > 0) {

        for (let i = anchorOffset - 1; i >= 0; i--) {
          if (anchorNode.textContent && anchorNode.textContent[i] !== '\u200B') {
            return selection.setBaseAndExtent(anchorNode, i, anchorNode, i);
          }
        }

        // if hitting 0 and still no textContent
        while (indexOfTextNode > 0) {
          indexOfTextNode--;
          const currentTextNode = textNodes[indexOfTextNode];
          const content = currentTextNode.textContent;
          if (!content) continue;
          if (content === '\u200B\u200B') {
            return selection.setBaseAndExtent(currentTextNode, 1, currentTextNode, 1);
          }
          for (let i = content.length; i > 0; i--) {
            if (content[i - 1] !== '\u200B') {
              return selection.setBaseAndExtent(currentTextNode, i, currentTextNode, i);
            }
          }
        }
        return;

        // old below
        // selection.setBaseAndExtent(anchorNode, anchorOffset-1, anchorNode, anchorOffset-1);
      }
      else {

        // if hitting 0 and still no textContent
        while (indexOfTextNode > 0) {
          indexOfTextNode--;
          const currentTextNode = textNodes[indexOfTextNode];
          const content = currentTextNode.textContent;
          if (!content) continue;
          if (content === '\u200B\u200B') {
            return selection.setBaseAndExtent(currentTextNode, 1, currentTextNode, 1);
          }
          for (let i = content.length; i > 0; i--) {
            console.log({
              "content.length": content.length,
              "i": i,
              "content[i-1]": content[i - 1],
              "content[i-1] === '\u200B'": content[i - 1] === '\u200B',
            })
            if (content[i - 1] !== '\u200B') {
              return selection.setBaseAndExtent(currentTextNode, i, currentTextNode, i);
            }
          }
        }
        return;

        // const thisIndex = textNodes.findIndex(tn => tn === selection.anchorNode);

        // if (thisIndex > 0) {
        //   const leftTextNode = textNodes[thisIndex - 1];
        //   if (!leftTextNode) return;
        //   selection.setBaseAndExtent(leftTextNode, leftTextNode.textContent?.length || 0, leftTextNode, leftTextNode.textContent?.length || 0);
        // } else return;
      }


    } else if (moveDirection === "right") {

      // console.log("moving right from ", anchorNode, anchorOffset, anchorNode.textContent[anchorOffset]);

      if (anchorNode.textContent && anchorOffset < anchorNode?.textContent?.length) {

        console.log(anchorNode.textContent[anchorOffset], anchorNode.textContent[anchorOffset] !== '\u200B');
        if (anchorNode.textContent[anchorOffset] !== '\u200B') {
          return selection.setBaseAndExtent(anchorNode, anchorOffset + 1, anchorNode, anchorOffset + 1);
        }
        else { // if hitting edge of text
          // console.log("hitting else");
          for (let i = anchorOffset + 1; i <= anchorNode?.textContent?.length; i++) {
            if (anchorNode.textContent[i - 1] !== '\u200B') {
              console.log("setting anchorNode before", anchorNode.textContent[i])
              return selection.setBaseAndExtent(anchorNode, i, anchorNode, i);
            }
          }

          // console.log("leaving this text node");

          while (indexOfTextNode < textNodes.length) {
            console.log(indexOfTextNode, textNodes.length);
            indexOfTextNode++;
            console.log(indexOfTextNode, textNodes.length);
            const currentTextNode = textNodes[indexOfTextNode];
            if (!currentTextNode) continue;
            const content = currentTextNode.textContent;
            if (!content) continue;
            if (content === '\u200B\u200B') {
              return selection.setBaseAndExtent(currentTextNode, 1, currentTextNode, 1);
            }
            for (let i = 0; i < content.length; i++) {
              if (content[i] !== '\u200B') {
                // console.log("setting anchorNode before", content);
                return selection.setBaseAndExtent(currentTextNode, i, currentTextNode, i);
              }
            }
          }
        }

        // old
        // selection.setBaseAndExtent(anchorNode, anchorOffset+1, anchorNode, anchorOffset+1);
      }
      else {

        // console.log("from the else block");
        console.log(indexOfTextNode, textNodes.length);


        while (indexOfTextNode < textNodes.length) {
          console.log(indexOfTextNode, textNodes.length);
          indexOfTextNode++;
          console.log(indexOfTextNode, textNodes.length);
          const currentTextNode = textNodes[indexOfTextNode];
          if (!currentTextNode) continue;
          const content = currentTextNode.textContent;
          if (!content) continue;
          if (content === '\u200B\u200B') {
            return selection.setBaseAndExtent(currentTextNode, 1, currentTextNode, 1);
          }
          for (let i = 0; i < content.length; i++) {
            if (content[i] !== '\u200B') {
              return selection.setBaseAndExtent(currentTextNode, i, currentTextNode, i);
            }
          }
        }

        return;


        // const thisIndex = textNodes.findIndex(tn => tn === selection.anchorNode);

        // if (thisIndex < textNodes.length - 1) {
        //   const rightTextNode = textNodes[thisIndex + 1];
        //   if (!rightTextNode) return;
        //   selection.setBaseAndExtent(rightTextNode, 0, rightTextNode, 0);
        // } else return;
      }
    }

    // handle check for zero width space character, recursion
    // if (
    //   selection &&
    //   selection.anchorNode &&
    //   selection.anchorNode.textContent &&
    //   (
    //     selection?.anchorNode?.textContent[selection.anchorOffset] === "\u200B" ||
    //     selection?.anchorNode?.textContent[selection.anchorOffset] === undefined 
    //   )
    // ) {
    //   moveSelection(selection, limitingContainer, moveDirection);
    // }
    return;

  }

  else {

    console.log(moveDirection, direction);

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


    // shiftSelection(selection, limitingContainer, moveDirection);
    // selection.setBaseAndExtent(focusNode, focusOffset, focusNode, focusOffset);
  }
}



export function shiftSelection(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right") {

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  if (selection.rangeCount === 0) return;
  if (!anchorNode || !focusNode) return;

  const textNodes = getAllTextNodes([limitingContainer]);
  let indexOfTextNode = textNodes.findIndex(tn => tn === focusNode);


  if (moveDirection === "left") {

    if (focusOffset > 0) {
      for (let i = focusOffset - 1; i > 0; i--) {
        // if (focusNode.textContent && focusNode.textContent[i] !== '\u200B') {
        //   return selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, i);
        // }
        if (isValidTextEndpoint(focusNode, i)) {
          return selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, i);
        }
      }
    }

    indexOfTextNode--;

    while (indexOfTextNode >= 0) {
      const currentTextNode = textNodes[indexOfTextNode];
      const content = currentTextNode.textContent;
      // console.log("new text node:", content);
      if (!content) continue;

      for (let i = content.length - 1; i >= 0; i--) {
        console.log({ textNodes, indexOfTextNode, currentTextNode, focusOffset: i });
        // if (content[i] !== '\u200B') {
        //   return selection.setBaseAndExtent(anchorNode, anchorOffset, currentTextNode, i);
        // }
        if (isValidTextEndpoint(currentTextNode, i)) {
          return selection.setBaseAndExtent(anchorNode, anchorOffset, currentTextNode, i);
        }
      }
      indexOfTextNode--;
    }
    return;
  } else if (moveDirection === "right") {

    if (focusNode.textContent && focusOffset < focusNode.textContent.length) {
      for (let i = focusOffset + 1; i < focusNode.textContent.length; i++) {
        console.log({ textNodes, indexOfTextNode, focusNode, i })
        // if (focusNode.textContent[i] !== '\u200B') {
        //   return selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, i);
        // }
        if (isValidTextEndpoint(focusNode, i)) {
          return selection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, i);
        }

      }
    }

    indexOfTextNode++;

    while (indexOfTextNode < textNodes.length) {
      const currentTextNode = textNodes[indexOfTextNode];
      const content = currentTextNode.textContent;
      // console.log("new text node:", content);
      if (!content) continue;
      const stoppingPoint = (indexOfTextNode === (textNodes.length - 1)) ?
        content.length + 1 :
        content.length;
      for (let i = 0; i < stoppingPoint; i++) {
        // if (content[i] !== '\u200B') {
        //   return selection.setBaseAndExtent(anchorNode, anchorOffset, currentTextNode, i);
        // }
        if (isValidTextEndpoint(currentTextNode, i)) {
          return selection.setBaseAndExtent(anchorNode, anchorOffset, currentTextNode, i);
        }
      }
      indexOfTextNode++;
    }


  }
}


