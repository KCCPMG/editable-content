export function bisect(myRef: React.MutableRefObject<HTMLDivElement | null>) {
  // incomplete, experiment

  console.log(window.getSelection());

  const selection = window.getSelection();

  function nearestElementAncestor(node: Node | null) {
    if (node instanceof Element) return node;
    else return nearestElementAncestor(node?.parentNode || null)
  }

  function getPreRange(range: Range): Range {
    const { startOffset, endOffset, startContainer, endContainer } = range;

    const preRange = new Range();
    preRange.setStart(nearestElementAncestor(startContainer), 0);
    preRange.setEnd(startContainer, startOffset);

    return preRange;
    // if (preRange.startContainer instanceof Element) {
    //   return preRange;
    // } else {
    //   if (startContainer.parentNode) {
    //     preRange.setStart(startContainer.parentNode, 0)
    //     return getPreRange(preRange);
    //   } else return null;
    // }
  }

  function getPostRange(range: Range) {
    const { startOffset, endOffset, startContainer, endContainer } = range;

    const postRange = new Range();
    const safeAncestor = nearestElementAncestor(endContainer);
    postRange.setStart(endContainer, endOffset);
    console.log(postRange, safeAncestor, safeAncestor?.textContent?.length)
    if (safeAncestor) {
      postRange.setEnd(safeAncestor, 1);
    }

    return postRange;
  }

  if (myRef.current && selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const { startOffset, endOffset, startContainer, endContainer } = range;
    
    console.log("range", range);

    const preRange = getPreRange(range);
    const postRange = getPostRange(range);
    console.log({preRange, postRange});

    const preRangeSpan = document.createElement("span");
    const preRangeContents = preRange.extractContents();
    preRangeSpan.append(preRangeContents);
    preRange.startContainer.appendChild(preRangeSpan);
    // preRange.startContainer.appendChild(preRangeContents);

    const postRangeSpan = document.createElement("span");
    const postRangeContents = postRange.extractContents();
    postRangeSpan.append(postRangeContents);
    postRange.startContainer.appendChild(postRangeSpan);
    // postRange.startContainer.appendChild(postRangeContents);

    // Try to prepend and append new spans, preRange from start of text to cursor, postRange from cursor to end of text

    // range.extractContents() into each span 

    // consider writing promoteToSibling, demoteToChild functions

    // const postRange = new Range();
    // postRange.setStart(startContainer, startOffset);
    // postRange.setEnd(startContainer, 0);
    // console.log({postRange});
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

function getRangeUpTo(node: Node, offset: number): Range {
  const range = new Range();
  range.setStartBefore(node);
  range.setEnd(node, offset);
  return range;
}

function getMidRange(firstNode: Node, firstNodeOffset: number, finalNode: Node, finalNodeOffset: number) {
  const range = new Range();
  range.setStart(firstNode, firstNodeOffset);
  range.setEnd(finalNode, finalNodeOffset);
  return range;
}

function getRangeAfter(node: Node, offset: number): Range {
  const range = new Range();
  range.setStart(node, offset);
  range.setEndAfter(node);
  return range;
}

function splitNode(node: Node, offset: number) {
  const preRange = getRangeUpTo(node, offset);
  const postRange = getRangeAfter(node, offset);

  // if node is TEXT_NODE
  if (node.nodeType === Node.TEXT_NODE) {
    const preText = document.createTextNode(preRange.toString());
    node.parentNode?.insertBefore(preText, node);
    const postText = document.createTextNode(postRange.toString());
    node.parentNode?.replaceChild(postText, node);

    return {
      anchorNode: preText,
      focusNode: postText
    }
  } 
}



function selectionIsDescendentOf(selection: Selection, query: string, limitingContainer: Node): boolean {
  if (!selection) return false;
  const range = selection?.getRangeAt(0)

  const filteredFocusNodeAncestors = [];
  let parentNode = selection.focusNode?.parentNode;

  while (parentNode) {
    if (parentNode === limitingContainer) break;
    if (parentNode instanceof Element) {
      if (parentNode.matches(query)) filteredFocusNodeAncestors.push(parentNode);
    }
    parentNode = parentNode.parentNode;
  }

  const filteredAnchorNodeAncestors = [];
  parentNode = selection.anchorNode?.parentNode;

  while (parentNode) {
    if (parentNode === limitingContainer) break;
    if (parentNode instanceof Element) {
      if (parentNode.matches(query)) filteredAnchorNodeAncestors.push(parentNode);
    }
    parentNode = parentNode.parentNode;
  }

  if (filteredFocusNodeAncestors.length === 0 || filteredAnchorNodeAncestors.length === 0) {
    return false;
  } else {
    for (let ffna of filteredAnchorNodeAncestors) {
      for (let fana of filteredAnchorNodeAncestors) {
        if (ffna === fana) return true;
      }
    }
  }

  return false;
}


function alternateBisect() {
  // incomplete, experiment

  const selection = window.getSelection()
  const thisRange = window.getSelection()?.getRangeAt(0) || null;

  if (!thisRange || !selection) {
    console.log("no range and/or no selection");
    return;
  }

  const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
  console.log({ anchorNode, anchorOffset, focusNode, focusOffset })

}

type TwoNodesAndOffsets = {
  firstNode: Node,
  firstNodeOffset: number
  finalNode: Node,
  finalNodeOffset: number
}

export function sortNodes(nodeA: Node, nodeAOffset: number, nodeB: Node, nodeBOffset: number) {
  if (!nodeA || !nodeB || !nodeA.ownerDocument || !nodeB.ownerDocument || nodeA.ownerDocument !== nodeB.ownerDocument) {
    return null; // Nodes are not in the same document or are invalid
  }

  if (nodeA === nodeB) {
    if (nodeAOffset <= nodeBOffset) {
      const returnObj: TwoNodesAndOffsets = {
        firstNode: nodeA,
        firstNodeOffset: nodeAOffset,
        finalNode: nodeB,
        finalNodeOffset: nodeBOffset
      }
      return returnObj;
    } else {
      const returnObj: TwoNodesAndOffsets = {
        firstNode: nodeB,
        firstNodeOffset: nodeBOffset,
        finalNode: nodeA,
        finalNodeOffset: nodeAOffset
      }
      return returnObj;
    }
  }

  if ((nodeA.compareDocumentPosition(nodeB) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) {
    const returnObj: TwoNodesAndOffsets = {
      firstNode: nodeA,
      firstNodeOffset: nodeAOffset,
      finalNode: nodeB,
      finalNodeOffset: nodeBOffset
    }
    return returnObj;
  } else {
    const returnObj: TwoNodesAndOffsets = {
      firstNode: nodeB,
      firstNodeOffset: nodeBOffset,
      finalNode: nodeA,
      finalNodeOffset: nodeAOffset
    }
    return returnObj;
  }
}


function alternateAlternateBisect(boundingElement?: Node) {
  const selection = window.getSelection();
  if (!selection) return;
  const selectionRange = selection?.getRangeAt(0);
  if (!selectionRange) return;
  const {anchorNode, anchorOffset, focusNode, focusOffset} = selection;
  
  
  
  if (anchorNode && focusNode) {
    const sortedNodes = sortNodes(anchorNode, anchorOffset, focusNode, focusOffset);
    if (sortedNodes) {
      const {firstNode, firstNodeOffset, finalNode, finalNodeOffset} = sortedNodes;
      
      // const {anchorNode, focusNode} = splitNode(firstNode, firstNodeOffset);
      
      // need to reset
      // selection.setBaseAndExtent()


      splitNode(finalNode, finalNodeOffset);
      return;
    } else {
      // pass
    }
  
  }

  
  if (anchorNode) splitNode(anchorNode, anchorOffset);
  if (focusNode) splitNode(focusNode, focusOffset);
}










// const selection = window.getSelection()
// const range = selection.getRangeAt(0)
// const contents = range.cloneContents();
// children = Array.from(contents.childNodes)

// for (let child of children) {
//   child.parentNode.replaceChild()
// }

// if node does not have children
//   if node.nodeName !== elementName return node
//   else return node

// need to accept node or array of nodes?


// function blarg(nodes: Array<Node>, ElementName: string) {
//   for (let node of nodes) {
//     if (node.hasChildNodes()) {

//     }
//   }
// }



// if node is bad return its Children
// if node is good return node


function getAllTextNodes(nodes: Array<Node>): Array<Node> {
  const textNodes: Array<Node> = [];
  
  // let currentNode = node;

  function descendNode(cn: Node) {
    if (cn.nodeType === Node.TEXT_NODE) {
      textNodes.push(cn);
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


function cleanElementTypeFromSelection(elementName: string): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection?.getRangeAt(0);
  const contents = range.extractContents();
  const cleaned = removeElementsByName(Array.from(contents.childNodes), elementName)
  for (let childNode of Array.from(cleaned)) {
    range.insertNode(childNode);
  }
  return;
}


// asgdhfjgkfdhfdgrsefgrhsdjfdgkfdjfhdgr() {
//   const preRange = new Range()
//   const selectedRange = selection.getRangeAt(0);
//   const parent = selectedRange.startContainer.parentNode
//   preRange.setStart(parent, 0);
//   preRange.setEnd(selectedRange.startContainer, selectedRange.startOffset)
//   extracted = preRange.extractContents();
//   for (let cn of Array.from(extracted.childNodes)) {
//     grandparentNode.insertBefore(cn, parent);
//   }
// }


// const selection = window.getSelection();
// const preRange = new Range();
// preRange.setStartBefore(selection.anchorNode.parentNode);
// preRange.setEnd(selection?.anchorNode, selection.anchorOffset);
// const contents = preRange.extractContents();
// for (let cn of contents.childNodes) {
//   preRange.insertNode(cn);
// }

export function unwrapFromElement(contents: DocumentFragment, elementName: string) {
  // const selection = window.getSelection();
  // if (!selection) return;
  // const range = selection.getRangeAt(0);
  // const contents = range.extractContents();

  for (let childNode of Array.from(contents.childNodes)) {
    if (childNode.nodeName === elementName) {
      // childNode.extractContents ???? 
      for (let childToPromote of Array.from(childNode.childNodes)) {
        contents.insertBefore(childToPromote, childNode)
      }
    }
  }
  return contents;
}

export function removeElementsByName(nodes: Array<ChildNode>, elementName: string): Array<ChildNode> {
  for (let node of nodes) {
    console.log(node);
    if (!(node.parentNode)) return nodes;
    if (node.nodeName === elementName) {
      for (let childNode of removeElementsByName(Array.from(node.childNodes), elementName)) {
        node.parentNode.insertBefore(childNode, node);
      }
      node.parentNode.removeChild(node);
    } else {
      const newChildren = removeElementsByName(Array.from(node.childNodes), elementName);
      for (let child of Array.from(node.childNodes)) {
        node.removeChild(child);
      }
      for (let child of newChildren) {
        node.appendChild(child);
      }
    }
  }
  return nodes;
}


export function unwrapChildrenFrom(selection: Selection, query: string) {
  if (!selection || !selection.anchorNode || !selection.focusNode) return;
  
  const range = selection.getRangeAt(0);
  const fragment = range.extractContents();
  // const childNodes = Array.from(fragment.childNodes);
  // for (let childNode of childNodes) {
  //   const queryResults = childNode.querySelectorAll(query);

  // }
  // range.ins
  const queryResults = Array.from(fragment.querySelectorAll(query));
  for (let result of queryResults) {
    const childNodes = Array.from(result.childNodes);
    for (let child of childNodes) {
      result.parentNode?.insertBefore(child, result);
    }
    result.parentNode?.removeChild(result);
  }
  range.insertNode(fragment);
  selection.removeAllRanges();
  selection.addRange(range);
  console.log(range);
}