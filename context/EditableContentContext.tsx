import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, resetRangeToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes, getAncestorNode, getLastValidCharacterIndex, getLastValidTextNode, getIsReactComponent } from "@/utils/utils";
import { EditableContentProps, EditTextButtonObject, WrapperInstructions, WrapperArgs } from "@/components";
import { useContext, createContext, useRef, useState, SetStateAction, Dispatch, MutableRefObject, ReactPortal, ReactNode, ReactElement, cloneElement, isValidElement, useEffect } from "react";
import { createPortal } from "react-dom";
import { renderToString } from "react-dom/server";
import { v4 as uuidv4 } from 'uuid';
import { PORTAL_CONTAINER_ID_PREFIX } from "@/utils/constants";
import ContentRefCurrentInnerHTMLContainer from "@/components/TestComponents/ContentRefCurrentInnerHTMLContainer";



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
  dehydratedHTML: string
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




  // useEffect(function() {
  //   console.trace();
  // }, [contentRefCurrentInnerHTML])


  // useEffect(function() {
  //   console.log("change of contentRef");
  //   console.log({contentRefCurrentInnerHTML})
  //   if (contentRef?.current) {
  //     contentRef.current.innerHTML = contentRefCurrentInnerHTML;
  //   }
  // }, [contentRef.current])

  


  /**
   * Create DOMParser from current html of contentRef.current, find
   * divs which house portals, remove all contents of those divs except
   * text, pass dehydraded html to callback.
   * @param callback 
   */
  function getDehydratedHTML(callback: (dehydrated: string) => void) {

    const parsedHTMLBody = new DOMParser()
      .parseFromString(contentRefCurrentInnerHTML, "text/html").body;

    const divs = Array.from(parsedHTMLBody.querySelectorAll("div[data-button-key]"));

    for (let div of divs) {
      const divRange = new Range();
      divRange.setStart(div, 0);
      divRange.setEnd(div, div.childNodes.length);
      console.log(divRange.toString())
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


  /**  Functions moved from EditableContent  **/

  function reactNodeToElement(reactNode: ReactNode) {
    const stringified = renderToString(reactNode);
    const parsedElement = new DOMParser().parseFromString(stringified, "text/html").body.children[0];
    return parsedElement;
  }


  function reactNodeToWrapperArgs(rn: ReactNode): WrapperArgs {

    const element = reactNodeToElement(rn);

    let mappedAttributes: {[key: string] : string | undefined} = {}

    for (let attr of Array.from(element.attributes)) {
      if ((attr.name) === 'class') continue;
      if (attr.name === 'style') {
        // TODO: make style compatible for wrapperArgs search
        continue;
      }
      const attrName = attr.name;
      const attrValue = attr.value || '';
      // console.log({attrName, attrValue});
      mappedAttributes[attrName] = attrValue;
    }
    

    // set all react elements to unbreakable, might change this later
    const wrapperArgs = {
      element: element.tagName,
      classList: element.className ? element.className.split(" ") : [],
      id: element.getAttribute('id') || undefined,
      attributes: mappedAttributes,
      // unbreakable: typeof mappedAttributes['data-unbreakable'] === 'string'
      unbreakable: true
      // eventListeners: getEventListeners(element)      
    };

    // console.log(rn?.type?.name, wrapperArgs);

    return wrapperArgs;
  }


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


  function updateContent() {
    console.log("updateContent");
    console.trace();
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

    // props['data-unbreakable'] = true;
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
    const uuid = containingDiv.getAttribute('id')?.split(PORTAL_CONTAINER_ID_PREFIX)[1];

    if (!uuid || uuid.length === 0) return;
    if (!key) return;

    const contentRange = new Range();
    contentRange.setStart(containingDiv, 0);
    contentRange.setEnd(containingDiv, containingDiv.childNodes.length);
    const text = contentRange.toString();
    const content = contentRange.extractContents();

    
    // find correct wrapper button
    const foundKeyAndWrapperObj = keyAndWrapperObjs.find(obj => obj.dataKey === key);
    if (!foundKeyAndWrapperObj) return;
    if (!getIsReactComponent(foundKeyAndWrapperObj.wrapper)) return;
    
    const component = foundKeyAndWrapperObj.wrapper;
    cloneElementIntoPortal(component, {key: uuid}, text, containingDiv);
  }


  function removePortal(key: string) {
    const portalsCopy = [...portals];
    const targetIndex = portalsCopy.findIndex(p => p.key === key);
    portalsCopy.splice(targetIndex, 1);
    setPortals(portalsCopy);
  }

  /**  End of functions moved from EditableContent  **/


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
      dehydratedHTML
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