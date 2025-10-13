import React, { useContext, createContext, useRef, useState, SetStateAction, Dispatch, MutableRefObject, ReactPortal, ReactNode, ReactElement, cloneElement, isValidElement, useEffect } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from 'uuid';
import { EXCLUDE_FROM_DEHYDRATED, PORTAL_CONTAINER_ID_PREFIX } from "./utils/constants";
import { selectionIsDescendentOfNode, getRangeChildNodes, getAllTextNodes,   identifyBadTextNodes, getIsReactComponent, getSelectionDirection, getRangeLowestAncestorElement } from "./utils/checks";
import { deleteEmptyElements, resetTextNodesCushions } from "./utils/dom_operations";
import { resetSelectionToTextNodes } from "./utils/selection_movements";



type PortalProps = {
  [key: string]: { [key: string]: any }
}


type KeyAndWrapperObj = {
  dataKey: string,
  wrapper: React.ReactElement,
}


type EditableContentContextProviderProps = {
  children: ReactNode,
  keyAndWrapperObjs: Array<KeyAndWrapperObj>,
  initialHTML?: string,
  initialProps?: PortalProps
}


export type EditableContentContextType = {
  contextInstanceIdRef: MutableRefObject<string>,
  contentRef: MutableRefObject<HTMLDivElement | null>,
  contentRefCurrentInnerHTML: string,
  setContentRefCurrentInnerHTML: Dispatch<SetStateAction<string>>,
  selectionToString: string,
  setSelectionToString: Dispatch<SetStateAction<string>>,
  selectionAnchorNode: Node | null,
  setSelectionAnchorNode: Dispatch<SetStateAction<Node | null>>,
  selectionAnchorOffset: number | null,
  setSelectionAnchorOffset: Dispatch<SetStateAction<number | null>>,
  selectionFocusNode: Node | null,
  setSelectionFocusNode: Dispatch<SetStateAction<Node | null>>,
  selectionFocusOffset: number | null,
  setSelectionFocusOffset: Dispatch<SetStateAction<number | null>>,
  hasSelection: boolean,
  setHasSelection: Dispatch<SetStateAction<boolean>>,
  portals: Array<ReactPortal>,
  setPortals: Dispatch<SetStateAction<Array<ReactPortal>>>,
  divToSetSelectionTo: HTMLElement | null,
  setDivToSetSelectionTo: Dispatch<SetStateAction<HTMLElement | null>>,
  // prepareDehydratedHTML: (callback: (dehydrated: string) => void) => void,
  updatePortalProps: (updateObj: PortalProps) => void,
  getAllPortalProps: () => PortalProps,
  keyAndWrapperObjs: Array<KeyAndWrapperObj>,
  updateContent: () => void,
  createContentPortal: (component: ReactElement, buttonKey: string) => string | undefined,
  appendPortalToDiv: (containingDiv: HTMLDivElement) => void,
  removePortal: (key: string) => void,
  updateSelection: () => void,
  dehydratedHTML: string,
  resetPortalContainers: () => void,
  assignContentRef: (newRef: null | HTMLDivElement) => void
  buttonUpdateTrigger: boolean,
  triggerButtonUpdate: () => void
}


export const EditableContentContext = createContext<EditableContentContextType | null>(null);


export function EditableContentContextProvider({ children, keyAndWrapperObjs, initialHTML, initialProps }: EditableContentContextProviderProps) {  
  
  const contentRef = useRef<null | HTMLDivElement>(null);
  const [contentRefCurrentInnerHTML, setContentRefCurrentInnerHTML] = useState<string>("");
  const [selectionToString, setSelectionToString] = useState<string>("");
  const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<number | null>(null);
  const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  const [selectionFocusOffset, setSelectionFocusOffset] = useState<number | null>(null);
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [portals, setPortals] = useState<Array<React.ReactPortal>>([]);
  const [divToSetSelectionTo, setDivToSetSelectionTo] = useState<HTMLElement | null>(null)
  const [dehydratedHTML, setDehydratedHTML] = useState<string>(initialHTML || "")
  const [buttonUpdateTrigger, setButtonUpdateTrigger] = useState<boolean>(false);
  const contextInstanceIdRef = useRef<string>(uuidv4());
  const portalsResetting = useRef<boolean>(false);
  
  function triggerButtonUpdate() {
    setButtonUpdateTrigger(!buttonUpdateTrigger)
  }

  /**
   * Used in place of ref={contentRef} to avoid race condition
   * in resetting ref on component render
   * @param newRef 
   */
  function assignContentRef(newRef: null | HTMLDivElement) {
    contentRef.current = newRef;
  }

  useEffect(function () {
    // console.log("contentRefCurrentInnerHTML changing:", contentRefCurrentInnerHTML)
    prepareDehydratedHTML(setDehydratedHTML);
  }, [contentRefCurrentInnerHTML])

  useEffect(function() {
    portalsResetting.current = false;
  }, [portals])

  /**
   * Create DOMParser from current html of contentRef.current, remove
   * all tags which are marked for exclusion, find divs which house 
   * portals, remove all contents of those divs except text, pass 
   * dehydrated html to callback.
   * @param callback 
   */
  function prepareDehydratedHTML(callback: (dehydrated: string) => void) {

    // create manipulable copy of contentRefCurrentInnerHTML
    const parsedHTMLBody = (typeof window !== "undefined") ?
      new DOMParser().parseFromString(contentRefCurrentInnerHTML, "text/html").body :
      null;

    if (!parsedHTMLBody) return;

    // remove all tags marked for exclusion
    const tagsToIgnore = Array.from(parsedHTMLBody.querySelectorAll(`[${EXCLUDE_FROM_DEHYDRATED}]`));
    try {
      tagsToIgnore.forEach(tti => tti.remove());
    } catch(err) {
      console.log("PROBLEM:");
      console.log(err);
    }

    // console.log("safe to 128");
    const portalDivs = Array.from(parsedHTMLBody.querySelectorAll("div[data-button-key]"));

    console.log("number of react portal divs:", portalDivs.length)
    // console.log("safe to 132");
    for (let div of portalDivs) {
      const divRange = new Range();
      divRange.setStart(div, 0);
      divRange.setEnd(div, div.childNodes.length);
      const textNodes = getRangeChildNodes(divRange, parsedHTMLBody)
        .filter(cn => cn.nodeType === Node.TEXT_NODE);

      divRange.extractContents();
      textNodes.forEach(tn => {
        divRange.insertNode(tn)
      });
    }

    // console.log("safe to 146");
    return callback(parsedHTMLBody.innerHTML);
  }


  /** 
   * Go through the keys of the update object, find the corresponding portal 
   * in portals, clone portal with new props, filter out original portals and
   * then setPortals with clones
   * @param updateObj
   */
  function updatePortalProps(updateObj: PortalProps) {

    const portalClones: Array<ReactPortal> = [];
    const portalIds = Object.keys(updateObj); // ids of portals to update only

    if (portalIds.length === 0) return; // prevent unnecessary setPortals especially during dev re-render

    return setPortals(previousPortals => {

      portalIds.forEach(portalId => {
        const foundPortalIndex = previousPortals.findIndex(portal => portal.key === portalId);
        if (foundPortalIndex < 0) return;

        const container = contentRef.current?.querySelector(`#portal-container-${portalId}`);
        if (!container) return;

        const foundPortal = previousPortals[foundPortalIndex];
        if (!foundPortal) return;

        const targetComponent = foundPortal.children;
        if (!isValidElement(targetComponent)) return;

        // else proceed
        const props = Object.assign({}, targetComponent.props, updateObj[portalId]);
        const clone = cloneElement(targetComponent, props, targetComponent.props.children);
        const clonedPortal = createPortal(clone, container, portalId);
        portalClones.push(clonedPortal);

      })

      if (portalClones.length === 0) return previousPortals; // second check to prevent bad setState

      // remove stale portals, replace with portalClones
      return ([
        ...previousPortals.filter(portal => portal.key === null || !portalIds.includes(portal.key)),
        ...(portalClones as Array<ReactPortal>)
      ])
    })
  }


  /**
   * Updates portals state by extracting children from the div 
   * which will house the portal, then passing those children to
   * the portal
   * @returns 
   */
  function resetPortalContainers() {

    if (portalsResetting.current === true) return;
    else portalsResetting.current = true;

    return setPortals(previousPortals => {

      const portalClones: Array<ReactPortal> = [];

      previousPortals.forEach(function (portal) {
        const portalId = portal.key;
        const container = contentRef.current?.querySelector(`#portal-container-${portalId}`);
        if (!container) return;

        const children = container.innerHTML;
        container.innerHTML = "";

        const foundPortalIndex = previousPortals.findIndex(portal => portal.key === portalId);
        if (foundPortalIndex < 0) return;

        const foundPortal = previousPortals[foundPortalIndex];
        if (!foundPortal) return;

        const targetComponent = foundPortal.children;
        if (!isValidElement(targetComponent)) return;

        const clone = cloneElement(targetComponent, targetComponent.props, children);
        const clonedPortal = createPortal(clone, container, portalId);
        portalClones.push(clonedPortal);

      })

      return portalClones;

    })
  }


  /**
   * Gets current props for all portals in context
   * @returns PortalProps
   */
  function getAllPortalProps(): PortalProps {
    return Object.assign({}, ...portals.map(portal => {
      const targetComponent = portal.children;
      if (!isValidElement(targetComponent)) return null;
      const key = portal.key;
      if (!key) return null;
      return { [key]: targetComponent.props }
    }));
  }


  /**
   * Update state related to selection to reflect the 
   * current window.getSelection()
   */
  function updateSelection() {
    resetScroll();
    const gotSelection = window.getSelection();

    // if selection is within contentRef.current or IS contentRef.current
    if (
      gotSelection &&
      contentRef.current &&
      (selectionIsDescendentOfNode(gotSelection, contentRef.current) ||
        (
          gotSelection.anchorNode === contentRef.current &&
          gotSelection.focusNode === contentRef.current
        ))
    ) {
      setSelectionToString(gotSelection.toString());
      setSelectionAnchorNode(gotSelection.anchorNode);
      setSelectionAnchorOffset(gotSelection.anchorOffset);
      setSelectionFocusNode(gotSelection.focusNode);
      setSelectionFocusOffset(gotSelection.focusOffset);
    } else {
      setSelectionToString("");
    }
  }


  /**
   * Reset selection to text nodes, setContentRefCurrentInnerHTML
   * (which will also update dehydrated HTML on useEffect), restore
   * focus on contentRef
   */
  function updateContent() {

    /**
     * Get all text nodes in contentRef.current, make sure 
     * that they begin and end with a zero width space
     */

    if (contentRef.current) {
      const textNodes = getAllTextNodes([contentRef.current]);

      resetTextNodesCushions(textNodes);
      const badTextNodes = identifyBadTextNodes(textNodes, contentRef.current);
      badTextNodes.forEach(btn => btn.remove());
      deleteEmptyElements(contentRef.current);
    }

    if (hasSelection) {
      resetSelectionToTextNodes();
    }
    setContentRefCurrentInnerHTML(contentRef?.current?.innerHTML || "");
    contentRef.current?.focus();
  }


  // TODO: rework vertical logic to comprehensive approach based on focus node/offset
  /**
   * Reset scroll of container by
   * - scrolling up if range is above current view
   * - scrolling down if range is below current view
   * - scrolling left if range is to left of current view
   * - scrolling right if range is to right of current view
   * @returns 
   */
  function resetScroll() {
    
    // initialize
    const range = window.getSelection()?.getRangeAt(0);
    const selectionDirection = getSelectionDirection(window.getSelection());

    if (!range || ! contentRef.current) return;
    const rangeRect = range.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();

    const comparisonRange = range.cloneRange();

    if (selectionDirection === "backward") comparisonRange.collapse(true);
    else comparisonRange.collapse(false);

    // vertical reset scroll
    if (
      rangeRect.top >= containerRect.top &&
      rangeRect.top <= (containerRect.top + containerRect.height) &&
      (rangeRect.top + rangeRect.height) >= containerRect.top &&
      (rangeRect.top + rangeRect.height) <= (containerRect.top + containerRect.height)
    ) {
      // do nothing, range is visible within current lc scroll
    } else {

      // range is above current lc scroll window
      if (rangeRect.top < containerRect.top) {
        // targetOffset is distance between rangeRect and where it should be
        const targetOffset = containerRect.top - rangeRect.top;
        contentRef.current.scroll(0, contentRef.current.scrollTop - targetOffset);
      }
      // range is below current lc scroll window
      else if ((rangeRect.top + rangeRect.height) >= (containerRect.top + containerRect.height)) {
        // targetOffset is distance between rangeRect and where it should be
        const targetOffset = (rangeRect.top + rangeRect.height) - (containerRect.top + containerRect.height);
        contentRef.current.scroll(0, contentRef.current.scrollTop + targetOffset);
      }
    }

    // horizontal reset scroll
    const comparisonRangeRect = comparisonRange.getBoundingClientRect();

    if (comparisonRangeRect.left < containerRect.left) {
      contentRef.current.scrollBy(comparisonRangeRect.left - containerRect.left, 0);
    }
    if (comparisonRangeRect.right > containerRect.right) {
      contentRef.current.scrollBy(comparisonRangeRect.right - containerRect.right, 0);
    }

  }


  /**
   * Clone react component with child text. If this is the first time this 
   * portal is being created, load initial props for this component if they
   * exist, create portal, add portal to portals.
   * @param component 
   * @param props 
   * @param text 
   * @param targetDiv 
   */
  function cloneElementIntoPortal(component: ReactElement, props: { [key: string]: any }, text: string, targetDiv: Element) {
    const portalId = props["key"] as string;

    const additionalProps = {
      portalId: portalId,
      "data-unbreakable": "",
      getContext: useEditableContentContext
    }

    setPortals(previousPortals => {
      const priorIndex = previousPortals.findIndex(p => p.key === portalId)
      const componentInitialProps: PortalProps = {};
      if (priorIndex >= 0) {
        previousPortals.splice(priorIndex, 1);
      } else {
        if (initialProps && initialProps[portalId]) {
          for (let [k, v] of Object.entries(initialProps[portalId])) {
            componentInitialProps[k] = v;
          }
        }
      }

      // console.log(text);

      const clone = cloneElement(component, { ...props, ...additionalProps, ...componentInitialProps }, text);
      const portal = createPortal(clone, targetDiv, props["key"] || null);
      return [...previousPortals, portal]
    });
  }


  /**
   * Generate a containing div element with data-button-key indicating 
   * type of React Element it holds, append ReactElement to that div, 
   * create portal and add that portal to portals state
   * @param component 
   */
  function createContentPortal(component: ReactElement, buttonKey: string) {
    const uuid = uuidv4();
    const id = PORTAL_CONTAINER_ID_PREFIX + uuid;
    const newDiv = document.createElement("div");
    newDiv.setAttribute('id', id);
    newDiv.setAttribute('data-button-key', buttonKey);
    newDiv.style.display = "inline";

    const selection = window.getSelection();
    if (!selection) return;
    const range = selection.getRangeAt(0);

    // expanding assignment to allow insertion of other logic if need be
    const text = (function () {
      const rangeToString = range.toString();
      if (rangeToString.length > 0) {
        return rangeToString;
      }
      else {
        return '\u200B\u200B';
      }
    }());
    range?.extractContents();
    range.insertNode(newDiv);

    setDivToSetSelectionTo(newDiv);

    const foundNewDiv = contentRef?.current?.querySelector(`#${id}`)
    if (!foundNewDiv) return;

    // currently only handling range text, not nested elements
    if (contentRef.current && contentRef.current && foundNewDiv) {
      cloneElementIntoPortal(component, { key: uuid, 'data-bk': buttonKey }, text, foundNewDiv);
      return uuid;
    }
  }


  /**
   * Finds an existing div that should house a React portal,
   * then finds the correct button by looking in the editTextButtons
   * prop for the corresponding dataKey, renders the correct component
   * from that button's wrapperInstructions, creates a portal
   * and appends that portal to portals. This is called when RenderedContent
   * or EditableContent first render
   * @param containingDiv 
   */
  function appendPortalToDiv(containingDiv: HTMLDivElement) {

    const key = containingDiv.getAttribute("data-button-key");
    const containingDivId = containingDiv.getAttribute('id');
    if (!containingDivId) return;
    const uuid = containingDivId.split(PORTAL_CONTAINER_ID_PREFIX)[1];

    if (!uuid || uuid.length === 0) return;
    if (!key) return;

    const contentRange = new Range();
    contentRange.setStart(containingDiv, 0);
    contentRange.setEnd(containingDiv, containingDiv.childNodes.length);
    const text = contentRange.toString();
    const content = contentRange.extractContents(); // content currently unused

    // find correct wrapper button
    const foundKeyAndWrapperObj = keyAndWrapperObjs.find(obj => obj.dataKey === key);
    if (!foundKeyAndWrapperObj) return;
    if (!getIsReactComponent(foundKeyAndWrapperObj.wrapper)) return;

    const component = foundKeyAndWrapperObj.wrapper;
    cloneElementIntoPortal(component, { key: uuid, 'data-bk': key }, text, containingDiv);
  }


  /**
   * Remove a portal from the portals object selecting by its key
   * @param key 
   */
  function removePortal(key: string) {
    const portalsCopy = [...portals];
    const targetIndex = portalsCopy.findIndex(p => p.key === key);
    portalsCopy.splice(targetIndex, 1);
    setPortals(portalsCopy);
  }


  return (
    <EditableContentContext.Provider value={{
      contextInstanceIdRef,
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
      // prepareDehydratedHTML,
      updatePortalProps,
      getAllPortalProps,
      keyAndWrapperObjs,
      updateContent,
      createContentPortal,
      appendPortalToDiv,
      removePortal,
      updateSelection,
      dehydratedHTML,
      resetPortalContainers,
      assignContentRef,
      buttonUpdateTrigger,
      triggerButtonUpdate
    }}
    >
      {children}
    </EditableContentContext.Provider>
  )
}


export function useEditableContentContext() {
  const context = useContext(EditableContentContext);

  if (!context) {
    throw new Error("useEditableContentContext must be in EditableContentContextProvider");
  }

  return context;
}