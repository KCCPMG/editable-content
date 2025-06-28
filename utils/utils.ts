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




export function resetSelectionToTextNodes(): Selection | null {
  let selection = window.getSelection();
  if (!selection) return selection;

  const range = selection.getRangeAt(0);
  const originalStartContainer = range.startContainer;
  
  const modifiedRange = resetRangeToTextNodes(range);
  if (!modifiedRange) return null;

  selection = window.getSelection();
  if (!selection) return null;

  selection.removeAllRanges();
  selection.addRange(modifiedRange);

  return selection;
}


export function resetRangeToTextNodes(range: Range) {
  if (range.startContainer.nodeType !== Node.TEXT_NODE) {
    const startNode = range.startContainer.childNodes[range.startOffset];
    console.log(startNode);
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

  // console.log(range.toString(), range.toString().length)

  if (range.toString().length === 0) {
    const textNode = document.createTextNode('\u200B');
    element.append(textNode);
    range.setStart(textNode, 0);
    range.setEnd(textNode, textNode.length);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  // const breakpoints = [];

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
  const range = selection.getRangeAt(0);

  const limitingContainerRange = new Range();
  // limitingContainerRange.setStart(limitingContainer, 0);
  // limitingContainerRange.setEnd(limitingContainer, limitingContainer.childNodes.length - 1)
  limitingContainerRange.setStartBefore(limitingContainer.childNodes[0]);
  limitingContainerRange.setEndAfter(limitingContainer.childNodes[limitingContainer.childNodes.length-1])
  const childNodes = getRangeChildNodes(limitingContainerRange, limitingContainer);
  const textNodes = childNodes.filter(cn => cn.nodeType === Node.TEXT_NODE);

  // range is collapsed
  if (direction === "none") {
    if (moveDirection === "left") {

      if (anchorOffset > 0) {
        selection.setBaseAndExtent(anchorNode, anchorOffset-1, anchorNode, anchorOffset-1);
      } 
      else {

        const thisIndex = textNodes.findIndex(tn => tn === selection.anchorNode);

        if (thisIndex > 0) {
          const leftTextNode = textNodes[thisIndex - 1];
          if (!leftTextNode) return;
          selection.setBaseAndExtent(leftTextNode, leftTextNode.textContent?.length || 0, leftTextNode, leftTextNode.textContent?.length || 0);
        } else return;
      }
  

    } else if (moveDirection === "right") {
      if (anchorOffset < (anchorNode?.textContent?.length || 0)) {
        selection.setBaseAndExtent(anchorNode, anchorOffset+1, anchorNode, anchorOffset+1);
      }
      else {

        const thisIndex = textNodes.findIndex(tn => tn === selection.anchorNode);

        if (thisIndex < textNodes.length - 1) {
          const rightTextNode = textNodes[thisIndex + 1];
          if (!rightTextNode) return;
          selection.setBaseAndExtent(rightTextNode, 0, rightTextNode, 0);
        } else return;
      }
    }

    // handle check for zero width space character, recursion
    if (
      selection &&
      selection.anchorNode &&
      selection.anchorNode.textContent &&
      (
        selection?.anchorNode?.textContent[selection.anchorOffset] === "\u200B" ||
        selection?.anchorNode?.textContent[selection.anchorOffset] === undefined 
      )
    ) {
      moveSelection(selection, limitingContainer, moveDirection);
    }
    return;

  }


  // currently only being called when selection is cursor, shift key will change this logic
  // no implementation yet for uncollapsed selection

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


export function selectionIsDescendentOfNode(selection: Selection, ancestorElement: Element) {
  return (
    selection.anchorNode &&
    selection.focusNode &&
    nodeIsDescendentOfNode(selection.anchorNode, ancestorElement) &&
    nodeIsDescendentOfNode(selection.focusNode, ancestorElement) 
  )
}


/**
 * Creates a treewalker to walk a range, returns all nodes;
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
  
  // console.log(selection);
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
    endContainer.childNodes[endOffset] :
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

    // console.log(currentNode);
    if (!currentNode) break;

    if (!inRange) {
      if (currentNode == startNode) {
        inRange = true;
      }
    }

    // not else, can flip switch and then progress
    if (inRange) {
      // childNodes.push(currentNode);
      // if (currentNode == endNode) break;
      if (currentNode == endNode) {
        if (currentNode.nodeType === Node.TEXT_NODE) {
          childNodes.push(currentNode);
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

  // if (!selection) return false;
  // const range = selection.getRangeAt(0) || null;
  // if(!range) return false;

  // // unbreakable element
  // if (query.match(/\[unbreakable\]/)) {

  //   // selection is within unbreakable element - true
  //   const nodes = getSelectionChildNodes(selection, limitingContainer);
  //   const textNodes = nodes
  //   .filter(n => n.nodeType === Node.TEXT_NODE)
  //   .filter(n => n.textContent && n.textContent.length > 0); 

  //   const commonAncestor = range.commonAncestorContainer;

  //   if (commonAncestor instanceof Element && commonAncestor.matches(query) && commonAncestor !== limitingContainer) return true;

  //   if (nodeIsDescendentOf(commonAncestor, query, limitingContainer)) return true;

  //   // if textNodes.every(tn => nodeIsDescendentOf(tn, query, limitingContainer)) {

  //   // }
    
    
    
  //   // selection covers unbreakable element - false
    
    
    
  //   // selection des not cover or intersect unbreakable element




  //   // selection intersects unbreakable element


  //   //

  // }


  // else
  const nodes = getSelectionChildNodes(selection, limitingContainer);
  // console.log("getSelectionCoveredBy", {nodes});
  const textNodes = nodes
  .filter(n => n.nodeType === Node.TEXT_NODE);

  // I don't remember why the below check was in place, but in ruins empty text nodes
  // .filter(n => n.textContent && n.textContent.length > 0); 
   
  return textNodes.every(tn => nodeIsDescendentOf(tn, query, limitingContainer));

}


export function selectionHasTextNodes(selection: Selection, limitingContainer: Element) {
  const childNodes = getSelectionChildNodes(selection, limitingContainer);
  return childNodes.some(cn => cn.nodeType === Node.TEXT_NODE);
}


export function generateQuery({element, classList, id, unbreakable, attributes}: WrapperArgs): string {
  const classListString = classList ? classList.map(c => "."+c).join("") : "";
  const idString = id ? "#"+id : "";
  const unbreakableString = unbreakable ? "[data-unbreakable]" : "";
  // if (attributes) console.log(Object.entries(attributes));
  const attributesString = attributes ? 
    Object.entries(attributes)
      .map(a => {
        const [k, v] = a;
        if (v) return `[${k}="${v}"]`;
        else return `[${k}]`;
      })
      .join(""):
    "";

  return element + classListString + idString + unbreakableString + attributesString;
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

  // console.log(selection.getRangeAt(0).commonAncestorContainer);
  // console.log(limitingContainer);

  // if (!nodeIsDescendentOfNode(selection.getRangeAt(0).commonAncestorContainer, limitingContainer)) {
  //   status.enabled = false;
  //   status.selected = false;
  //   return status;
  // }

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

  // console.log(selection.toString());
  // console.log("selectionIsDescendentOfNode(selection, limitingContainer) ", selectionIsDescendentOfNode(selection, limitingContainer))
  
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
      } else if (rangeCommonElementAncestor && rangeCommonElementAncestor.matches(query)) {
        status.enabled = true;
        status.selected = true;
        return status;
      } else {
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