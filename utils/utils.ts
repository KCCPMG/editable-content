import { Children, ElementType } from "react";
import { node, nodes } from "slate";

function getRangeUpTo(node: Node, offset: number) {
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

function getRangeAfter(node: Node, offset: number) {
  const range = new Range();
  range.setStart(node, offset);
  range.setEndAfter(node);
  return range;
}

function splitNode(node: Node, offset: number) {
  const preRange = getRangeUpTo(node, offset);
  const postRange = getRangeAfter(node, offset);

  // if node is TEXT_NODE
  if (node.nodeType === 3) {
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


type TwoNodesAndOffsets = {
  firstNode: Node,
  firstNodeOffset: number
  finalNode: Node,
  finalNodeOffset: number
}


function sortNodes(nodeA: Node, nodeAOffset: number, nodeB: Node, nodeBOffset: number) {
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



function bisect(boundingElement?: Node) {
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





export function wrapInElement(element: Element) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const contents = range.extractContents();
  element.append(contents);
  range.insertNode(element);
}


function unwrapFromElement(contents: DocumentFragment, elementName: string) {
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



function removeElementsByName(nodes: Array<ChildNode>, elementName: string): Array<ChildNode> {
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


export function promoteChildrenOfNode(node: Node): void {
  if (node.parentNode) {
    for (let child of Array.from(node.childNodes)) {
      node.parentNode.insertBefore(child, node);
    }
  }
}

export function unwrapChildrenFrom(query: string) {
  const selection = window.getSelection();
  if (!selection) return;
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



export function selectionIsDescendentOf(selection: Selection, query: string, limitingContainer: Node): boolean {
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

function nodeIsDescendentOfNode(node: Node, ancestorNode: Node) {
  let parentNode = node.parentNode;
  while (parentNode) {
    if (parentNode === ancestorNode) return true;
    parentNode = node.parentNode;
  }
  return false;
}


export function selectionIsDescendentOfNode(selection: Selection, ancestorNode: Node) {
  // console.log(    
  //   Boolean(selection.anchorNode),
  //   Boolean(selection.focusNode),
  //   !!selection.anchorNode && nodeIsDescendentOfNode(selection.anchorNode, ancestorNode),
  //   !!selection.focusNode && nodeIsDescendentOfNode(selection.focusNode, ancestorNode) 
  // )
  return (
    selection.anchorNode &&
    selection.focusNode &&
    nodeIsDescendentOfNode(selection.anchorNode, ancestorNode) &&
    nodeIsDescendentOfNode(selection.focusNode, ancestorNode) 
  )
}


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


function getSelectionChildNodes(limitingContainer: Node): Array<Node> {
  const selection = window.getSelection();
  if (!selection) return [];
  
  const { startContainer, endContainer } = selection.getRangeAt(0);
  const tw = document.createTreeWalker(limitingContainer);

  const childNodes = [];
  let inRange = false;

  while (true) {

    const currentNode = tw.nextNode();
    // if (currentNode) childNodes.push(currentNode);
    // else break;

    if (!currentNode) break;

    if (!inRange) {
      if (currentNode == startContainer) inRange = true;
    }

    // not else, can flip switch and then progress
    if (inRange) {
      childNodes.push(currentNode);
      if (currentNode == endContainer) break;
    }

  }
  return childNodes;

  // const firstIndex = childNodes.findIndex(cn => cn === selection.getRangeAt(0).startContainer);

  // return Array.from(selection.getRangeAt(0).cloneContents().childNodes)
}


function selectionCoveredBy(query: string, limitingContainer: Node) {
  const nodes = getSelectionChildNodes(limitingContainer);
  const textNodes = nodes
  .filter(n => n.nodeType === 3)
  .filter(n => n.textContent && n.textContent.length > 0); 
  return textNodes.every(tn => nodeIsDescendentOf(tn, query, limitingContainer));

}