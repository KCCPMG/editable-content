import { WrapperArgs } from "@/components";
import React from "react";
import { ReactElement } from "react";
import { ZWS_RE } from "./constants";



export function setSelection(startContainer: Node, startOffset: number, endContainer: Node, endOffset: number) {
  const range = new Range();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);      

  return selection;
}


export function isValidTextEndpoint(node: Node, offset: number, acceptEmptyCushionNodes: boolean = true) {
  const content = node.textContent;

  if (content===null) return false;

  else if (offset > content.length) return false;

  else if (content.split("").every(ch => ch === '/u200B')) {
    if (!acceptEmptyCushionNodes) return false;
    else {
      if (offset > 0) return true;
      else return false;
    }
  }

  else if (content[offset] === '\u200B') return false;

  else return true;

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

  // console.log(range.startContainer, range.startContainer.nodeType !== Node.TEXT_NODE, range.endContainer.nodeType !== Node.TEXT_NODE);

  console.log("resetting range to text nodes");

  const collapsed = range.collapsed;


  console.log({range});

  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    const startNode = range.startContainer.childNodes[range.startOffset];
    if (!startNode) return null;
    const tw = document.createTreeWalker(startNode);
    while (true) {
      if (tw.currentNode.nodeType === Node.TEXT_NODE) {

        const currentNode = tw.currentNode;
        const content = currentNode.textContent;

        if (!content || (content.length === 0)) {
          console.log("first if");
          range.setStart(currentNode, 0);
          break;
        }

        // if purely cushioned node, place after first zero-width space
        if (tw.currentNode.textContent?.split("").every(ch => ch === '\u200B')) {
          console.log("second if");
          range.setStart(tw.currentNode, 1);
          break;
        }

        // otherwise place before first non-zero-width space
        else {
          for (let i=0; i<content.length; i++) {
            console.log("third if");
            console.log(currentNode);
            if (content[i] !== '\u200B') {
              range.setStart(currentNode, i);
              break;
            }
          }
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

    console.log("startContainer is text node");    

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
      console.log("second if");
      range.setStart(currentNode, 1);
    }

    // go outwards from startOffset to find nearest non-zws
    else for (let i=1; i<content.length; i++) {
      console.log("last for loop ", i);
      if (
        range.startOffset - i >= 0 &&
        content[range.startOffset - i] !== '\u200B'
      ) {
        range.setStart(currentNode, range.startOffset-i+1);
        break;
      } else if (
        range.startOffset <= content.length &&
        content[range.startOffset + i]
      ) {
        range.setStart(currentNode, range.startOffset+i-1);
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

  console.log("after setting start", range.startContainer, range.startOffset);

  if (collapsed) {
    range.setEnd(range.startContainer, range.startOffset);
  }

  else if (range.endContainer.nodeType !== Node.TEXT_NODE) {

    console.log("sanity check 1");
    const commonAncestor = range.commonAncestorContainer;

    let lastTextNode = range.startContainer;
    const tw = document.createTreeWalker(commonAncestor);
    // advance to new start container
    while (tw.currentNode !== range.startContainer) {
      console.log("sanity check 2");
      tw.nextNode();
    }
    while (range.isPointInRange(tw.currentNode, 0)) {
      console.log("sanity check 3");
      if (tw.currentNode.nodeType === Node.TEXT_NODE) {
        lastTextNode = tw.currentNode;
      }  
      if (!tw.nextNode()) break; // advance tw, break loop if null
    }
    console.log("sanity check 4");
    range.setEnd(lastTextNode, lastTextNode.textContent?.length || 0);
  }

  return range;
}


function generateQueryFromElement(element: Element) : string 
{
  return element.tagName.toLowerCase() + Array.from(element.attributes).map(attr => {
    return `[${attr.name}="${attr.value}"]`
  }).join("");

}



export function wrapInElement(selection: Selection, element: Element, limitingContainer: Element): void {
  if (!selection) return;

  const unbreakables: Array<Node> = [];

  // TODO: if start container or end container are in unbreakable elements which are not the same, move selection away
  

  resetSelectionToTextNodes();
  const range = selection.getRangeAt(0);

  const query = generateQueryFromElement(element);

  const contents = range.extractContents();
  const childNodes = contents.childNodes
  const targetedNodes = Array.from(childNodes).filter(cn => {
    return (cn instanceof Element && cn.matches(query));
  });
  targetedNodes.forEach(tn => promoteChildrenOfNode(tn));

  // determine if there are unbreakables in selection
  for (let cn of Array.from(contents.childNodes)) {
    if (cn instanceof Element && cn.matches('[data-unbreakable]')) {
      unbreakables.push(cn);
    }
  }

  element.append(contents); 
  range.insertNode(element); // range is collapsed, this effectively inserts *after*
  range.setStartBefore(element);
  range.setEndAfter(element);

  if (range.toString().length === 0) {
    const textNode = document.createTextNode('\u200B');
    element.append(textNode);
    range.setStart(textNode, 0);
    range.setEnd(textNode, textNode.length);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // promote any unbreakable elements in range
  for (let unbreakable of unbreakables) {
    const unbreakableRange = new Range();
    unbreakableRange.setStart(unbreakable, 0);
    unbreakableRange.setEnd(unbreakable, unbreakable.childNodes.length);
    // // unwrapRangeFromQuery(unbreakableRange, query, )
    // breakpoints.push([unbreakableRange.startContainer, unbreakableRange.startOffset]);
    // breakpoints.push([unbreakableRange.endContainer, unbreakableRange.endOffset]);


    if (unbreakableRange.startContainer.nodeType !== Node.TEXT_NODE) {
      const startNode = unbreakableRange.startContainer.childNodes[unbreakableRange.startOffset];
      const tw = document.createTreeWalker(startNode);
      while (true) {
        if (tw.currentNode.nodeType === Node.TEXT_NODE) {
          unbreakableRange.setStart(tw.currentNode, 0);
          break;
        } else tw.nextNode();
      }
    }

    if (unbreakableRange.endContainer.nodeType !== Node.TEXT_NODE) {

      const commonAncestor = unbreakableRange.commonAncestorContainer;

      let lastTextNode = unbreakableRange.startContainer;
      const tw = document.createTreeWalker(commonAncestor);
      // advance to new start container
      while (tw.currentNode !== unbreakableRange.startContainer) {
        tw.nextNode();
      }
      while (unbreakableRange.isPointInRange(tw.currentNode, 0)) {
        if (tw.currentNode.nodeType === Node.TEXT_NODE) {
          lastTextNode = tw.currentNode;
        }  
        if (!tw.nextNode()) break; // advance tw, break loop if null
      }
      unbreakableRange.setEnd(lastTextNode, lastTextNode.textContent?.length || 0);
    }

    unwrapRangeFromQuery(unbreakableRange, query, limitingContainer)

  }

  deleteEmptyElements(limitingContainer);
  resetSelectionToTextNodes();
}

/**
 * Delete all elements within a limitingContainer Element if
 * those elements match a query and have no childNodes
 * @param query 
 * @param limitingContainer 
 * @returns 
 */
export function deleteEmptyElementsByQuery(query: string, limitingContainer: Element) {
  const elements = Array.from(limitingContainer.querySelectorAll(query));
  
  elements.forEach(elem => {
    if ((elem.textContent) === "" && Array.from(elem.childNodes).every(cn => !(cn instanceof Element))) {
      elem.remove();
    }
  })

  return;

}


/**
 * Delete all elements within a limitingContainer Element if those
 * elements have no text
 * @param limitingContainer 
 */
export function deleteEmptyElements(limitingContainer: Element) {
  const elements = Array.from(limitingContainer.querySelectorAll("*"));

  const emptyElements = elements
  .filter(e => e.tagName !== "BR")
  .filter(e => e.textContent === "");
  emptyElements.forEach(ee => ee.remove());
}


/**
 * Promotes all text in a selection where it is a descendent of an element matching a given query. 
 * @param query 
 * @param limitingContainer 
 * @returns 
 */
export function unwrapSelectionFromQuery(selection: Selection, query: string, limitingContainer: Element): void {
  if (!selection || !selection.anchorNode || !selection.focusNode) return;

  resetSelectionToTextNodes();

  // Work with range instead of selection for start/end container clarity
  const range = selection.getRangeAt(0);
  if (range.toString().length === 0) {
    const textNode = document.createTextNode('\u200B');
    range.insertNode(textNode);
    range.setStart(textNode, 0);
    range.setEnd(textNode, textNode.length);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  return unwrapRangeFromQuery(range, query, limitingContainer);
}

export function unwrapRangeFromQuery(range: Range, query: string, limitingContainer: Element): void {

  // the range must necessarily have both the start and end each be within an ancestor node matching the query, which can be a common ancestor node
  
  const preAncestorNode = getAncestorNode(range.startContainer, query, limitingContainer); // assumes startContainer is text node
  if (!preAncestorNode) return;

  const preRange = new Range();
  preRange.setStartBefore(preAncestorNode);
  preRange.setEnd(range.startContainer, range.startOffset);
  const preRangeContents = preRange.extractContents();
  for (let cn of Array.from(preRangeContents.childNodes)) {
    preRange.insertNode(cn);
  }

  const postAncestorNode = getAncestorNode(range.endContainer, query, limitingContainer);

  if (!postAncestorNode) return;

  const postRange = new Range();
  postRange.setEndAfter(postAncestorNode);
  postRange.setStart(range.endContainer, range.endOffset);
  const postRangeContents = postRange.extractContents();
  for (let cn of Array.from(postRangeContents.childNodes)) {
    postRange.insertNode(cn);
  }

  // find matching ancestor nodes of start and end containers
  const startContainerAncestorNode = getAncestorNode(range.startContainer, query, limitingContainer);
  if (startContainerAncestorNode) {
    // promoteChildrenOfNode(startContainerAncestorNode)
    range.setStartBefore(startContainerAncestorNode);
  }

  const endContainerAncestorNode = getAncestorNode(range.endContainer, query, limitingContainer);
  if (endContainerAncestorNode) {
    // promoteChildrenOfNode(endContainerAncestorNode)
    range.setEndAfter(endContainerAncestorNode);
    // range.setEnd(endContainerAncestorNode, endContainerAncestorNode.childNodes.length)
    // range.setEnd(endContainerAncestorNode, 0);
  }
  
  // need to reset range or tw will fail in getSelectionChildNodes

  // const contents = range.extractContents();
  // for (let cn of Array.from(contents.childNodes)) {
  //   range.insertNode(cn);
  // }

  // promote children of all query-matching nodes in selection
  const childNodes = getRangeChildNodes(range, limitingContainer);
  const targetedNodes = childNodes.filter(cn => {
    return (cn instanceof Element && cn.matches(query));
  });
  targetedNodes.forEach(tn => promoteChildrenOfNode(tn));

  // will preAncestorNode and postAncestorNode necessarily be the same?
  // I still need to promote the actual selection out of the wrapper

  // const selectionAncestorNode = getAncestorNode(range.endContainer, query, limitingContainer);
  // if (!selectionAncestorNode) return;
  // const selectionAncestorRange = new Range();
  // selectionAncestorRange.setStartBefore(selectionAncestorNode);
  // selectionAncestorRange.setEndAfter(selectionAncestorNode);
  // const selectionAncestorContents = selectionAncestorRange.extractContents();
  // for (let cn of Array.from(selection.getRangeAt(0).extractContents))
  // if (selectionAncestorNode) {
  //   // 
  //   promoteChildrenOfNode(selectionAncestorNode);
  // }




  // finally clean up empty elements of this query
  // deleteEmptyElementsByQuery(query, limitingContainer);
  deleteEmptyElements(limitingContainer);

  resetSelectionToTextNodes();

  return;
}



/**
 * Replaces a given node with its contents
 * @param node 
 */
export function promoteChildrenOfNode(node: Node): void {
  if (node.parentNode) {
    for (let child of Array.from(node.childNodes)) {
      node.parentNode.insertBefore(child, node);
    }
    node.parentNode.removeChild(node);
  }
}



export function nodeIsDescendentOf(node: Node, query: string, limitingContainer: Node) {
  let parentNode = node.parentNode;
  while (parentNode) {
    if (parentNode === limitingContainer) break;
    if (parentNode instanceof Element && parentNode.matches(query)) {
      return true;
    } else {
      parentNode = parentNode.parentNode;
    }
  }
  return false;
}


export function getAncestorNode(node: Node, query: string, limitingContainer: Node): Node | null {
  let parentNode = node.parentNode;
  while (parentNode) {
    if (parentNode === limitingContainer) break;
    if (parentNode instanceof Element && parentNode.matches(query)) {
      return parentNode;
    } else {
      parentNode = parentNode.parentNode;
    }
  }
  return null;

}


export function getRangeLowestAncestorElement(range: Range): Element | null {
  const commonContainer = range.commonAncestorContainer;
  return getNodeLowestAncestorElement(commonContainer);
}


function getNodeLowestAncestorElement(node: Node): Element | null {
  // if (node.nodeType === Node.ELEMENT_NODE) return node;
  if (node instanceof Element) return node;
  else {
    const parentNode = node.parentNode;
    if (parentNode) return getNodeLowestAncestorElement(parentNode);
    else return null;
  }
}

export function moveSelection(selection: Selection, limitingContainer: Element, moveDirection: "left" | "right") {

  const direction = getSelectionDirection(selection);
  const {anchorNode, anchorOffset, focusNode, focusOffset} = selection;
  if (selection.rangeCount === 0) return;
  if (!anchorNode || !focusNode) return;

  const textNodes = getAllTextNodes([limitingContainer]);


  // range is collapsed
  if (direction === "none") {

    let indexOfTextNode = textNodes.findIndex(tn => tn === anchorNode);

    if (moveDirection === "left") {

      if (anchorOffset > 0) {

        for (let i=anchorOffset-1; i>=0; i--) {
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
          for (let i=content.length; i>0; i--) {
            if (content[i-1] !== '\u200B') {
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
          for (let i=content.length; i>0; i--) {
            console.log({
              "content.length": content.length,
              "i": i,
              "content[i-1]": content[i-1],
              "content[i-1] === '\u200B'": content[i-1] === '\u200B',
            })
            if (content[i-1] !== '\u200B') {
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

      if (anchorNode.textContent && anchorOffset<anchorNode?.textContent?.length) {

        console.log(anchorNode.textContent[anchorOffset], anchorNode.textContent[anchorOffset] !== '\u200B');
        if (anchorNode.textContent[anchorOffset] !== '\u200B') {
          return selection.setBaseAndExtent(anchorNode, anchorOffset+1, anchorNode, anchorOffset+1);
        } 
        else { // if hitting edge of text
          console.log("hitting else");
          for (let i=anchorOffset+1; i<=anchorNode?.textContent?.length; i++) {
            if (anchorNode.textContent[i-1] !== '\u200B') {
              console.log("setting anchorNode before", anchorNode.textContent[i])
              return selection.setBaseAndExtent(anchorNode, i, anchorNode, i);
            }
          }

          console.log("leaving this text node")

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
            for (let i=0; i<content.length; i++) {
              if (content[i] !== '\u200B') {
                console.log("setting anchorNode before", content);
                return selection.setBaseAndExtent(currentTextNode, i, currentTextNode, i);
              }
            }
          }
        }

        // old
        // selection.setBaseAndExtent(anchorNode, anchorOffset+1, anchorNode, anchorOffset+1);
      }
      else {

        console.log("from the else block");
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
          for (let i=0; i<content.length; i++) {
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

  const {anchorNode, anchorOffset, focusNode, focusOffset} = selection;
  if (selection.rangeCount === 0) return;
  if (!anchorNode || !focusNode) return;

  const textNodes = getAllTextNodes([limitingContainer]);
  let indexOfTextNode = textNodes.findIndex(tn => tn === focusNode);


  if (moveDirection === "left") {
    
    if (focusOffset > 0) {
      for (let i=focusOffset-1; i>0; i--) {
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
      console.log("new text node:", content);
      if (!content) continue;

      for (let i=content.length-1; i>=0; i--) {
        console.log({textNodes, indexOfTextNode, currentTextNode, focusOffset: i});
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
  } else if (moveDirection==="right") {
    
    if (focusNode.textContent && focusOffset<focusNode.textContent.length) {
      for (let i=focusOffset+1; i<focusNode.textContent.length; i++) {
        console.log({textNodes, indexOfTextNode, focusNode, i})
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
      console.log("new text node:", content);
      if (!content) continue;    
      const stoppingPoint = (indexOfTextNode === (textNodes.length-1)) ?
        content.length + 1 :
        content.length;
      for (let i=0; i<stoppingPoint; i++) {
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


export function getSelectionDirection(selection: Selection | null) {
  if (!selection) return "none";
  if (selection.rangeCount === 0) return "none";
  
  const range = selection.getRangeAt(0);

  if (selection.anchorNode === selection.focusNode) {
    if (selection.anchorOffset === selection.focusOffset) return "none";
    if (selection.anchorOffset < selection.focusOffset) return "forward"
    else return "backward"
  }

  if (range.startContainer === selection.anchorNode) return "forward";
  if (range.startContainer === selection.focusNode) return "backward";
}


function nodeIsDescendentOfNode(node: Node, ancestorNode: Node) {
  let parentNode = node.parentNode;
  while (parentNode) {
    if (parentNode === ancestorNode) return true;
    parentNode = parentNode.parentNode;
  }
  return false;
}


/**
 * Returns boolean indicating if selection is within a given element
 * @param selection 
 * @param ancestorElement 
 * @returns 
 */
export function selectionIsDescendentOfNode(selection: Selection, ancestorElement: Element) {
  return (
    !!selection.anchorNode &&
    !!selection.focusNode &&
    (
      nodeIsDescendentOfNode(selection.anchorNode, ancestorElement) || 
      selection.anchorNode === ancestorElement
    ) &&
    (
      nodeIsDescendentOfNode(selection.focusNode, ancestorElement) ||
      selection.focusNode === ancestorElement
    )
  )
}


/**
 * Creates a TreeWalker to walk a range, returns all nodes;
 * siblings and children.
 * @param selection 
 * @param limitingContainer 
 * @returns 
 */
export function getSelectionChildNodes(selection: Selection, limitingContainer: Node): Array<Node> {
  if (!selection || 
    !selection.anchorNode || 
    !selection.focusNode ||
    !(limitingContainer.contains(selection.anchorNode)) ||
    !(limitingContainer.contains(selection.focusNode))
  ) return [];
  
  const range = selection.getRangeAt(0);
  return getRangeChildNodes(range, limitingContainer);
}


export function getRangeChildNodes(range: Range, limitingContainer: Node): Array<Node> {
  // assumes that startNode and endNode are text

  const { startContainer, startOffset, endContainer, endOffset } = range;


  const startNode = startContainer.hasChildNodes() ?
    startContainer.childNodes[startOffset] :
    startContainer 

  const endNode = endContainer.hasChildNodes() ?
    endContainer.childNodes[Math.max(0, endOffset-1)] : // [Math.max(0, endOffset-1)]
    endContainer 


  const tw = startNode === endNode ? 
    document.createTreeWalker(startNode) : 
    document.createTreeWalker(limitingContainer);

  // const tw = document.createTreeWalker(limitingContainer);

  const childNodes:Array<Node> = [];
  let inRange = false;

  while (true) {

    const currentNode = tw.currentNode;
    // if (currentNode) childNodes.push(currentNode);
    // else break;

    if (!currentNode) break;

    if (!inRange) {
      if (currentNode == startNode) {
        inRange = true;
      }
    }

    // not an else statement, can flip inRange switch and then progress
    if (inRange) {
      // childNodes.push(currentNode);
      // if (currentNode == endNode) break;

      // if we're at the end, wrap up
      if (currentNode == endNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          childNodes.push(currentNode);
        } 
        else {
          childNodes.push(currentNode);

          while (true) {
            if (!tw.nextNode()) break;
            if (!nodeIsDescendentOfNode(tw.currentNode, endNode)) break;
            // else
            childNodes.push(tw.currentNode);
          }
        }
        break;
      } else {
        childNodes.push(currentNode);
      }
    }

    if (!tw.nextNode()) break;

  }
  return childNodes;

  // const firstIndex = childNodes.findIndex(cn => cn === selection.getRangeAt(0).startContainer);

  // return Array.from(selection.getRangeAt(0).cloneContents().childNodes)
}


/**
 * Checks if all text in selection is covered by one or more elements matching a given query, 
 * provided all are within a limitingContainer Node
 * @param selection 
 * @param query 
 * @param limitingContainer 
 * @returns 
 */
export function selectionIsCoveredBy(selection: Selection, query: string, limitingContainer: Node): Boolean {

  const nodes = getSelectionChildNodes(selection, limitingContainer);
  const textNodes = nodes
  .filter(n => n.nodeType === Node.TEXT_NODE);
   
  return textNodes.every(tn => nodeIsDescendentOf(tn, query, limitingContainer));

}


export function selectionHasTextNodes(selection: Selection, limitingContainer: Element) {
  const childNodes = getSelectionChildNodes(selection, limitingContainer);
  return childNodes.some(cn => cn.nodeType === Node.TEXT_NODE);
}


export function generateQuery({element, classList, id, unbreakable, attributes}: WrapperArgs): string {
  const classListString = (classList && classList.length > 0) ? classList.map(c => "."+c).join("") : "";
  const idString = id ? "#"+id : "";
  const unbreakableString = unbreakable ? "[data-unbreakable]" : "";

  const attributesString = attributes ? 
    Object.entries(attributes)
      .map(a => {
        const [k, v] = a;
        if (v) return `[${k}="${v}"]`;
        else return `[${k}]`;
      })
      .join(""):
    "";

  // return element + classListString + idString + unbreakableString + attributesString;
  return element + idString + unbreakableString + attributesString;
}


export function createWrapper({element, classList, id, unbreakable, attributes, eventListeners}: WrapperArgs, document: Document): HTMLElement {

  const wrapper = document.createElement(element);
  if (classList) {
    classList.forEach(cl => {
      wrapper.classList.add(cl);
    });
  }
  if (id) {
    wrapper.setAttribute('id', id);
  }
  if (attributes) {
    for (let [k, v] of Object.entries(attributes)) {
      if (v) wrapper.setAttribute(k, v);
      else wrapper.setAttribute(k, '');
    }
  }
  // do this last to override any potential conflict in the attributes
  if (unbreakable) {
    wrapper.setAttribute('data-unbreakable', '');
  } else {
    wrapper.removeAttribute('data-unbreakable');
  }

  if (eventListeners) {
    for (let [event, callback] of Object.entries(eventListeners)) {
      wrapper.addEventListener(event, callback);
    }
  }

  return wrapper;
}


export function selectionContainsOnlyText(selection: Selection, limitingContainer: Node, query: string) {
  const childNodes = getSelectionChildNodes(selection, limitingContainer);
  return (
    childNodes.every(cn => cn.nodeType === Node.TEXT_NODE) && 
    (
      childNodes.every(cn => (
        cn.parentNode instanceof Element && 
        cn.parentNode.matches(query)
      )) ||
      childNodes.every(cn => cn.parentNode === limitingContainer)
    )
  );
}


export function selectionContainsNoUnbreakables(selection: Selection, limitingContainer: Node) {
  const childNodes = getSelectionChildNodes(selection, limitingContainer);
  return (
    childNodes.every(cn => !nodeIsDescendentOf(cn, "[data-unbreakable]", limitingContainer))
  )
}


export function getButtonStatus(selection: Selection | null, isUnbreakable: boolean | undefined, query: string, limitingContainer: Node | null) {

  const status = {
    enabled: true,
    selected: false
  }

  //might be unnecessary
  if (!limitingContainer || !selection || selection.rangeCount == 0) {
    status.enabled = false;
    status.selected = false;
    return status;
  }

  if (!selection || !limitingContainer) {
    status.enabled = false;
    status.selected = false;
    return status;
  }

  // might be unneccessary
  if (!(limitingContainer instanceof Element)) {
    status.enabled = false;
    status.selected = false;
    return status;
  }

  if (!selectionIsDescendentOfNode(selection, limitingContainer)) {
    status.enabled = false;
    status.selected = false;
    return status;
  }
  
  const childNodes = getSelectionChildNodes(selection, limitingContainer);
  if (selection.rangeCount === 0) {
    status.enabled = false;
    status.selected = false;
    return status;   
  }
  const range = selection.getRangeAt(0)

  const rangeCommonElementAncestor = getRangeLowestAncestorElement(range);

  if (isUnbreakable) {

    if (childNodes.every(cn => cn.nodeType === Node.TEXT_NODE)) {

      if (childNodes.every(cn => cn.parentNode === limitingContainer)) {
        status.enabled = true;
        status.selected = false;
        return status;
      } 
      else if (rangeCommonElementAncestor && (
        rangeCommonElementAncestor.matches(query)) ||
        nodeIsDescendentOf(rangeCommonElementAncestor!, query, limitingContainer)
      ) {
        status.enabled = true;
        status.selected = true;
        return status;
      } 
      else {
        status.enabled = false;
        status.selected = false;
        return status;
      }
    }
    else {
      status.enabled = false;
      status.selected = false;
      return status;
    }

  }

  else {
    if (!selectionContainsNoUnbreakables(selection, limitingContainer)) {
      status.enabled = false;
    }

    if (selectionIsCoveredBy(selection, query, limitingContainer)) {
      status.selected = true;
    } else status.selected = false;
  }


  return status;
}



export function getAllTextNodes(nodes: Array<Node>): Array<Text> {
  const textNodes: Array<Text> = [];
  
  // let currentNode = node;

  function descendNode(cn: Node) {
    if (cn.nodeType === Node.TEXT_NODE) {
      textNodes.push(cn as Text);
    }
    if (cn.hasChildNodes()) {
      for (let nextGeneration of Array.from(cn.childNodes)) {
        descendNode(nextGeneration);
      }
    }
  }

  for (let currentNode of nodes) {
    descendNode(currentNode);
  }

  return textNodes;
}


export function getLastValidTextNode(textNodeArr: Array<Text>) {
  for (let i=textNodeArr.length-1; i>=0; i--) {
    const textNode = textNodeArr[i];
    if (textNode.textContent?.match("[^\u200B]")) return textNode;
  } 
  return textNodeArr[0];
}


/**
 * Look for place to put cursor at end of text node
 * Finds last valid (non-zero width space) character in a text node,
 * returns its index
 * If text node is only zero width spaces, return 1
 * If no text return 0
 * @param textNode 
 * @returns number
 */
export function getLastValidCharacterIndex(textNode: Text): number {
  if (!textNode.textContent) return 0;

  const content = textNode.textContent;

  // if node is cushioned but empty of valid characters
  if (content.split("").every(ch => ch === '\u200B')) {
    return 1;
  }

  // if last character is not zero width space, return full length
  if (content[content.length - 1] !== '\u200B') {
    console.log("returning ", textNode.textContent.length);
    return textNode.textContent.length;
  }

  // else move backwards, return after last valid (non-zws) character
  for (let i=textNode.length-1; i--; i>=0) {
    if (textNode.textContent[i].match("[^\u200B]")) {
      console.log("returning ", i+1);
      return i+1;
    }
  }
  // fallback
  return 0;
}

export function getIsReactComponent(component: ReactElement) {
  if (!React.isValidElement(component)) return false;
  return (typeof component.type === "function" || 
    typeof component.type === "object");
}


export function textNodeIsCushioned(textNode: Text) {
  const content = textNode.textContent;
  if (!content) return false;
  return !!(
    content.length >= 2 &&
    content[0] === '\u200B' &&
    content[content.length - 1] == '\u200B' &&
    content.slice(1, content.length - 1).match(ZWS_RE) === null
  );
}


export function cushionTextNode(textNode: Text) {
  if (!textNode.textContent) return;

  if (textNode.textContent.length === 0) {
    textNode.insertData(0, '\u200B\u200B');
    return;
  }

  if (textNode.textContent.length === 1) {
    if (textNode.textContent[0] === '\u200B') {
      textNode.insertData(1, '\u200B');
      return;
    }
    // else continue
  }

  if (textNode.textContent[0] !== '\u200B') textNode.insertData(0, '\u200B');
  if (textNode.textContent[textNode.textContent.length - 1] !== '\u200B') {
    textNode.insertData(textNode.textContent.length, '\u200B');
  }
  for (let i=textNode.textContent.length-2; i>1; i--) {
    if (textNode.textContent[i] === '\u200B') {
      textNode.deleteData(i, 1);
    }
  } 
  // const cleanedContent = textNode.textContent.replaceAll('\u200B', '');
  // textNode.textContent = '\u200B' + cleanedContent + '\u200B';
}


export function resetTextNodesCushions(textNodes: Array<Text>) {
  textNodes.forEach(tn => {
    if (!textNodeIsCushioned(tn)) cushionTextNode(tn);
  })
}


/**
 * Identify all text nodes which should be deleted because they 
 * meet the following criteria:
 * - Neither the first nor last text node
 * - They are empty except for zero width spaces
 * - They are direct descendents of the container
 * - They are not in the current selection
 */
export function identifyBadTextNodes(textNodes: Array<Text>, parentContainer: Node) {
  const selection = window?.getSelection() || null;

  if (textNodes.length <= 2) return [];
  else return textNodes.slice(1, textNodes.length-1).filter(tn => {
    return (
      tn.textContent === '\u200B\u200B' &&
      tn.parentNode === parentContainer && 
      (!(selection && selection.containsNode(tn)))
    )
  })
}