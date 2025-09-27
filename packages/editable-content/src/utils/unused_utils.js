"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bisect = bisect;
exports.nodeIsDescendentOf = nodeIsDescendentOf;
exports.sortNodes = sortNodes;
exports.unwrapFromElement = unwrapFromElement;
exports.removeElementsByName = removeElementsByName;
exports.unwrapChildrenFrom = unwrapChildrenFrom;
exports.experimental_moveSelection = experimental_moveSelection;
exports.getNextLeftEndpoint = getNextLeftEndpoint;
exports.getNextRightEndpoint = getNextRightEndpoint;
exports.alternativeGetNextPosition = alternativeGetNextPosition;
exports.setSelection = setSelection;
exports.experimental_resetRangeToTextNodes = experimental_resetRangeToTextNodes;
exports.interceptSyntheticKeyboardEvent = interceptSyntheticKeyboardEvent;
const checks_1 = require("./checks");
const selection_movements_1 = require("./selection_movements");
function bisect(myRef) {
    // incomplete, experiment
    console.log(window.getSelection());
    const selection = window.getSelection();
    function nearestElementAncestor(node) {
        if (node instanceof Element)
            return node;
        else
            return nearestElementAncestor((node === null || node === void 0 ? void 0 : node.parentNode) || null);
    }
    function getPreRange(range) {
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
    function getPostRange(range) {
        var _a;
        const { startOffset, endOffset, startContainer, endContainer } = range;
        const postRange = new Range();
        const safeAncestor = nearestElementAncestor(endContainer);
        postRange.setStart(endContainer, endOffset);
        console.log(postRange, safeAncestor, (_a = safeAncestor === null || safeAncestor === void 0 ? void 0 : safeAncestor.textContent) === null || _a === void 0 ? void 0 : _a.length);
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
        console.log({ preRange, postRange });
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
function nodeIsDescendentOf(node, query, limitingContainer) {
    let parentNode = node.parentNode;
    while (parentNode) {
        if (parentNode === limitingContainer)
            break;
        if (parentNode instanceof Element && parentNode.matches(query)) {
            return true;
        }
        else {
            parentNode = parentNode.parentNode;
        }
    }
    return false;
}
function getRangeUpTo(node, offset) {
    const range = new Range();
    range.setStartBefore(node);
    range.setEnd(node, offset);
    return range;
}
function getMidRange(firstNode, firstNodeOffset, finalNode, finalNodeOffset) {
    const range = new Range();
    range.setStart(firstNode, firstNodeOffset);
    range.setEnd(finalNode, finalNodeOffset);
    return range;
}
function getRangeAfter(node, offset) {
    const range = new Range();
    range.setStart(node, offset);
    range.setEndAfter(node);
    return range;
}
function splitNode(node, offset) {
    var _a, _b;
    const preRange = getRangeUpTo(node, offset);
    const postRange = getRangeAfter(node, offset);
    // if node is TEXT_NODE
    if (node.nodeType === Node.TEXT_NODE) {
        const preText = document.createTextNode(preRange.toString());
        (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(preText, node);
        const postText = document.createTextNode(postRange.toString());
        (_b = node.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(postText, node);
        return {
            anchorNode: preText,
            focusNode: postText
        };
    }
}
function selectionIsDescendentOf(selection, query, limitingContainer) {
    var _a, _b;
    if (!selection)
        return false;
    const range = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
    const filteredFocusNodeAncestors = [];
    let parentNode = (_a = selection.focusNode) === null || _a === void 0 ? void 0 : _a.parentNode;
    while (parentNode) {
        if (parentNode === limitingContainer)
            break;
        if (parentNode instanceof Element) {
            if (parentNode.matches(query))
                filteredFocusNodeAncestors.push(parentNode);
        }
        parentNode = parentNode.parentNode;
    }
    const filteredAnchorNodeAncestors = [];
    parentNode = (_b = selection.anchorNode) === null || _b === void 0 ? void 0 : _b.parentNode;
    while (parentNode) {
        if (parentNode === limitingContainer)
            break;
        if (parentNode instanceof Element) {
            if (parentNode.matches(query))
                filteredAnchorNodeAncestors.push(parentNode);
        }
        parentNode = parentNode.parentNode;
    }
    if (filteredFocusNodeAncestors.length === 0 || filteredAnchorNodeAncestors.length === 0) {
        return false;
    }
    else {
        for (let filteredAnchorNodeAncestor1 of filteredAnchorNodeAncestors) {
            for (let filteredAnchorNodeAncestor2 of filteredAnchorNodeAncestors) {
                if (filteredAnchorNodeAncestor1 === filteredAnchorNodeAncestor2)
                    return true;
            }
        }
    }
    return false;
}
function alternateBisect() {
    // incomplete, experiment
    var _a;
    const selection = window.getSelection();
    const thisRange = ((_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.getRangeAt(0)) || null;
    if (!thisRange || !selection) {
        console.log("no range and/or no selection");
        return;
    }
    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
    console.log({ anchorNode, anchorOffset, focusNode, focusOffset });
}
function sortNodes(nodeA, nodeAOffset, nodeB, nodeBOffset) {
    if (!nodeA || !nodeB || !nodeA.ownerDocument || !nodeB.ownerDocument || nodeA.ownerDocument !== nodeB.ownerDocument) {
        return null; // Nodes are not in the same document or are invalid
    }
    if (nodeA === nodeB) {
        if (nodeAOffset <= nodeBOffset) {
            const returnObj = {
                firstNode: nodeA,
                firstNodeOffset: nodeAOffset,
                finalNode: nodeB,
                finalNodeOffset: nodeBOffset
            };
            return returnObj;
        }
        else {
            const returnObj = {
                firstNode: nodeB,
                firstNodeOffset: nodeBOffset,
                finalNode: nodeA,
                finalNodeOffset: nodeAOffset
            };
            return returnObj;
        }
    }
    if ((nodeA.compareDocumentPosition(nodeB) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) {
        const returnObj = {
            firstNode: nodeA,
            firstNodeOffset: nodeAOffset,
            finalNode: nodeB,
            finalNodeOffset: nodeBOffset
        };
        return returnObj;
    }
    else {
        const returnObj = {
            firstNode: nodeB,
            firstNodeOffset: nodeBOffset,
            finalNode: nodeA,
            finalNodeOffset: nodeAOffset
        };
        return returnObj;
    }
}
function alternateAlternateBisect(boundingElement) {
    const selection = window.getSelection();
    if (!selection)
        return;
    const selectionRange = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
    if (!selectionRange)
        return;
    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
    if (anchorNode && focusNode) {
        const sortedNodes = sortNodes(anchorNode, anchorOffset, focusNode, focusOffset);
        if (sortedNodes) {
            const { firstNode, firstNodeOffset, finalNode, finalNodeOffset } = sortedNodes;
            // const {anchorNode, focusNode} = splitNode(firstNode, firstNodeOffset);
            // need to reset
            // selection.setBaseAndExtent()
            splitNode(finalNode, finalNodeOffset);
            return;
        }
        else {
            // pass
        }
    }
    if (anchorNode)
        splitNode(anchorNode, anchorOffset);
    if (focusNode)
        splitNode(focusNode, focusOffset);
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
// if node is bad return its Children
// if node is good return node
function cleanElementTypeFromSelection(elementName) {
    const selection = window.getSelection();
    if (!selection)
        return;
    const range = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
    const contents = range.extractContents();
    const cleaned = removeElementsByName(Array.from(contents.childNodes), elementName);
    for (let childNode of Array.from(cleaned)) {
        range.insertNode(childNode);
    }
    return;
}
// const selection = window.getSelection();
// const preRange = new Range();
// preRange.setStartBefore(selection.anchorNode.parentNode);
// preRange.setEnd(selection?.anchorNode, selection.anchorOffset);
// const contents = preRange.extractContents();
// for (let cn of contents.childNodes) {
//   preRange.insertNode(cn);
// }
function unwrapFromElement(contents, elementName) {
    // const selection = window.getSelection();
    // if (!selection) return;
    // const range = selection.getRangeAt(0);
    // const contents = range.extractContents();
    for (let childNode of Array.from(contents.childNodes)) {
        if (childNode.nodeName === elementName) {
            // childNode.extractContents ???? 
            for (let childToPromote of Array.from(childNode.childNodes)) {
                contents.insertBefore(childToPromote, childNode);
            }
        }
    }
    return contents;
}
function removeElementsByName(nodes, elementName) {
    for (let node of nodes) {
        console.log(node);
        if (!(node.parentNode))
            return nodes;
        if (node.nodeName === elementName) {
            for (let childNode of removeElementsByName(Array.from(node.childNodes), elementName)) {
                node.parentNode.insertBefore(childNode, node);
            }
            node.parentNode.removeChild(node);
        }
        else {
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
function unwrapChildrenFrom(selection, query) {
    var _a, _b;
    if (!selection || !selection.anchorNode || !selection.focusNode)
        return;
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
            (_a = result.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(child, result);
        }
        (_b = result.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(result);
    }
    range.insertNode(fragment);
    selection.removeAllRanges();
    selection.addRange(range);
    console.log(range);
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
function experimental_moveSelection(selection, limitingContainer, moveDirection) {
    const direction = (0, checks_1.getSelectionDirection)(selection);
    const { anchorNode, anchorOffset, focusNode, focusOffset } = selection;
    if (selection.rangeCount === 0)
        return;
    if (!anchorNode || !focusNode)
        return;
    const textNodes = (0, checks_1.getAllTextNodes)([limitingContainer]);
    if (!(anchorNode instanceof Text))
        (0, selection_movements_1.resetSelectionToTextNodes)();
    // if still not text, return
    if (!(anchorNode instanceof Text))
        return;
    // range is not collapsed
    if (direction !== "none") {
        if (moveDirection === "right") {
            return selection.collapseToEnd();
        }
        else if (moveDirection === "left") {
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
                const newIndex = (0, checks_1.getLastValidCharacterIndex)(currentNode, true, anchorOffset - 1);
                if (newIndex >= 0) {
                    // if this is skipping a zero-width space node, place cursor on left side of valid character
                    if (currentNode.textContent[newIndex] === '\u200B') {
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
                if (indexOfTextNode < 0)
                    return;
                // determine if is sibling
                // const isSibling = (textNodes[indexOfTextNode].parentNode === anchorNode.parentNode);
                const isSibling = (0, checks_1.areUninterruptedSiblingTextNodes)(anchorNode, textNodes[indexOfTextNode]);
                currentNode = textNodes[indexOfTextNode];
                if (isSibling) {
                    const newIndex = (0, checks_1.getLastValidCharacterIndex)(currentNode, false);
                    if (newIndex >= 0) {
                        // if this is skipping a zero-width space node, place cursor on left side of valid character
                        if (((anchorOffset - newIndex) > 1) || // this check may be redundant
                            currentNode.textContent[newIndex] === '\u200B') {
                            if (newIndex !== 0) {
                                return selection.setBaseAndExtent(currentNode, newIndex - 1, currentNode, newIndex - 1);
                            }
                            // else continue, exit if block, go to while loop
                        }
                        else {
                            return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
                        }
                    }
                }
                else {
                    const newIndex = (0, checks_1.getLastValidCharacterIndex)(currentNode, true);
                    // console.log({ newIndex })
                    if (newIndex >= 0) {
                        return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
                    }
                    else
                        continue;
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
                const { currentNode, newIndex } = endpoint;
                return selection.setBaseAndExtent(currentNode, newIndex, currentNode, newIndex);
            }
            else
                return;
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
function getNextLeftEndpoint(textNodes, startingIndexOfTextNode, startingOffset) {
    let indexOfTextNode = startingIndexOfTextNode;
    let offset = startingOffset;
    // index check
    if (indexOfTextNode < 0 ||
        indexOfTextNode >= textNodes.length) {
        return;
    }
    let currentNode = textNodes[indexOfTextNode];
    if (currentNode.textContent) {
    }
}
function getNextRightEndpoint(textNodes, startingIndexOfTextNode, startingOffset) {
    let indexOfTextNode = startingIndexOfTextNode;
    let offset = startingOffset;
    // index check
    if (indexOfTextNode < 0 ||
        indexOfTextNode >= textNodes.length) {
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
                return { currentNode, newIndex };
            }
        }
    }
    // else
    while (indexOfTextNode < textNodes.length) {
        indexOfTextNode++;
        if (indexOfTextNode >= textNodes.length)
            return;
        // determine if is sibling
        // const isSibling = (textNodes[indexOfTextNode].parentNode === anchorNode.parentNode);
        const isSibling = (0, checks_1.areUninterruptedSiblingTextNodes)(currentNode, textNodes[indexOfTextNode]);
        currentNode = textNodes[indexOfTextNode];
        if (!(currentNode instanceof Text))
            return; // narrow type
        if (isSibling && currentNode.textContent !== null) {
            const reMatch = currentNode
                .textContent
                .match(/[^\u200B]/);
            if (reMatch && reMatch.index !== undefined) {
                const newIndex = reMatch.index + 1;
                return { currentNode, newIndex };
            }
        }
        else {
            // if empty text
            if (currentNode.textContent === "") {
                return { currentNode, newIndex: 0 };
            }
            // if only character is zero-width space
            if (currentNode.textContent === "\u200B") {
                return { currentNode, newIndex: 1 };
            }
            // if is fully cushioned node
            if (currentNode.textContent !== null &&
                currentNode.textContent.split("").every(ch => ch === "\u200B")) {
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
                    return { currentNode, newIndex };
                }
            }
        }
    }
}
function alternativeGetNextPosition(direction, searchObject, originalNode, originalOffset, resetOnSiblingInterruption, resetOnBreakInterruption, currentNode, currentOffset) {
    if (!(originalNode instanceof Text))
        return;
    if (currentNode && !(currentNode instanceof Text))
        return;
    // move left or right
    if (direction === "right") {
        // searchCombinedText? or do this manually? 
        // If doing search combined text, will have difficulty with breaks, interruptions
        // if doing this manually will have a hard time 
    }
    else if (direction === "left") {
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
function setSelection(startContainer, startOffset, endContainer, endOffset) {
    const range = new Range();
    range.setStart(startContainer, startOffset);
    range.setEnd(endContainer, endOffset);
    const selection = window.getSelection();
    selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
    selection === null || selection === void 0 ? void 0 : selection.addRange(range);
    return selection;
}
function experimental_resetRangeToTextNodes(range) {
    // console.log(range.startContainer, range.startContainer.nodeType !== Node.TEXT_NODE, range.endContainer.nodeType !== Node.TEXT_NODE);
    var _a, _b, _c;
    // console.log("resetting range to text nodes");
    const collapsed = range.collapsed;
    // console.log({range});
    if (range.startContainer.nodeType !== Node.TEXT_NODE) {
        const startNode = range.startContainer.childNodes[range.startOffset];
        if (!startNode)
            return null;
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
                if ((_a = tw.currentNode.textContent) === null || _a === void 0 ? void 0 : _a.split("").every(ch => ch === '\u200B')) {
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
            }
            else {
                if (!tw.nextNode())
                    break;
            }
        }
    }
    else {
        const currentNode = range.startContainer;
        const content = currentNode.textContent;
        // console.log("startContainer is text node");    
        if (!content || (content.length === 0)) {
            console.log("first if");
            range.setStart(currentNode, 0);
        }
        // if it's fine, leave it
        // effectively does nothing except divert from later else ifs
        else if (content[range.startOffset] &&
            content[range.startOffset] !== '\u200B') {
            range.setStart(currentNode, range.startOffset);
        }
        // if purely cushioned node, place after first zero-width space
        else if ((_b = currentNode.textContent) === null || _b === void 0 ? void 0 : _b.split("").every(ch => ch === '\u200B')) {
            // console.log("second if");
            range.setStart(currentNode, 1);
        }
        // go outwards from startOffset to find nearest non-zws
        else
            for (let i = 1; i < content.length; i++) {
                // console.log("last for loop ", i);
                if (range.startOffset - i >= 0 &&
                    content[range.startOffset - i] !== '\u200B') {
                    range.setStart(currentNode, range.startOffset - i + 1);
                    break;
                }
                else if (range.startOffset <= content.length &&
                    content[range.startOffset + i]) {
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
            if (!tw.nextNode())
                break; // advance tw, break loop if null
        }
        // console.log("sanity check 4");
        range.setEnd(lastTextNode, ((_c = lastTextNode.textContent) === null || _c === void 0 ? void 0 : _c.length) || 0);
    }
    return range;
}
function interceptSyntheticKeyboardEvent(e, callback) {
    var _a;
    if (e.nativeEvent.safeToProceed) {
        console.log("safe to proceed");
        // do not interfere with 
        return;
    }
    else {
        console.log(e);
        e.preventDefault();
        e.stopPropagation();
        console.log("preventing default, intercepting event and performing callback");
        callback(e);
        const copiedEvent = new KeyboardEvent(e.type, {
            // isTrusted: true - cannot be directly assigned, defaults to false and causes SyntheticEvent not to fire
            altKey: e.altKey,
            code: e.code,
            ctrlKey: e.ctrlKey,
            isComposing: e.nativeEvent.isComposing,
            key: e.key,
            location: e.location,
            metaKey: e.metaKey,
            repeat: e.repeat,
            shiftKey: e.shiftKey
        });
        e.nativeEvent.safeToProceed = true;
        console.log(copiedEvent);
        (_a = e.nativeEvent.target) === null || _a === void 0 ? void 0 : _a.dispatchEvent(copiedEvent);
    }
}
