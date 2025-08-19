import React from "react";
import { ReactElement } from "react";
import { ZWS_RE } from "./constants";
import { cushionTextNode } from "./dom_operations";


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
  if (content === null) return false;

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
  for (let i = 1; i < content.length; i++) {
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
    endContainer.childNodes[Math.max(0, endOffset - 1)] : // [Math.max(0, endOffset-1)]
    endContainer


  const tw = startNode === endNode ?
    document.createTreeWalker(startNode) :
    document.createTreeWalker(limitingContainer);

  // const tw = document.createTreeWalker(limitingContainer);

  const childNodes: Array<Node> = [];
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
  for (let i = textNodeArr.length - 1; i >= 0; i--) {
    const textNode = textNodeArr[i];
    if (
      textNode.textContent?.match("[^\u200B]") ||
      (
        textNode.previousSibling &&
        textNode.previousSibling.nodeType === Node.ELEMENT_NODE &&
        (textNode.previousSibling as Element).tagName === "BR"
      )
    ) {

      return textNode;
    }
  }
  return textNodeArr[0];
}


/**
 * Looks for the last acceptable place in a cursor to put a text node,
 * and returns its index. If a maxOffset is included, the maxOffset will
 * be the highest possible number returned, meaning the function will
 * search backwards from that index. If there is no maxOffset returned,
 * the highest potential index would be the length of the text node,
 * meaning after all of the contents of the text node. 
 * - If a text node has no text content, returns 0
 * - If a text node is fully cushioned but otherwise empty, returns 1 (after
 *   one zero-width space and before all others)
 * - If a maxOffset is provided, returns the highest index equal to or less 
 *   than that maxOffset provided that textNode.textContent[index] is equal
 *   to a valid character (non-zero-width space *on at least one side*)
 * - Otherwise returns one GREATER than the last index where 
 *   textNode.textContent[index] equal to a valid character, ie. AFTER the last
 *   valid character
 * @param textNode 
 * @param maxOffset 
 * @returns 
 */
export function getLastValidCharacterIndex(textNode: Text, acceptEmptyCushionNodes: boolean = true, maxOffset?: number): number {
  if (!textNode.textContent) {
    if (acceptEmptyCushionNodes) return 0;
    else return -1;
  }

  const content = textNode.textContent;

  // if node is cushioned but empty of valid characters
  if (content.split("").every(ch => ch === '\u200B')) {
    if (acceptEmptyCushionNodes) return 1;
    else return -1;
  }

  else if (maxOffset !== undefined) {
    for (let i = maxOffset; i >= 0; i--) {
      if (
        (
          textNode.textContent[i] &&
          textNode.textContent[i].match("[^\u200B]")
        ) ||
        (
          textNode.textContent[i - 1] &&
          textNode.textContent[i - 1].match("[^\u200B]")
        )
      ) {
        // console.log("returning ", i+1);
        return i;
      }
    }
    if (acceptEmptyCushionNodes) return 0;
    else return -1;
  }

  // if last character is not zero width space, return full length
  else if (content[content.length - 1] !== '\u200B') {
    return textNode.textContent.length;
  }

  // else move backwards, return after last valid (non-zws) character
  for (let i = textNode.length - 1; i >= 0; i--) {
    if (textNode.textContent[i].match("[^\u200B]")) {
      // console.log("returning ", i+1);
      return i + 1;
    }
  }
  // fallback
  return -1;
}

/**
 * Takes two text nodes and determines if they are uninterrupted siblings, 
 * meaning they have the same parent and there are no non-text nodes between them
 * @param node1 
 * @param node2 
 */
export function areUninterruptedSiblingTextNodes(node1: Text, node2: Text): boolean {
  if (node1.parentNode !== node2.parentNode) return false;
  const parentNode = node1.parentNode;
  if (parentNode === null) return false;


  const node1Index = Array.from(parentNode.childNodes).findIndex(node => node === node1);
  const node2Index = Array.from(parentNode.childNodes).findIndex(node => node === node2);

  const lowerNodeIndex = Math.min(node1Index, node2Index);
  const higherNodeIndex = Math.max(node1Index, node2Index);

  // go through range of siblings, including both text nodes, verify unbroken string of text
  for (let i = lowerNodeIndex; i <= higherNodeIndex; i++) {
    if (parentNode.childNodes[i].nodeType !== Node.TEXT_NODE) return false;
  }
  // else 
  return true;
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
 * - They do not follow a <br/> element
 */
export function identifyBadTextNodes(textNodes: Array<Text>, parentContainer: Node) {
  const selection = window?.getSelection() || null;

  if (textNodes.length <= 2) return [];
  else return textNodes.slice(1, textNodes.length - 1).filter(tn => {
    return (
      tn.textContent === '\u200B\u200B' &&
      tn.parentNode === parentContainer &&
      (!(selection && selection.containsNode(tn))) &&
      !(
        tn.previousSibling &&
        tn.previousSibling.nodeType === Node.ELEMENT_NODE &&
        (tn.previousSibling as Element).tagName === "BR"
      )
    )
  })
}




/**
 * Returns full match object for found regular expression using generator 
 * created by matchAll and global flag, takes as necessary inputs numbers
 * representing start and end of search range, and boolean for getLast. If
 * getLast is true, will return the last occurrence fitting all criteria, 
 * otherwise returns first occurrence
 * @param str 
 * @param sourceString 
 * @param startOffset 
 * @param endOffset 
 * @param getLast 
 * @returns 
 */
export function getReMatch(str: string, sourceString: string, startOffset: number, endOffset: number, getLast: boolean): null | RegExpExecArray {

  const safeRe = new RegExp(sourceString, 'g');
  const gen = str.matchAll(safeRe);

  let last: null | RegExpExecArray = null;

  while (true) {
    let current = gen.next();
    if (current.done === true) break;
    if (
      current.value &&
      current.value.index >= startOffset &&
      current.value.index <= endOffset
    ) {
      if (getLast) {
        last = current.value;
        continue;
      }
      else return current.value;
    }
  }

  return last;


}


type searchCombinedTextArgumentObject = {
  textNodes: Array<Text>,
  reSource: string,
  returnAfterMatch?: boolean,
  returnIndexOffset?: number,
  getLast?: boolean,
  startFrom?: {
    textNode: Text,
    nodeOffset: number
  } | null,
  upTo?: {
    textNode: Text,
    nodeOffset: number
  } | null
}

/**
 * Takes an object for its argument which includes a string, an array of text nodes
 * to be combined into a single string for the re. A start node and offset can be
 * specified, as can an end node and offset, and getLast can be used to return the
 * last occurrence in the range rather than the first. The function returns null if 
 * not found, or it returns an object with the text node and offset within that
 * text node corresponding to the start of the re. If the 'returnAfterMatch'
 * property is set to true, returns the value after the found re, alternatively
 * a number can be specified for returnIndexOffset, which will return the node
 * and offset which is that many characters after the start of the found re.
 * @param argumentObject 
 * @returns 
 */
export function searchCombinedText(argumentObject: searchCombinedTextArgumentObject) {

  const {
    textNodes,
    reSource,
    returnAfterMatch = false,
    returnIndexOffset = 0,
    getLast = false,
    startFrom = null,
    upTo = null
  } = argumentObject;


  // set up string
  const combinedString = textNodes.map(tn => tn.textContent).join("");

  // set up intervals array
  const intervals: Array<number> = [];
  let lastInterval = 0;
  textNodes.forEach(tn => {
    if (tn.textContent === null) {
      lastInterval += 0;
    }
    else {
      lastInterval += tn.textContent.length;
    }
    intervals.push(lastInterval);
  });

  // initialize start and end offsets
  let startOffset = 0;
  let endOffset = combinedString.length;

  // narrow start offset
  if (startFrom) {
    const startingIndex = textNodes.findIndex(tn => tn === startFrom.textNode) - 1;
    if (startingIndex === -2) {
      return null;
    }
    if (
      startFrom.textNode.textContent === null 
    ) {
      return null;
    }

    // else - safe to proceed
    startOffset = (startingIndex === -1 ? 0 : intervals[startingIndex])
      + startFrom.nodeOffset;
  }


  // narrow end offset
  if (upTo) {
    const endingIndex = textNodes.findIndex(tn => tn === upTo.textNode) - 1;
    if (endingIndex === -2) {
      return null;
    }
    if (
      upTo.textNode.textContent === null ||
      // upTo.nodeOffset < 0 || 
      upTo.nodeOffset > upTo.textNode.textContent.length
    ) {
      return null;
    }

    // else - safe to proceed
    endOffset = (endingIndex === -1 ? 0 : intervals[endingIndex])
      + upTo.nodeOffset;
  }


  // find re
  const combinedStringMatch = getReMatch(combinedString, reSource, startOffset, endOffset, getLast);

  if (!combinedStringMatch || combinedStringMatch.index === undefined) {
    return null;
  }
  else {

    const characterIndex = combinedStringMatch.index +
      ((returnAfterMatch) ? combinedStringMatch[0].length : 0) +
      returnIndexOffset;

    // conditions which indicate an after position should default to prior text node in case of ambiguity
    const textNodeIndex = returnAfterMatch || returnIndexOffset > 0 ?
      intervals.findIndex(i => i >= characterIndex) :
      intervals.findIndex(i => i > characterIndex);

    if (textNodeIndex === -1) return null;
    const stringLengthPriorToTextNode = (textNodeIndex > 0) ? intervals[textNodeIndex - 1] : 0
    return {
      currentNode: textNodes[textNodeIndex],
      offset: characterIndex - stringLengthPriorToTextNode
    }
  }

}


export function getNextLeftEndpoint(textNodes: Array<Text>, startingIndexOfTextNode: number, startingOffset: number) {

  let indexOfTextNode = startingIndexOfTextNode;
  let offset = startingOffset;

  // index check
  if (
    indexOfTextNode < 0 ||
    indexOfTextNode >= textNodes.length
  ) {
    return;
  }

  let currentNode = textNodes[indexOfTextNode];

  if (currentNode.textContent) {

  }
}


export function getNextRightEndpoint(textNodes: Array<Text>, startingIndexOfTextNode: number, startingOffset: number) {

  let indexOfTextNode = startingIndexOfTextNode;
  let offset = startingOffset;

  // index check
  if (
    indexOfTextNode < 0 ||
    indexOfTextNode >= textNodes.length
  ) {
    return;
  }

  let currentNode = textNodes[indexOfTextNode];

  if (currentNode.textContent) {
    if (offset < currentNode.textContent.length) {

      // find first non-zero-width space character
      const reMatch = currentNode
        .textContent
        .slice(offset)
        .match(/[^\u200B]/);

      if (reMatch && reMatch.index !== undefined) {
        const newIndex = reMatch.index + offset + 1;
        return { currentNode, newIndex }
      }
    }
  }

  // else
  while (indexOfTextNode < textNodes.length) {

    indexOfTextNode++;
    if (indexOfTextNode >= textNodes.length) return;

    // determine if is sibling
    // const isSibling = (textNodes[indexOfTextNode].parentNode === anchorNode.parentNode);
    const isSibling = areUninterruptedSiblingTextNodes(currentNode, textNodes[indexOfTextNode])
    currentNode = textNodes[indexOfTextNode];
    if (!(currentNode instanceof Text)) return; // narrow type

    if (isSibling && currentNode.textContent !== null) {
      const reMatch = currentNode
        .textContent
        .match(/[^\u200B]/);

      if (reMatch && reMatch.index !== undefined) {
        const newIndex = reMatch.index + 1;
        return { currentNode, newIndex };
      }
    } else {

      // if empty text
      if (currentNode.textContent === "") {
        return { currentNode, newIndex: 0 };
      }

      // if only character is zero-width space
      if (currentNode.textContent === "\u200B") {
        return { currentNode, newIndex: 1 };
      }

      // if is fully cushioned node
      if (
        currentNode.textContent !== null &&
        currentNode.textContent.split("").every(ch => ch === "\u200B")
      ) {
        return { currentNode, newIndex: 1 };
      }

      /**
       * else - find first non-zero-width space character as above, but 
       * place cursor *before* first valid character
       */
      if (currentNode.textContent) {
        const reMatch = currentNode
          .textContent
          .match(/[^\u200B]/);

        if (reMatch && reMatch.index !== undefined) {
          const newIndex = reMatch.index;
          return { currentNode, newIndex }
        }
      }


    }

  }

}












export function alternativeGetNextPosition(
  direction: "left" | "right",
  searchObject: searchCombinedTextArgumentObject,
  originalNode: Text, originalOffset: number,
  resetOnSiblingInterruption: boolean, resetOnBreakInterruption: boolean,
  currentNode?: Text, currentOffset?: number
) {

  if (!(originalNode instanceof Text)) return;
  if (currentNode && !(currentNode instanceof Text)) return;


  // move left or right
  if (direction === "right") {
    // searchCombinedText? or do this manually? 
    // If doing search combined text, will have difficulty with breaks, interruptions
    // if doing this manually will have a hard time 
  } else if (direction === "left") {

  }

  // if currentNode != orig Node
  // if node is not cushioned, cushion node
  // if areUninterruptedSiblings
  // if offset is valid, (matches re?) return node and offset (include different offset parameter? ie " \u2000B" + 1)
  // else - not uninterrupted siblings
  // if resetObSiblingInterruption
  // ignore sought character, if going right set at 1, if going left set at text.textContent.length-1
  // else if resetOnBreakInterruptions and interrupted by break
  // ignore sought character, if going right set at 1, if going left set at text.textContent.length-1
  // else
  // can return currentNode and offset if they exist


}


/**
 * Compares two text nodes (assumes nodes are of same level, cannot
 * be children of one another) and determines if there are any br
 * elements in between them. Returns true if they are the same
 * text node.
 * @param text1 
 * @param text2 
 * @returns 
 */
function areUninterruptedByBreak(text1: Text, text2: Text): boolean {
  if (text1 === text2) return true;

  const compareRange = new Range();

  if (text1.compareDocumentPosition(text2) === 4) {
    compareRange.setStartAfter(text1);
    compareRange.setEndBefore(text2);
  } else {
    compareRange.setStartAfter(text2);
    compareRange.setEndBefore(text1);
  }

  const clonedContents = compareRange.cloneContents();

  // return true if no breaks, false if there are
  return !(clonedContents.querySelector("br"));

}





export function getNextPosition(
  origNode: Text,
  origOffset: number,
  limitingContainer: Node,
  direction: "left" | "right",
  reSource: string,
  returnAfterMatch: boolean,
  returnIndexOffset: number,
  resetOnSiblingInterruption: boolean,
  resetOnBreakInterruption: boolean
) {

  const allTextNodes = getAllTextNodes([limitingContainer]);

  let initialResult = searchCombinedText({
    textNodes: allTextNodes,
    getLast: (direction === "left"),
    reSource,
    returnAfterMatch,
    returnIndexOffset,
    upTo: (direction === "left") ? {
      textNode: origNode,
      nodeOffset: origOffset - 1
    } : undefined,
    startFrom: (direction === "right") ? {
      textNode: origNode,
      nodeOffset: origOffset + 1
    } : undefined
  });

  if (initialResult === null) return null;

  // else - result is valid, text node(s) not interrupted
  if (
    initialResult.currentNode === origNode ||
    areUninterruptedSiblingTextNodes(origNode, initialResult.currentNode)
  ) {
    // make sure nodes are cushioned
    if (!(textNodeIsCushioned(origNode))) {
      cushionTextNode(origNode);
    }
    if (!(textNodeIsCushioned(initialResult.currentNode))) {
      cushionTextNode(initialResult.currentNode);
    }

    return initialResult;
  }

  // else - text nodes ARE interrupted

  let textNodePointer = allTextNodes.findIndex(tn => tn === origNode);

  if (resetOnSiblingInterruption) {
    const targetTextNodeIndex = allTextNodes.findIndex(tn => tn === initialResult.currentNode);
    if (direction === "left") {
      while (textNodePointer > targetTextNodeIndex) {
        textNodePointer--;
        const currentTextNode = allTextNodes[textNodePointer];
        
        if (!textNodeIsCushioned(currentTextNode)) {
          cushionTextNode(currentTextNode);
        }
        
        if (areUninterruptedSiblingTextNodes(currentTextNode, origNode)) continue;
        else {
          return {
            currentNode: currentTextNode,
            offset: currentTextNode.length-1
          }
        }
      }
    } else if (direction === "right") {
      const targetTextNodeIndex = allTextNodes.findIndex(tn => tn === initialResult.currentNode);
      while (textNodePointer < targetTextNodeIndex) {
        textNodePointer++;
        const currentTextNode = allTextNodes[textNodePointer];

        if (!textNodeIsCushioned(currentTextNode)) {
          cushionTextNode(currentTextNode);
        }

        if (areUninterruptedSiblingTextNodes(currentTextNode, origNode)) continue;
        else {
          return {
            currentNode: currentTextNode,
            offset: 1
          }
        }

      }
    }
  }

  else if (resetOnBreakInterruption) {
    if (areUninterruptedByBreak(origNode, initialResult.currentNode)) {
      return initialResult;
    } else {
      
      const checkForBreakRange = new Range();

      // if moving left, find last text node before last break, return end
      if (direction === "left") {
        checkForBreakRange.setStartAfter(initialResult.currentNode);
        checkForBreakRange.setEndBefore(origNode);

        const ancestorContainer = checkForBreakRange.commonAncestorContainer as HTMLElement;
        const allBreaksQuery = ancestorContainer.querySelectorAll("br")
        const breaks = Array.from(allBreaksQuery);
        
        // find last break to occur in range
        const lastBreak = breaks.findLast(br => checkForBreakRange.isPointInRange(br, 0));

        // this is for type narrowing but should never occur due to areUninterruptedByBreak
        if (!lastBreak) return initialResult;


        while (textNodePointer > 0) {
          
          textNodePointer--;
          let currentTextNode = allTextNodes[textNodePointer];
          if (!textNodeIsCushioned(currentTextNode)) {
            cushionTextNode(currentTextNode);
          }

          // console.log("textNodePointer", textNodePointer, currentTextNode.textContent!.replaceAll('\u200B', '\u25A1'), textNodeIsCushioned(currentTextNode));

          if (currentTextNode.compareDocumentPosition(lastBreak) === 4) {
            return {
              currentNode: currentTextNode,
              offset: currentTextNode.textContent!.length - 1
            }
          }
        }
      }

      // if moving right, find first text node after first break, return start
      else {
        checkForBreakRange.setStartAfter(origNode);
        checkForBreakRange.setEndBefore(initialResult.currentNode);

        const ancestorContainer = checkForBreakRange.commonAncestorContainer as HTMLElement;
        const allBreaksQuery = ancestorContainer.querySelectorAll("br")
        const breaks = Array.from(allBreaksQuery);

        // find first break to occur in range
        const firstBreak = breaks.find(br => checkForBreakRange.isPointInRange(br, 0));

        // this is for type narrowing but should never occur due to areUninterruptedByBreak
        if (!firstBreak) return initialResult;

        while (textNodePointer < allTextNodes.length) {
          
          textNodePointer++;
          let currentTextNode = allTextNodes[textNodePointer];
          if (!textNodeIsCushioned(currentTextNode)) {
            cushionTextNode(currentTextNode);
          }

          if (currentTextNode.compareDocumentPosition(firstBreak) === 2) {
            return {
              currentNode: currentTextNode,
              offset: 1
            }
          }
        }
      }

    }

  } else {

  }

  // nothing found
  return null;



} 