import { WrapperArgs } from "../types";
import { getAncestorNode, getRangeChildNodes, textNodeIsCushioned } from "./checks";
import { resetSelectionToTextNodes } from "./selection_movements";


/**
 * Generate string which will work as query in document.querySelector,
 * using element's name and its attributes
 * @param element 
 * @returns 
 */
function generateQueryFromElement(element: Element) : string 
{
  return element.tagName.toLowerCase() + Array.from(element.attributes).map(attr => {
    return `[${attr.name}="${attr.value}"]`
  }).join("");
}


/**
 * Given a selection and an element, extracts the contents,
 * deletes empty start and end containers if they are empty 
 * text, promotes any children in the contents which match
 * the query of the wrapper element, have wrapper element
 * append contents, insert wrapper into range.
 * @param selection 
 * @param element 
 * @param limitingContainer 
 * @returns 
 */
export function wrapInElement(selection: Selection, element: Element, limitingContainer: Element): void {
  if (!selection) return;

  const unbreakables: Array<Node> = [];

  // TODO: if start container or end container are in unbreakable elements which are not the same, move selection away
  
  resetSelectionToTextNodes();
  const range = selection.getRangeAt(0);
  const query = generateQueryFromElement(element);

  const contents = range.extractContents();

  // if empty text nodes left behind, delete
  if (range.startContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
    if (range.startContainer.textContent === "") {
      range.startContainer.parentNode?.removeChild(range.startContainer);
    }
  }

  if (range.endContainer && range.endContainer.nodeType === Node.TEXT_NODE) {
    if (range.endContainer.textContent === "") {
      range.endContainer.parentNode?.removeChild(range.endContainer);
    }
  }

  const childNodes = contents.childNodes;

  /**
   * If there are nodes inside of the selection which already
   * match the query of the wrapper that we will apply, promote the
   * contents of those nodes out of their individual wrappers before 
   * the new wrapper is applied to all contents
   */
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
  // unwrapRangeFromQuery(range, query, limitingContainer);

  element.append(contents); 
  range.insertNode(element); // range is collapsed, this effectively inserts *after*
  range.setStartBefore(element);
  range.setEndAfter(element);

  if (range.toString().length === 0) {
    const textNode = document.createTextNode('\u200B\u200B');
    element.append(textNode);
    range.setStart(textNode, 1);
    range.setEnd(textNode, 1);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  // promote any unbreakable elements in range
  for (let unbreakable of unbreakables) {
    const unbreakableRange = new Range();
    unbreakableRange.setStart(unbreakable, 0);
    unbreakableRange.setEnd(unbreakable, unbreakable.childNodes.length);

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
  
  resetSelectionToTextNodes(); // make sure we're in text nodes

  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    range.setStartBefore(range.startContainer);
  }

  if (range.endContainer.nodeType === Node.TEXT_NODE) {
    range.setEndAfter(range.endContainer);
  }

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
 * elements have no text, unless they are a br.
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
 * Promotes all text in a selection where it is a descendent of an element 
 * matching a given query using unwrapRangeFromQuery
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


// TODO: Look for ways to simplify this, leverage existing functions
/**
 * Given a range which has as a common ancestor an element matching
 * a given query, breaks the query-matching element into three parts: 
 * preRange, range, postRange. The preRange and postRange extract 
 * their contents and then reassemble themselves so that the element
 * is split into three parts corresponding to the range. Finally, the
 * range reassembles itself with everything except its own instance of
 * the query-matching element
 * @param range 
 * @param query 
 * @param limitingContainer 
 * @returns 
 */
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

  const postAncestorNode = getAncestorNode(range.endContainer, query, limitingContainer); // assumes endContainer is text node
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
    range.setStartBefore(startContainerAncestorNode);
  }

  const endContainerAncestorNode = getAncestorNode(range.endContainer, query, limitingContainer);
  if (endContainerAncestorNode) {
    range.setEndAfter(endContainerAncestorNode);
  }

  // promote children of all query-matching nodes in selection
  const childNodes = getRangeChildNodes(range, limitingContainer);
  const targetedNodes = childNodes.filter(cn => {
    return (cn instanceof Element && cn.matches(query));
  });
  targetedNodes.forEach(tn => promoteChildrenOfNode(tn));

  // finally clean up empty elements of this query
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


/**
 * Takes a WrapperArgs object and returns a string corresponding
 * to a query for user in querySelector which will identify
 * instances of the corresponding element. Does not factor
 * classList into string 
 * @param {WrapperArgs} wrapperArgs
 * @returns 
 */
export function generateQuery({element, id, unbreakable, attributes}: WrapperArgs): string {
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

  return element + idString + unbreakableString + attributesString;
}

/**
 * Creates a wrapper element from WrapperArgs, also requires
 * a document for the sake of creating the element.
 * @param {WrapperArgs} param0 
 * @param document 
 * @returns 
 */
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

/**
 * Given a text node, cushions it correctly.
 * If the text node's content is of 0 length, adds two zero-width spaces
 * If the next node's content is of 1 length and one character is a zero-width
 * space, adds another zero-width space
 * Otherwise adds zero-width space to beginning and end of text node's content,
 * after determining if it is necessary in each case
 * @param textNode 
 * @returns 
 */
export function cushionTextNode(textNode: Text) {
  if (!(textNode instanceof Text) || textNode.textContent === null) return;

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

}


/**
 * Given an array of text nodes, resets the cushioning of any
 * which are not already cushioned.
 * @param textNodes 
 */
export function resetTextNodesCushions(textNodes: Array<Text>) {
  textNodes.forEach(tn => {
    if (!textNodeIsCushioned(tn)) cushionTextNode(tn);
  })
}


/**
 * Given a selection, make sure it starts and ends in text nodes,
 * extracts contents to delete them, collapses selection.
 * @param selection 
 * @returns 
 */
export function clearAndResetSelection(selection: Selection) {

  const range = selection.getRangeAt(0);
  const { startContainer, startOffset, endContainer } = range;

  if (
    !(startContainer instanceof Text) || 
    !(endContainer instanceof Text)
  ) return;

  range.extractContents();
  selection.setBaseAndExtent(startContainer, startOffset, startContainer, startOffset);

  return;

}