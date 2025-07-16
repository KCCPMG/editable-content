import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, resetRangeToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes, getAncestorNode, getLastValidCharacterIndex, getLastValidTextNode, getIsReactComponent } from "@/utils/utils";
import { EditableContentProps, EditTextButtonObject, WrapperInstructions, WrapperArgs } from "@/components";
import { useContext, createContext, useRef, useState, SetStateAction, Dispatch, MutableRefObject, ReactPortal, ReactNode, ReactElement, cloneElement, isValidElement, useEffect } from "react";
import { createPortal } from "react-dom";
import { renderToString } from "react-dom/server";
import { v4 as uuidv4 } from 'uuid';
import { PORTAL_CONTAINER_ID_PREFIX } from "@/utils/constants";
import ContentRefCurrentInnerHTMLContainer from "@/components/TestComponents/ContentRefCurrentInnerHTMLContainer";



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
    setSelection?: typeof setSelection;
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
    getDehydratedHTML?: any;
    updatePortalProps?: any;
    getAllPortalProps?: any;
    keyAndWrapperObjs?: any;
    updateContent?: any;
    createContentPortal?: any;
    appendPortalToDiv?: any;
    removePortal?: any;
    updateSelection?: any;
    dehydratedHTML?: any;
  }
}

type PortalProps = {
  [key: string]: {[key: string]: any}
}


type KeyAndWrapperObj = {
  dataKey: string,
  wrapper: React.ReactElement,
}


type EditableContentContextProviderProps = {
  children: ReactNode,
  keyAndWrapperObjs: Array<KeyAndWrapperObj>,
  initialHTML?: string
}


// this is a replacement for EditableContent's state in all cases
export type EditableContentContextType = {
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
  getDehydratedHTML: (callback: (dehydrated: string) => void) => void,
  updatePortalProps: (updateObj: PortalProps) => void,
  getAllPortalProps: () => PortalProps,
  keyAndWrapperObjs: Array<KeyAndWrapperObj>,
  updateContent: () => void, 
  createContentPortal: (component: ReactElement, buttonKey: string) => void, 
  appendPortalToDiv: (containingDiv: HTMLDivElement) => void,
  removePortal: (key: string) => void,
  updateSelection: () => void,
  dehydratedHTML: string,
  resetPortalContainers: () => void,
  assignContentRef: (newRef: HTMLDivElement) => void,
}

const EditableContentContext = createContext<EditableContentContextType | null>(null);




export function EditableContentContextProvider({children, keyAndWrapperObjs, initialHTML}: EditableContentContextProviderProps) {

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



  useEffect(function() {
    window.contentRef = contentRef,
    window.contentRefCurrentInnerHTML = contentRefCurrentInnerHTML, 
    window.setContentRefCurrentInnerHTML = setContentRefCurrentInnerHTML,
    window.selectionToString = selectionToString, 
    window.setSelectionToString = setSelectionToString,
    window.selectionAnchorNode = selectionAnchorNode, 
    window.setSelectionAnchorNode = setSelectionAnchorNode,
    window.selectionAnchorOffset = selectionAnchorOffset, 
    window.setSelectionAnchorOffset = setSelectionAnchorOffset,
    window.selectionFocusNode = selectionFocusNode, 
    window.setSelectionFocusNode = setSelectionFocusNode,
    window.selectionFocusOffset = selectionFocusOffset, 
    window.setSelectionFocusOffset = setSelectionFocusOffset,
    window.hasSelection = hasSelection, 
    window.setHasSelection = setHasSelection,
    window.portals = portals, 
    window.setPortals = setPortals,
    window.divToSetSelectionTo = divToSetSelectionTo, 
    window.setDivToSetSelectionTo = setDivToSetSelectionTo,
    window.getDehydratedHTML = getDehydratedHTML,
    window.updatePortalProps = updatePortalProps,
    window.getAllPortalProps = getAllPortalProps,
    window.keyAndWrapperObjs = keyAndWrapperObjs,
    window.updateContent = updateContent,
    window.createContentPortal = createContentPortal,
    window.appendPortalToDiv = appendPortalToDiv,
    window.removePortal = removePortal,
    window.updateSelection = updateSelection,
    window.dehydratedHTML = dehydratedHTML
  }, [])

  /**
   * Used in place of ref={contentRef} to avoid race condition
   * in resetting ref on component render
   * @param newRef 
   */
  function assignContentRef(newRef: HTMLDivElement) {
    contentRef.current = newRef;
  }

  
  useEffect(function() {
    getDehydratedHTML(setDehydratedHTML);
  }, [contentRefCurrentInnerHTML])

  /**
   * Create DOMParser from current html of contentRef.current, find
   * divs which house portals, remove all contents of those divs except
   * text, pass dehydraded html to callback.
   * @param callback 
   */
  function getDehydratedHTML(callback: (dehydrated: string) => void) {

    const parsedHTMLBody = (typeof window !== "undefined") ? new DOMParser()
      .parseFromString(contentRefCurrentInnerHTML, "text/html").body : null;

    if (!parsedHTMLBody) return;

    const divs = Array.from(parsedHTMLBody.querySelectorAll("div[data-button-key]"));

    for (let div of divs) {
      const divRange = new Range();
      divRange.setStart(div, 0);
      divRange.setEnd(div, div.childNodes.length);
      const textNodes = getRangeChildNodes(divRange, parsedHTMLBody)
        .filter(cn => cn.nodeType === Node.TEXT_NODE);
      
      divRange.extractContents();
      textNodes.forEach(tn => {
        console.log(tn);
        divRange.insertNode(tn)
      });
    }

    return callback(parsedHTMLBody.innerHTML);
  }


  /** 
   * Go through the keys of the update object, find the corresponding portal 
   * in portals, clone portal with new props, filter out original portals and
   * set setPortals with clones
   * @param updateObj
   */
  function updatePortalProps(updateObj: PortalProps) {

    const portalClones: Array<ReactPortal> = [];
    const portalIds = Object.keys(updateObj);

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

      return ([
        ...previousPortals.filter(portal => portal.key===null ||!portalIds.includes(portal.key)),
        ...(portalClones as Array<ReactPortal>)
      ])
    })
  }

  function resetPortalContainers() {
    return setPortals(previousPortals => {

      const portalClones: Array<ReactPortal> = [];

      previousPortals.forEach(function(portal) {
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
   * @returns PortalProls
   */
  function getAllPortalProps(): PortalProps {
    return Object.assign({}, ...portals.map(portal => {
      const targetComponent = portal.children;
      if (!isValidElement(targetComponent)) return null;
      const key = portal.key;
      if (!key) return null;
      return {[key]: targetComponent.props}
    }));
  }


  /**
   * Update state related to selection to reflect the 
   * current window.getSelection()
   */
  function updateSelection() {
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
    if (hasSelection) resetSelectionToTextNodes();
    setContentRefCurrentInnerHTML(contentRef?.current?.innerHTML || "");
    contentRef.current?.focus();
  }


  /**
   * Clone react component with child text, 
   * create portal, add portal to portals
   * @param component 
   * @param props 
   * @param text 
   * @param targetDiv 
   */
  function cloneElementIntoPortal(component: ReactElement, props: {[key: string] : any}, text: string, targetDiv: Element) {
    const portalId = props["key"] as string;

    const additionalProps ={
      portalId: portalId,
      "data-unbreakable": "",
      getContext: useEditableContentContext
    }

    const clone = cloneElement(component, {...props, ...additionalProps}, text);
    const portal = createPortal(clone, targetDiv, props["key"] || null);
    setPortals(previousPortals => {
      const priorIndex = previousPortals.findIndex( p => p.key === portalId )
      if (priorIndex >= 0) {
        previousPortals.splice(priorIndex, 1);
      }
      return [...previousPortals, portal]
    });
  }


  /**
   * Generate a containing div element, append ReactElement to that div, 
   * create portal and add that portal to portals state
   * @param component 
   */
  function createContentPortal(component: ReactElement, buttonKey: string) {
    const uuid = uuidv4();
    const id = PORTAL_CONTAINER_ID_PREFIX+uuid;
    const newDiv = document.createElement("div");
    newDiv.setAttribute('id', id);
    newDiv.setAttribute('data-button-key', buttonKey);
    newDiv.style.display = "inline";

    const selection = window.getSelection();
    if (!selection) return;
    const range = selection.getRangeAt(0);
    const text = range.toString() || '\u200B';
    const contents = range?.extractContents();
    range.insertNode(newDiv);

    setDivToSetSelectionTo(newDiv);
    
    const foundNewDiv = contentRef?.current?.querySelector(`#${id}`)
    if (!foundNewDiv) return;
    
    // curently only handling range text, not nested elements
    if (contentRef.current && contentRef.current && foundNewDiv) {
      cloneElementIntoPortal(component, {key: uuid}, text, foundNewDiv)
    }
  }


  /**
   * Finds an existing div that should house a React portal,
   * then finds the correct button by looking in the editTextButtons
   * prop for the corresponding dataKey, renders the correct component
   * from that button's wrapperInstructions, creates a portal
   * and appends that portal to portals
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
    cloneElementIntoPortal(component, {key: uuid}, text, containingDiv);
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
      getDehydratedHTML,
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
      assignContentRef
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