"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bisect = bisect;
exports.wrapInElement = wrapInElement;
exports.promoteChildrenOfNode = promoteChildrenOfNode;
exports.unwrapChildrenFrom = unwrapChildrenFrom;
exports.nodeIsDescendentOf = nodeIsDescendentOf;
exports.selectionIsDescendentOf = selectionIsDescendentOf;
exports.selectionIsDescendentOfNode = selectionIsDescendentOfNode;
function alternateBisect() {
    // incomplete, experiment
    var _a;
    var selection = window.getSelection();
    var thisRange = ((_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.getRangeAt(0)) || null;
    if (!thisRange || !selection) {
        console.log("no range and/or no selection");
        return;
    }
    var anchorNode = selection.anchorNode, anchorOffset = selection.anchorOffset, focusNode = selection.focusNode, focusOffset = selection.focusOffset;
    console.log({ anchorNode: anchorNode, anchorOffset: anchorOffset, focusNode: focusNode, focusOffset: focusOffset });
}
function bisect(myRef) {
    // incomplete, experiment
    console.log(window.getSelection());
    var selection = window.getSelection();
    function nearestElementAncestor(node) {
        if (node instanceof Element)
            return node;
        else
            return nearestElementAncestor((node === null || node === void 0 ? void 0 : node.parentNode) || null);
    }
    function getPreRange(range) {
        var startOffset = range.startOffset, endOffset = range.endOffset, startContainer = range.startContainer, endContainer = range.endContainer;
        var preRange = new Range();
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
        var startOffset = range.startOffset, endOffset = range.endOffset, startContainer = range.startContainer, endContainer = range.endContainer;
        var postRange = new Range();
        var safeAncestor = nearestElementAncestor(endContainer);
        postRange.setStart(endContainer, endOffset);
        console.log(postRange, safeAncestor, (_a = safeAncestor === null || safeAncestor === void 0 ? void 0 : safeAncestor.textContent) === null || _a === void 0 ? void 0 : _a.length);
        if (safeAncestor) {
            postRange.setEnd(safeAncestor, 1);
        }
        return postRange;
    }
    if (myRef.current && selection && selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        var startOffset = range.startOffset, endOffset = range.endOffset, startContainer = range.startContainer, endContainer = range.endContainer;
        console.log("range", range);
        var preRange = getPreRange(range);
        var postRange = getPostRange(range);
        console.log({ preRange: preRange, postRange: postRange });
        var preRangeSpan = document.createElement("span");
        var preRangeContents = preRange.extractContents();
        preRangeSpan.append(preRangeContents);
        preRange.startContainer.appendChild(preRangeSpan);
        // preRange.startContainer.appendChild(preRangeContents);
        var postRangeSpan = document.createElement("span");
        var postRangeContents = postRange.extractContents();
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
function getRangeUpTo(node, offset) {
    var range = new Range();
    range.setStartBefore(node);
    range.setEnd(node, offset);
    return range;
}
function getMidRange(firstNode, firstNodeOffset, finalNode, finalNodeOffset) {
    var range = new Range();
    range.setStart(firstNode, firstNodeOffset);
    range.setEnd(finalNode, finalNodeOffset);
    return range;
}
function getRangeAfter(node, offset) {
    var range = new Range();
    range.setStart(node, offset);
    range.setEndAfter(node);
    return range;
}
function splitNode(node, offset) {
    var _a, _b;
    var preRange = getRangeUpTo(node, offset);
    var postRange = getRangeAfter(node, offset);
    // if node is TEXT_NODE
    if (node.nodeType === 3) {
        var preText = document.createTextNode(preRange.toString());
        (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(preText, node);
        var postText = document.createTextNode(postRange.toString());
        (_b = node.parentNode) === null || _b === void 0 ? void 0 : _b.replaceChild(postText, node);
        return {
            anchorNode: preText,
            focusNode: postText
        };
    }
}
function sortNodes(nodeA, nodeAOffset, nodeB, nodeBOffset) {
    if (!nodeA || !nodeB || !nodeA.ownerDocument || !nodeB.ownerDocument || nodeA.ownerDocument !== nodeB.ownerDocument) {
        return null; // Nodes are not in the same document or are invalid
    }
    if (nodeA === nodeB) {
        if (nodeAOffset <= nodeBOffset) {
            var returnObj = {
                firstNode: nodeA,
                firstNodeOffset: nodeAOffset,
                finalNode: nodeB,
                finalNodeOffset: nodeBOffset
            };
            return returnObj;
        }
        else {
            var returnObj = {
                firstNode: nodeB,
                firstNodeOffset: nodeBOffset,
                finalNode: nodeA,
                finalNodeOffset: nodeAOffset
            };
            return returnObj;
        }
    }
    if ((nodeA.compareDocumentPosition(nodeB) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0) {
        var returnObj = {
            firstNode: nodeA,
            firstNodeOffset: nodeAOffset,
            finalNode: nodeB,
            finalNodeOffset: nodeBOffset
        };
        return returnObj;
    }
    else {
        var returnObj = {
            firstNode: nodeB,
            firstNodeOffset: nodeBOffset,
            finalNode: nodeA,
            finalNodeOffset: nodeAOffset
        };
        return returnObj;
    }
}
function alternateAlternateBisect(boundingElement) {
    var selection = window.getSelection();
    if (!selection)
        return;
    var selectionRange = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
    if (!selectionRange)
        return;
    var anchorNode = selection.anchorNode, anchorOffset = selection.anchorOffset, focusNode = selection.focusNode, focusOffset = selection.focusOffset;
    if (anchorNode && focusNode) {
        var sortedNodes = sortNodes(anchorNode, anchorOffset, focusNode, focusOffset);
        if (sortedNodes) {
            var firstNode = sortedNodes.firstNode, firstNodeOffset = sortedNodes.firstNodeOffset, finalNode = sortedNodes.finalNode, finalNodeOffset = sortedNodes.finalNodeOffset;
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
function wrapInElement(selection, element) {
    if (!selection)
        return;
    var range = selection.getRangeAt(0);
    var contents = range.extractContents();
    console.log(element);
    element.append(contents);
    range.insertNode(element);
}
function unwrapFromElement(contents, elementName) {
    // const selection = window.getSelection();
    // if (!selection) return;
    // const range = selection.getRangeAt(0);
    // const contents = range.extractContents();
    for (var _i = 0, _a = Array.from(contents.childNodes); _i < _a.length; _i++) {
        var childNode = _a[_i];
        if (childNode.nodeName === elementName) {
            // childNode.extractContents ???? 
            for (var _b = 0, _c = Array.from(childNode.childNodes); _b < _c.length; _b++) {
                var childToPromote = _c[_b];
                contents.insertBefore(childToPromote, childNode);
            }
        }
    }
    return contents;
}
function removeElementsByName(nodes, elementName) {
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node_1 = nodes_1[_i];
        console.log(node_1);
        if (!(node_1.parentNode))
            return nodes;
        if (node_1.nodeName === elementName) {
            for (var _a = 0, _b = removeElementsByName(Array.from(node_1.childNodes), elementName); _a < _b.length; _a++) {
                var childNode = _b[_a];
                node_1.parentNode.insertBefore(childNode, node_1);
            }
            node_1.parentNode.removeChild(node_1);
        }
        else {
            var newChildren = removeElementsByName(Array.from(node_1.childNodes), elementName);
            for (var _c = 0, _d = Array.from(node_1.childNodes); _c < _d.length; _c++) {
                var child = _d[_c];
                node_1.removeChild(child);
            }
            for (var _e = 0, newChildren_1 = newChildren; _e < newChildren_1.length; _e++) {
                var child = newChildren_1[_e];
                node_1.appendChild(child);
            }
        }
    }
    return nodes;
}
function cleanElementTypeFromSelection(elementName) {
    var selection = window.getSelection();
    if (!selection)
        return;
    var range = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
    var contents = range.extractContents();
    var cleaned = removeElementsByName(Array.from(contents.childNodes), elementName);
    for (var _i = 0, _a = Array.from(cleaned); _i < _a.length; _i++) {
        var childNode = _a[_i];
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
function promoteChildrenOfNode(node) {
    if (node.parentNode) {
        for (var _i = 0, _a = Array.from(node.childNodes); _i < _a.length; _i++) {
            var child = _a[_i];
            node.parentNode.insertBefore(child, node);
        }
    }
}
function unwrapChildrenFrom(query) {
    var _a, _b;
    var selection = window.getSelection();
    if (!selection)
        return;
    var range = selection.getRangeAt(0);
    var fragment = range.extractContents();
    // const childNodes = Array.from(fragment.childNodes);
    // for (let childNode of childNodes) {
    //   const queryResults = childNode.querySelectorAll(query);
    // }
    // range.ins
    var queryResults = Array.from(fragment.querySelectorAll(query));
    for (var _i = 0, queryResults_1 = queryResults; _i < queryResults_1.length; _i++) {
        var result = queryResults_1[_i];
        var childNodes = Array.from(result.childNodes);
        for (var _c = 0, childNodes_1 = childNodes; _c < childNodes_1.length; _c++) {
            var child = childNodes_1[_c];
            (_a = result.parentNode) === null || _a === void 0 ? void 0 : _a.insertBefore(child, result);
        }
        (_b = result.parentNode) === null || _b === void 0 ? void 0 : _b.removeChild(result);
    }
    range.insertNode(fragment);
    selection.removeAllRanges();
    selection.addRange(range);
    console.log(range);
}
function nodeIsDescendentOf(node, query, limitingContainer) {
    var parentNode = node.parentNode;
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
function selectionIsDescendentOf(selection, query, limitingContainer) {
    var _a, _b;
    if (!selection)
        return false;
    var range = selection === null || selection === void 0 ? void 0 : selection.getRangeAt(0);
    var filteredFocusNodeAncestors = [];
    var parentNode = (_a = selection.focusNode) === null || _a === void 0 ? void 0 : _a.parentNode;
    while (parentNode) {
        if (parentNode === limitingContainer)
            break;
        if (parentNode instanceof Element) {
            if (parentNode.matches(query))
                filteredFocusNodeAncestors.push(parentNode);
        }
        parentNode = parentNode.parentNode;
    }
    var filteredAnchorNodeAncestors = [];
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
        for (var _i = 0, filteredAnchorNodeAncestors_1 = filteredAnchorNodeAncestors; _i < filteredAnchorNodeAncestors_1.length; _i++) {
            var ffna = filteredAnchorNodeAncestors_1[_i];
            for (var _c = 0, filteredAnchorNodeAncestors_2 = filteredAnchorNodeAncestors; _c < filteredAnchorNodeAncestors_2.length; _c++) {
                var fana = filteredAnchorNodeAncestors_2[_c];
                if (ffna === fana)
                    return true;
            }
        }
    }
    return false;
}
function nodeIsDescendentOfNode(node, ancestorNode) {
    var parentNode = node.parentNode;
    while (parentNode) {
        if (parentNode === ancestorNode)
            return true;
        parentNode = parentNode.parentNode;
    }
    return false;
}
function selectionIsDescendentOfNode(selection, ancestorNode) {
    // console.log(    
    //   Boolean(selection.anchorNode),
    //   Boolean(selection.focusNode),
    //   !!selection.anchorNode && nodeIsDescendentOfNode(selection.anchorNode, ancestorNode),
    //   !!selection.focusNode && nodeIsDescendentOfNode(selection.focusNode, ancestorNode) 
    // )
    return (selection.anchorNode &&
        selection.focusNode &&
        nodeIsDescendentOfNode(selection.anchorNode, ancestorNode) &&
        nodeIsDescendentOfNode(selection.focusNode, ancestorNode));
}
function getAllTextNodes(nodes) {
    var textNodes = [];
    // let currentNode = node;
    function descendNode(cn) {
        if (cn.nodeType === Node.TEXT_NODE) {
            textNodes.push(cn);
        }
        if (cn.hasChildNodes()) {
            for (var _i = 0, _a = Array.from(cn.childNodes); _i < _a.length; _i++) {
                var nextGeneration = _a[_i];
                descendNode(nextGeneration);
            }
        }
    }
    for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
        var currentNode = nodes_2[_i];
        descendNode(currentNode);
    }
    return textNodes;
}
function getSelectionChildNodes(limitingContainer) {
    var selection = window.getSelection();
    if (!selection)
        return [];
    var _a = selection.getRangeAt(0), startContainer = _a.startContainer, endContainer = _a.endContainer;
    var tw = document.createTreeWalker(limitingContainer);
    var childNodes = [];
    var inRange = false;
    while (true) {
        var currentNode = tw.nextNode();
        // if (currentNode) childNodes.push(currentNode);
        // else break;
        if (!currentNode)
            break;
        if (!inRange) {
            if (currentNode == startContainer)
                inRange = true;
        }
        // not else, can flip switch and then progress
        if (inRange) {
            childNodes.push(currentNode);
            if (currentNode == endContainer)
                break;
        }
    }
    return childNodes;
    // const firstIndex = childNodes.findIndex(cn => cn === selection.getRangeAt(0).startContainer);
    // return Array.from(selection.getRangeAt(0).cloneContents().childNodes)
}
function selectionCoveredBy(query, limitingContainer) {
    var nodes = getSelectionChildNodes(limitingContainer);
    var textNodes = nodes
        .filter(function (n) { return n.nodeType === 3; })
        .filter(function (n) { return n.textContent && n.textContent.length > 0; });
    return textNodes.every(function (tn) { return nodeIsDescendentOf(tn, query, limitingContainer); });
}
