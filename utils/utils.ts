import { Children, ElementType } from "react";
import { node, nodes } from "slate";
import { WrapperArgs } from "@/components/ContentEditableExperimentComponents";



export function setSelection(startContainer: Node, startOffset: number, endContainer: Node, endOffset: number) {
  const range = new Range();
  range.setStart(startContainer, startOffset);
  range.setEnd(endContainer, endOffset);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);      

  return selection;
}


export function wrapInElement(selection: Selection, element: Element) {
  if (!selection) return;
  const range = selection.getRangeAt(0);
  const contents = range.extractContents();
  element.append(contents);
  range.insertNode(element);
}


export function deleteEmptyElementsByQuery(query: string, limitingContainer: Element) {
  const elements = Array.from(limitingContainer.querySelectorAll(query));

  elements.forEach(elem => {
    if ((elem.textContent) === "" && Array.from(elem.childNodes).every(cn => !(cn instanceof Element))) {
      elem.remove();
    }
  })

  return;

}


export function unwrapSelectionFromQuery(selection: Selection, query: string, limitingContainer: Element): void {
  if (!selection || !selection.anchorNode || !selection.focusNode) return;

  const preAncestorNode = getAncestorNode(selection.anchorNode, query, limitingContainer);

  if (!preAncestorNode) return;

  const preRange = new Range();
  preRange.setStartBefore(preAncestorNode);
  preRange.setEnd(selection.anchorNode, selection.anchorOffset);
  const preRangeContents = preRange.extractContents();
  for (let cn of Array.from(preRangeContents.childNodes)) {
    preRange.insertNode(cn);
  }

  const postAncestorNode = getAncestorNode(selection.focusNode, query, limitingContainer);

  if (!postAncestorNode) return;

  const postRange = new Range();
  postRange.setEndAfter(postAncestorNode);
  postRange.setStart(selection.focusNode, selection.focusOffset);
  const postRangeContents = postRange.extractContents();
  for (let cn of Array.from(postRangeContents.childNodes)) {
    postRange.insertNode(cn);
  }

  // will preAncestorNode and postAncestorNode necessarily be the same?
  // I still need to promote the actual selection out of the wrapper

  const selectionAncestorNode = getAncestorNode(selection.focusNode, query, limitingContainer);
  // if (!selectionAncestorNode) return;
  // const selectionAncestorRange = new Range();
  // selectionAncestorRange.setStartBefore(selectionAncestorNode);
  // selectionAncestorRange.setEndAfter(selectionAncestorNode);
  // const selectionAncestorContents = selectionAncestorRange.extractContents();
  // for (let cn of Array.from(selection.getRangeAt(0).extractContents))
  if (!selectionAncestorNode) return;
  promoteChildrenOfNode(selectionAncestorNode);

  deleteEmptyElementsByQuery(query, limitingContainer);

  return;
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


export function promoteChildrenOfNode(node: Node): void {
  if (node.parentNode) {
    for (let child of Array.from(node.childNodes)) {
      node.parentNode.insertBefore(child, node);
    }
    node.parentNode.removeChild(node);
  }
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
    parentNode = parentNode.parentNode;
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


function getSelectionChildNodes(selection: Selection, limitingContainer: Node): Array<Node> {
  if (!selection || !selection.anchorNode || !selection.focusNode) return [];
  
  // console.log(selection);
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


export function selectionCoveredBy(selection: Selection, query: string, limitingContainer: Node) {
  const nodes = getSelectionChildNodes(selection, limitingContainer);
  const textNodes = nodes
  .filter(n => n.nodeType === 3)
  .filter(n => n.textContent && n.textContent.length > 0); 
  return textNodes.every(tn => nodeIsDescendentOf(tn, query, limitingContainer));

}


export function generateQuery({element, classList, id}: WrapperArgs): string {
  const classListString = classList ? classList.map(c => "."+c).join("") : "";
  const idString = id ? "#"+id : "";

  return element + classListString + idString;
}


export function createWrapper({element, classList, id}: WrapperArgs, document: Document): HTMLElement {

  const wrapper = document.createElement(element);
  if (classList) {
    classList.forEach(cl => {
      wrapper.classList.add(cl);
    });
  }
  if (id) {
    wrapper.setAttribute('id', id);
  }
  return wrapper;
}
