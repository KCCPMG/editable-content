import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, resetRangeToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes, getAncestorNode, getLastValidCharacterIndex, getLastValidTextNode, getIsReactComponent } from "@/utils/utils";
import { EditableContentProps, EditTextButtonObject, WrapperInstructions, WrapperArgs } from "@/components";
import { useContext, createContext, useRef, useState, SetStateAction, Dispatch, MutableRefObject, ReactPortal, ReactNode, ReactElement, cloneElement, isValidElement } from "react";
import { createPortal } from "react-dom";
import { renderToString } from "react-dom/server";
import { v4 as uuidv4 } from 'uuid';
import { PORTAL_CONTAINER_ID_PREFIX } from "@/utils/constants";



type PortalProps = {
  [key: string]: {[key: string]: any}
}


type KeyAndWrapperObj = {
  dataKey: string,
  wrapper: React.ReactElement,
}


type EditableContentContextProviderProps = {
  children: ReactNode,
  keyAndWrapperObjs: Array<KeyAndWrapperObj>
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
  getDehydratedHTML: (callback: (dehydratedHTML: string) => void) => void,
  updatePortalProps: (updateObj: PortalProps) => void,
  getAllPortalProps: () => PortalProps,
  keyAndWrapperObjs: Array<KeyAndWrapperObj>,
  updateContent: () => void, 
  createContentPortal: (component: ReactElement, buttonKey: string) => void, 
  appendPortalToDiv: (containingDiv: HTMLDivElement) => void,
  removePortal: (key: string) => void,
  updateSelection: () => void,
}

const EditableContentContext = createContext<EditableContentContextType | null>(null);




export function EditableContentContextProvider({children, keyAndWrapperObjs}: EditableContentContextProviderProps) {

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


  


  /**
   * Create DOMParser from current html of contentRef.current, find
   * divs which house portals, remove all contents of those divs except
   * text, pass dehydraded html to callback.
   * @param callback 
   */
  function getDehydratedHTML(callback: (dehydratedHTML: string) => void) {

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

    callback(parsedHTMLBody.innerHTML);
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


  // function reactWrapperToEditTextButton(etb: EditTextButtonObject) {
  //   // confirm and coerce this is ReactWrapper type of EditTextButtonObject
  //   if (!etb.isReactComponent) return;

  //   const {isStateful, component, dataKey, selectCallback, deselectCallback, isReactComponent, ...otherProps} = etb;

  //   const wrapperArgs = reactNodeToWrapperArgs(component);

  //   const query = generateQuery(wrapperArgs);
  //   const selection = window.getSelection();
    
  //   if (hasSelection && selection) {
  //     const {anchorNode, focusNode, anchorOffset, focusOffset} = selection;

  //     if (
  //       anchorNode == contentRef.current && 
  //       focusNode == contentRef.current &&
  //       anchorOffset == 0 && 
  //       focusOffset == 0
  //     ) {
  //       const thisRange = selection.getRangeAt(0);
  //       thisRange.insertNode(document.createTextNode(""));   
  //       selection.removeAllRanges();
  //       selection.addRange(thisRange);
  //     }
  //   }

  //   const status = getButtonStatus(selection, wrapperArgs.unbreakable, query, contentRef.current);

  //   if (!hasSelection) {
  //     status.enabled = false;
  //     status.selected = false;
  //   }
  //   const {selected, enabled} = status;

  //   return ( 
  //     <EditTextButton
  //       {...otherProps}
  //       // wrapperArgs={wrapperArgs}
  //       dataKey={dataKey}
  //       key={dataKey}
  //       disabled={!enabled}
  //       onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {e.preventDefault();}}
  //       // selected={selected}
  //       onClick={() => handleEditTextButtonClick(selection, wrapperArgs, !!isReactComponent, selected, query, selectCallback, deselectCallback, component, dataKey, !!isStateful)}
  //     />
  //   )
  // }


  // function HTMLWrapperInstructionsToEditTextButton(etb: EditTextButtonObject) {
  //   // confirm and coerce this is HTMLWrapperInstructions type of EditTextButtonObject
  //   if (etb.isReactComponent) return;

  //   // destructure to extract props
  //   const {dataKey, selectCallback, deselectCallback, isReactComponent, wrapperArgs, ...otherProps} = etb;

  //   const query = generateQuery(wrapperArgs);
  //   const selection = window.getSelection();

  //   if (hasSelection && selection) {
  //     const {anchorNode, focusNode, anchorOffset, focusOffset} = selection;

  //     if (
  //       anchorNode == contentRef.current && 
  //       focusNode == contentRef.current &&
  //       anchorOffset == 0 && 
  //       focusOffset == 0
  //     ) {
  //       const thisRange = selection.getRangeAt(0);
  //       thisRange.insertNode(document.createTextNode(""));   
  //       selection.removeAllRanges();
  //       selection.addRange(thisRange);
  //     }
  //   }

  //   const status = getButtonStatus(selection, wrapperArgs.unbreakable, query, contentRef.current)
            
  //   if (!hasSelection) {
  //     status.enabled = false;
  //     status.selected = false;
  //   }
  //   const {selected, enabled} = status;

  //   return ( 
  //     <EditTextButton
  //       {...otherProps}
  //       // wrapperArgs={wrapperArgs}
  //       dataKey={dataKey}
  //       key={dataKey}
  //       disabled={!enabled}
  //       onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {e.preventDefault();}}
  //       // selected={selected}
  //       onClick={() => handleEditTextButtonClick(selection, wrapperArgs, !!isReactComponent, selected, query, selectCallback, deselectCallback, undefined, dataKey, false)}
  //     />
  //   )

  // }


  // function editTextButtonObjectToEditTextButton(etb: EditTextButtonObject) {
  //   if (etb.isReactComponent) return reactWrapperToEditTextButton(etb);
  //   else return HTMLWrapperInstructionsToEditTextButton(etb);
  // }



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


  function breakElementAtEnd(targetElement: Element, selection: Selection) {
    if (!contentRef.current) return;

    const childrenRange = new Range();

    childrenRange.setStart(targetElement, 0);
    childrenRange.setEnd(targetElement, targetElement.childNodes.length)

    resetRangeToTextNodes(childrenRange);
    const childNodes = getRangeChildNodes(childrenRange, contentRef.current);
    const textNodes = childNodes.filter(cn => cn.nodeType === Node.TEXT_NODE) as Array<Text>;
    const range = selection.getRangeAt(0);

    moveSelection(selection, contentRef?.current, "right");
    
    // get new selection, make sure it starts with zero width space
    // if not, add it, put selection after zero width space)
    // if (!selection?.anchorNode?.textContent) return;
    if (!(selection?.anchorNode)) return;

    // if selection is still inside of element, - end of text
    if (textNodes.includes(selection.anchorNode as Text)) {
      console.log("sanity check 1");
      const newRange = new Range();
      newRange.setStartAfter(targetElement);
      newRange.collapse();
      console.log("sanity check 2");
      const newTextNode = document.createTextNode("\u200B\u200B");
      newRange.insertNode(newTextNode);
      console.log(newRange);
      console.log("sanity check 3");

      window.getSelection()?.setBaseAndExtent(newTextNode, 1, newTextNode, 1);
      console.log(window.getSelection()?.getRangeAt(0));
      console.log()
      // moveSelection(selection, contentRef?.current, "right");
      console.log("sanity check 4");
    }
    // make sure next text node starts with zero width space
    if (selection.anchorNode.textContent != null && (
      selection.anchorNode.textContent.length == 0 ||
      !selection.anchorNode.textContent[0].match("\u200B"))
    ) {
      console.log("in the text node space catcher");
      selection.anchorNode.nodeValue = "\u200B" + selection.anchorNode.textContent;
      selection.setBaseAndExtent(selection.anchorNode, 1, selection.anchorNode, 1);
    }
    return;
    
  }


  function unwrapUnbreakableElement(selection: Selection) {
    if (!contentRef.current) return;
    const range = selection.getRangeAt(0);
    const element = getRangeLowestAncestorElement(range);
    if (element) {
      
      const elementRange = new Range();
      elementRange.setStart(element, 0);
      elementRange.setEnd(element, element.childNodes.length);
      resetRangeToTextNodes(elementRange);
      const childNodes = getRangeChildNodes(elementRange, contentRef.current);

      // const childNodes = Array.from(element.childNodes);

      const textNodes = childNodes.filter(cn => cn.nodeType === Node.TEXT_NODE) as Array<Text>;

      // handle break off from end of element
      if (range.toString().length === 0) {
        const lastTextNode = getLastValidTextNode(textNodes);
        const lastTextIndex = getLastValidCharacterIndex(lastTextNode);
    
        if (range.startContainer === lastTextNode && range.startOffset > lastTextIndex) {
          breakElementAtEnd(element, selection);
          return;
        }
      }
      
      // else to either condition above
      const startNodeIndex = childNodes.findIndex(cn => cn === range.startContainer);
      const startNodeOffset = range.startOffset;
      const endNodeIndex = childNodes.findIndex(cn => cn === range.endContainer);
      const endNodeOffset = range.endOffset;
      
      const parentNode = element.parentNode;
      
      for (let i=0; i<childNodes.length; i++) {
        parentNode?.insertBefore(childNodes[i], element);
        
        if (i === startNodeIndex) {
          range.setStart(childNodes[i], startNodeOffset);
        }
        
        if (i === endNodeIndex) {
          range.setEnd(childNodes[i], endNodeOffset);
        }
      }
      
      parentNode?.removeChild(element);
      
      updateContent();
      resetSelectionToTextNodes();
      return;
    }
  }


  function unwrapReactComponent(selection: Selection) {
    const range = selection.getRangeAt(0);
    if (!selection.anchorNode || !contentRef.current) return;
    const targetDiv = getAncestorNode(selection.anchorNode, "div[data-button-key]", contentRef.current) as Element;

    if (!targetDiv) return;

    const key = targetDiv.getAttribute('id')?.split(PORTAL_CONTAINER_ID_PREFIX)[1];

    if (!key || key.length === 0) return;

    const targetPortal = portals.find(p => p.key === key);

    if (!targetPortal) return;

    // const childNodes = Array.from(targetPortal.childNodes);

    if (targetPortal.children && range.toString().length === 0) {

      const childrenRange = new Range();

      childrenRange.setStart(targetDiv, 0);
      childrenRange.setEnd(targetDiv, targetDiv.childNodes.length)

      resetRangeToTextNodes(childrenRange);
      const childNodes = getRangeChildNodes(childrenRange, contentRef.current);
      const textNodes = childNodes.filter(cn => cn.nodeType === Node.TEXT_NODE) as Array<Text>;
    
      const lastTextNode = getLastValidTextNode(textNodes);
      const lastTextIndex = getLastValidCharacterIndex(lastTextNode);
      
      // if at end of react component
      if (range.startContainer === lastTextNode && range.startOffset > lastTextIndex) {
        breakElementAtEnd(targetDiv, selection);
        return;
      }
      
    }


    // else to either condition above
    const targetComponent = targetPortal.children;
    if (!targetComponent || !isValidElement(targetComponent)) return;
    
    const children = targetComponent.props.children;
    const htmlChildren = (typeof children === "string") ? 
      document.createTextNode(children) :
      reactNodeToElement(children);
    targetDiv.appendChild(htmlChildren);

    removePortal(key);

    // need to remove containing div / unwrap text normally
    targetDiv.setAttribute('data-mark-for-deletion', '');

    // promoteChildrenOfNode(targetDiv);

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
      updateSelection
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