import { useEditableContentContext } from "editable-content";
import { wrapInElement, generateQuery, createWrapper, unwrapSelectionFromQuery, promoteChildrenOfNode, deleteEmptyElements, cushionTextNode, resetTextNodesCushions } from "@/packages/editable-content/src/utils/dom_operations";
import { selectionIsDescendentOfNode, selectionIsCoveredBy, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, getRangeChildNodes, getAncestorNode, getAllTextNodes, textNodeIsCushioned, isValidTextEndpoint, getNextPosition, identifyBadTextNodes, getReMatch, resetSelectionToTextNodes, moveSelection } from "editable-content/utils";
import { useEffect } from "react";
import { renderToString } from "react-dom/server";

// Test component for exposing utils and context to window


declare global {
  interface Window {
    wrapInElement?: typeof wrapInElement;
    selectionIsDescendentOfNode?: typeof selectionIsDescendentOfNode;
    generateQuery?: typeof generateQuery;
    selectionIsCoveredBy?: typeof selectionIsCoveredBy;
    createWrapper?: typeof createWrapper;
    unwrapSelectionFromQuery?: typeof unwrapSelectionFromQuery;
    resetSelectionToTextNodes?: typeof resetSelectionToTextNodes;
    selectionHasTextNodes?: typeof selectionHasTextNodes;
    getSelectionChildNodes?: typeof getSelectionChildNodes;
    selectionContainsOnlyText?: typeof selectionContainsOnlyText;
    getButtonStatus?: typeof getButtonStatus;
    getRangeLowestAncestorElement?: typeof getRangeLowestAncestorElement;
    promoteChildrenOfNode?: typeof promoteChildrenOfNode;
    deleteEmptyElements?: typeof deleteEmptyElements;
    moveSelection?: typeof moveSelection;
    getRangeChildNodes?: typeof getRangeChildNodes;
    limitingContainer?: any;
    getAncestorNode?: typeof getAncestorNode;
    initialHTML?: string;
    renderToString?: typeof renderToString
    contentRef: any;
    contentRefCurrentInnerHTML?: any;
    setContentRefCurrentInnerHTML?: any;
    selectionToString?: any;
    setSelectionToString?: any;
    selectionAnchorNode?: any;
    setSelectionAnchorNode?: any;
    selectionAnchorOffset?: any;
    setSelectionAnchorOffset?: any;
    selectionFocusNode?: any;
    setSelectionFocusNode?: any;
    selectionFocusOffset?: any;
    setSelectionFocusOffset?: any;
    hasSelection?: any;
    setHasSelection?: any;
    portals?: any;
    setPortals?: any;
    divToSetSelectionTo?: any;
    setDivToSetSelectionTo?: any;
    prepareDehydratedHTML?: any;
    updatePortalProps?: any;
    getAllPortalProps?: any;
    keyAndWrapperObjs?: any;
    updateContent?: any;
    createContentPortal?: any;
    appendPortalToDiv?: any;
    removePortal?: any;
    updateSelection?: any;
    dehydratedHTML?: any;
    getAllTextNodes: any;
    textNodeIsCushioned: (textNode: Text) => boolean;
    cushionTextNode: (textNode: Text) => void;
    resetTextNodesCushions: (textNodes: Array<Text>) => void;
    isValidTextEndpoint: any,
    getNextPosition: any,
    identifyBadTextNodes: any,
    getReMatch: any
  }
}

export default function ContextWindowExposure() {

  const {
    contentRef,
    contentRefCurrentInnerHTML,
    setContentRefCurrentInnerHTML,
    selectionToString,
    setSelectionToString,
    selectionAnchorNode,
    setSelectionAnchorNode,
    selectionAnchorOffset,
    setSelectionAnchorOffset,
    selectionFocusNode,
    setSelectionFocusNode,
    selectionFocusOffset,
    setSelectionFocusOffset,
    hasSelection,
    setHasSelection,
    portals,
    setPortals,
    divToSetSelectionTo,
    setDivToSetSelectionTo,
    updatePortalProps,
    getAllPortalProps,
    keyAndWrapperObjs,
    updateContent,
    createContentPortal,
    appendPortalToDiv,
    removePortal,
    updateSelection,
    dehydratedHTML,
  } = useEditableContentContext();

  useEffect(function () {
    window.contentRef = contentRef;
    window.contentRefCurrentInnerHTML = contentRefCurrentInnerHTML;
    window.setContentRefCurrentInnerHTML = setContentRefCurrentInnerHTML;
    window.selectionToString = selectionToString;
    window.setSelectionToString = setSelectionToString;
    window.selectionAnchorNode = selectionAnchorNode;
    window.setSelectionAnchorNode = setSelectionAnchorNode;
    window.selectionAnchorOffset = selectionAnchorOffset;
    window.setSelectionAnchorOffset = setSelectionAnchorOffset;
    window.selectionFocusNode = selectionFocusNode;
    window.setSelectionFocusNode = setSelectionFocusNode;
    window.selectionFocusOffset = selectionFocusOffset;
    window.setSelectionFocusOffset = setSelectionFocusOffset;
    window.hasSelection = hasSelection;
    window.setHasSelection = setHasSelection;
    window.portals = portals;
    window.setPortals = setPortals;
    window.divToSetSelectionTo = divToSetSelectionTo;
    window.setDivToSetSelectionTo = setDivToSetSelectionTo;
    window.updatePortalProps = updatePortalProps;
    window.getAllPortalProps = getAllPortalProps;
    window.keyAndWrapperObjs = keyAndWrapperObjs;
    window.updateContent = updateContent;
    window.createContentPortal = createContentPortal;
    window.appendPortalToDiv = appendPortalToDiv;
    window.removePortal = removePortal;
    window.updateSelection = updateSelection;
    window.dehydratedHTML = dehydratedHTML;
    window.getAllTextNodes = getAllTextNodes;
    window.textNodeIsCushioned = textNodeIsCushioned;
    window.cushionTextNode = cushionTextNode;
    window.resetTextNodesCushions = resetTextNodesCushions;
    window.isValidTextEndpoint = isValidTextEndpoint;
    window.getRangeChildNodes = getRangeChildNodes;
    window.moveSelection = moveSelection;
    window.getNextPosition = getNextPosition;
    window.identifyBadTextNodes = identifyBadTextNodes;
    window.getReMatch = getReMatch;
    window.wrapInElement = wrapInElement;
    window.selectionIsDescendentOfNode = selectionIsDescendentOfNode;
    window.generateQuery = generateQuery;
    window.selectionIsCoveredBy = selectionIsCoveredBy;
    window.createWrapper = createWrapper;
    window.unwrapSelectionFromQuery = unwrapSelectionFromQuery;
    window.resetSelectionToTextNodes = resetSelectionToTextNodes;
    window.selectionHasTextNodes = selectionHasTextNodes;
    window.getSelectionChildNodes = getSelectionChildNodes;
    window.selectionContainsOnlyText = selectionContainsOnlyText;
    window.getButtonStatus = getButtonStatus;
    window.getRangeLowestAncestorElement = getRangeLowestAncestorElement;
    window.promoteChildrenOfNode = promoteChildrenOfNode;
    window.deleteEmptyElements = deleteEmptyElements;
    window.moveSelection = moveSelection;
    window.getRangeChildNodes = getRangeChildNodes;
    window.limitingContainer = document.querySelector("[contenteditable]")
    window.getAncestorNode = getAncestorNode;
    window.renderToString = renderToString
  }, []);

  return <></>;
}