import React from "react";
import { ReactElement } from "react";
import { ZWS_RE } from "./constants";


/**
 * Takes a node, and an offset, as would come from a range's startContainer and 
 * startOffset or its endContainer and endOffset, also takes a boolean which 
 * determines whether cushion nodes (every character is a zero-width space) are 
 * acceptable. 
 * @param node 
 * @param offset 
 * @param acceptEmptyCushionNodes 
 * @returns 
 */
export function isValidTextEndpoint(node: Node, offset: number, acceptEmptyCushionNodes: boolean = true) {
  
  if (node.nodeType !== Node.TEXT_NODE) return false;
  
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


/** WORK IN PROGRESS
 * 
 * @param content 
 * @param initialOffset 
 */
export function getNearestValidOffset(content: string, initialOffset: number) {
  for (let i=1; i<content.length; i++) {
    if (
      (initialOffset - i) >= 0 &&
      content[initialOffset - 1] !== '\u200B' 
    ) {
      return initialOffset - i + 1;
    } else {
      initialOffset + i
    }
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


/**
 * Returns all nodes (elements and text) which descend from a 
 * limitingContainer node and begin and/or end within the given
 * range
 * @param range 
 * @param limitingContainer 
 * @returns 
 */
export function getRangeChildNodes(range: Range, limitingContainer: Node): Array<Node> {

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

  // might be unnecessary
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
 * Looks for the last acceptable place in a cursor to put a text node,
 * and returns its index. If a maxOffset is included, the maxOffset will
 * be the highest possible number returned, meaning the function will
 * search backwards from that index. If there is no maxOffset returned,
 * the highest potential index would be the length of the text node + 1,
 * meaning after all of the contents of the text node. 
 * - If a text node has no text content, returns 0
 * - If a text node is fully cushioned but otherwise empty, returns 1 (after
 *   one zero-width space and before all others)
 * - If a maxOffset is provided, returns the highest index equal to or less 
 *   than that maxOffset provided that textNode.textContent[index] is equal
 *   to a valid character (non-zero-width space)
 * - Otherwise returns one GREATER than the last index where 
 *   textNode.textContent[index] equal to a valid character, ie. AFTER the last
 *   valid character
 * @param textNode 
 * @param maxOffset 
 * @returns 
 */
export function getLastValidCharacterIndex(textNode: Text, acceptEmptyCushionNodes: boolean = true, maxOffset?: number): number {
  if (!textNode.textContent) return 0;

  const content = textNode.textContent;

  // if node is cushioned but empty of valid characters
  if (content.split("").every(ch => ch === '\u200B')) {
    if (acceptEmptyCushionNodes) return 1;
    else return -1;
  }

  else if (maxOffset !== undefined) {
    for (let i=maxOffset; i>=0; i--) {
      if (
        textNode.textContent[i] && 
        textNode.textContent[i].match("[^\u200B]")
      ) {
        // console.log("returning ", i+1);
        return i;
      }
    }
    return 0;
  }

  // if last character is not zero width space, return full length
  else if (content[content.length - 1] !== '\u200B') {
    return textNode.textContent.length;
  }

  // else move backwards, return after last valid (non-zws) character
  for (let i=textNode.length-1; i>=0; i--) {
    if (textNode.textContent[i].match("[^\u200B]")) {
      console.log("returning ", i+1);
      return i+1;
    }
  }
  // fallback
  return -1;
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


/**
 * Identify all text nodes which should be deleted because they 
 * meet the following criteria:
 * - Neither the first nor last text node
 * - They are empty except for zero width spaces
 * - They are direct descendants of the container
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