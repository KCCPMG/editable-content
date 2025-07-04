"use client"
import React, { useRef, useState, useEffect, isValidElement, ReactElement, useCallback } from "react";
import { wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, resetRangeToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes, getAncestorNode } from '@/utils/utils';
import { EditableContentProps, WrapperInstructions } from "./ContentEditableExperimentComponents";
import EditTextButton from "./ContentEditableExperimentComponents/EditTextButton";
import ControlTextButton from "./ContentEditableExperimentComponents/ControlTextButton";
import { Button } from "@mui/material";
import { renderToString } from "react-dom/server";
import { WrapperArgs } from "./ContentEditableExperimentComponents";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from 'uuid';
import { useEditableContentContext } from "@/context/EditableContentContext";

const PORTAL_CONTAINER_ID_PREFIX = "portal-container-";
const reportState = new CustomEvent("reportState");


/**
 * create custom event
 * fire event on all *portals*
 * pass function to report state
 * if I put the event listener on the portal,
 * I would have to do so dynamically, in its useEffect
 * I would also have to put the event emitter on the portal
 * Alternatively, if there is some way I could access
 * the state directly from the portals?
 * If components take a prop, reportState: () => void
 */


function getLastValidTextNode(textNodeArr: Array<Text>) {
  for (let i=textNodeArr.length-1; i--; i>=0) {
    return textNodeArr[i];
  } 
  return textNodeArr[0];
}

function getLastValidCharacterIndex(textNode: Text) {
  if (!textNode.textContent) return 0;
  for (let i=textNode.length-1; i--; i>=0) {
    if (textNode.textContent[i].match("[^\u200B]")) return i+1;
  }
  return 0;
}

export default function EditableContent({divStyle, buttonRowStyle, initialHTML, editTextButtons}: EditableContentProps) {

  // const contentRef = useRef<null | HTMLDivElement>(null);
  // const [contentRefCurrentInnerHTML, setContentRefCurrentInnerHTML] = useState<string>("");
  // const [selectionToString, setSelectionToString] = useState<string>("");
  // const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  // const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<Number | null>(null);
  // const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  // const [selectionFocusOffset, setSelectionFocusOffset] = useState<Number | null>(null);
  // const [hasSelection, setHasSelection] = useState<boolean>(false);
  // const [portals, setPortals] = useState<Array<React.ReactPortal>>([]);
  // const [portalsState, setPortalsState] = useState<{[key: string]: any}>({});
  // const [mustReportState, setMustReportState] = useState<{[key: string]: any}>({});
  // const [divToSetSelectionTo, setDivToSetSelectionTo] = useState<HTMLElement | null>(null)

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
    portalsState, 
    setPortalsState,
    mustReportState, 
    setMustReportState,
    divToSetSelectionTo, 
    setDivToSetSelectionTo
  } = useEditableContentContext();

  // make sure all react elements are unbreakable
  editTextButtons = editTextButtons.map(etb => {
    if (!etb.isReactComponent) return etb;

    else {
      const { wrapperInstructions } = etb;
      const newProps = {...wrapperInstructions.props};
      newProps['test-prop'] = 'test';
      newProps['data-unbreakable'] = '';
      const newWrapperInstructions = React.cloneElement(wrapperInstructions, newProps);
      return({
        ...etb,
        wrapperInstructions: newWrapperInstructions
      })
    }
  })

  // on render
  useEffect(() => {
    // populate div with html and update state
    if (contentRef.current) {
      if (initialHTML) {
        contentRef.current.innerHTML = initialHTML;
        // load react portals
        const reactContainerDivs = Array.from(contentRef.current.querySelectorAll("div [data-button-key]"));
        reactContainerDivs.forEach(rcd => appendPortalToDiv(rcd as HTMLDivElement));
      } else {
        contentRef.current.innerHTML = "";
      }   
      setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
    }
    
    // assign event listeners
    document.addEventListener('selectionchange', (e) => {
      const selection = window.getSelection();
      if (!selection || 
        !contentRef.current ||
        !selectionIsDescendentOfNode(selection, contentRef.current)
      ) {
        console.log("selection not in div")
        updateSelection();
      }
      else {
        handleSelectionChange();
      } 
    })

    // teardown
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    }

  }, [])

  // on portal change
  useEffect(() => {
    updateContent();
    
    // clean up divs which no longer contain a portal
    if (!contentRef.current) return;
    const toDelete = Array.from(contentRef.current?.querySelectorAll("[data-mark-for-deletion]"));

    toDelete.forEach(td => promoteChildrenOfNode(td));
    resetSelectionToTextNodes();


    // TODO: Delete these once done testing
    (window as any).portals = portals;
    (window as any).setPortals = setPortals;
  }, [portals])

  /**
   * if changes need to be made to selection, make those changes, 
   * otherwise update selection pieces of state
   */
  function handleSelectionChange() {
    const selection = window.getSelection();
    if (selection && 
      contentRef.current && 
      selection?.anchorNode?.nodeType !== Node.TEXT_NODE &&
      selection?.focusNode?.nodeType !== Node.TEXT_NODE
    ) {
      console.log("selectionHasTextNodes", selectionHasTextNodes(selection, contentRef.current));
      if (selectionHasTextNodes(selection, contentRef.current)) {
        resetSelectionToTextNodes();
      } else {
        const textNode = document.createTextNode('\u200B\u200B');
        // contentRef.current.append(textNode);
        const range = selection.getRangeAt(0);
        range.insertNode(textNode)
        range.setStart(textNode, 1);
        range.setEnd(textNode, 1);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
    else {
      updateSelection();
    } 
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
    if (hasSelection) resetSelectionToTextNodes();
    setContentRefCurrentInnerHTML(contentRef?.current?.innerHTML || "");
    contentRef.current?.focus();
  }

  function reactNodeToElement(reactNode: ReactNode) {
    const stringified = renderToString(reactNode);
    // console.log({stringified})
    const parsedElement = new DOMParser().parseFromString(stringified, "text/html").body.children[0];
    // console.log({parsedElement})
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

  function setIndividualPortalState (id: string, obj: {[key: string]: any}) {
    setPortalsState(previousPortalsState => {
      const newPortalsState = {...previousPortalsState};
      newPortalsState[id] = obj;
      return {...newPortalsState};
    });
  };

  function setIndividualMustReportState(id: string, mustReport: boolean) {
    setMustReportState( previousMustReportState => {
      const newMustReportState = {...previousMustReportState};
      newMustReportState[id] = mustReport;
      return {...newMustReportState};
    })
  }

  /**
   * Clone react component with child text, 
   * create portal, add portal to portals
   * @param component 
   * @param props 
   * @param text 
   * @param targetDiv 
   */
  function cloneElementIntoPortal(component: ReactElement, props: {[key: string] : any}, text: string, targetDiv: Element, isStateful: boolean) {
    const id = props["key"] as string;

    if (isStateful) {
      
      // initialize relevant state in EditableContent
      setIndividualPortalState(id, {});
      setIndividualMustReportState(id, false);
  
      // define function to pass to stateful component
      props.reportState = function(stateObj: {[key: string]: any}) {
        setIndividualPortalState(id, stateObj);
      }
      props.mustReportState = mustReportState[id] || false;
      
    }
    // props['data-unbreakable'] = true;
    const clone = React.cloneElement(component, props, text);
    const portal = createPortal(clone, targetDiv, props["key"] || null);
    setPortals(previousPortals => {
      const priorIndex = previousPortals.findIndex( p => p.key === id )
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
  function createContentPortal(component: ReactElement, buttonKey: string, isStateful: boolean) {
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
      cloneElementIntoPortal(component, {key: uuid}, text, foundNewDiv, !!isStateful)
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
    const foundButton = editTextButtons.find(etb => etb.dataKey === key);
    if (!foundButton) return;
    
    const component = foundButton.wrapperInstructions as ReactElement;
    console.log(foundButton.wrapperInstructions);
    cloneElementIntoPortal(component, {key: uuid}, text, containingDiv, !!foundButton.isStateful);
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

  function handleEditTextButtonClick(
    selection: Selection | null, 
    wrapperArgs: WrapperArgs, 
    isReactComponent: boolean, 
    selected: boolean, 
    query: string, 
    selectCallback: (wrapper: HTMLElement) => void, 
    deselectCallback: () => void, 
    wrapperInstructions: WrapperInstructions, 
    dataKey: string,
    isStateful: boolean
  ) {
    if (selection) {         
      if (selected) {
        if (isReactComponent) {
          unwrapReactComponent(selection);
        } 
        else if (!isReactComponent) {
          if (wrapperArgs.unbreakable) {
            unwrapUnbreakableElement(selection);  
          }
          else if (!wrapperArgs.unbreakable) {
            unwrapSelectionFromQuery(selection, query, contentRef.current!) // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient
            updateContent();
          } 
          else {
            console.log("uncaught secnario in selected and not react component");
          }
        }
        else {
          console.log("uncaught scenario in handling click on text selected by button")
        }
        
        if (deselectCallback) {
          deselectCallback();
        } 
      } 
      else if (!selected) {
        if (isReactComponent) {
          // if isReactComponent, can assert wrapperInstructions as ReactElement
          createContentPortal(wrapperInstructions as ReactElement, dataKey, isStateful);
          // createContentPortal(wrapperArgs, dataKey, isStateful);
        
        } else if (!isReactComponent) {
          const wrapper = createWrapper(wrapperArgs, document);
          wrapInElement(selection, wrapper, contentRef.current!);
          updateContent();
          if (selectCallback) {
            selectCallback(wrapper);
          } 
        }
        
      }                  
    }
    // if no selection, no click handler
    
  }


  // once react component has rendered, set selection to text within
  if (divToSetSelectionTo) {
    if (divToSetSelectionTo.childNodes.length > 0) {
      window.getSelection()?.setBaseAndExtent(divToSetSelectionTo, 0, divToSetSelectionTo, divToSetSelectionTo.childNodes.length);
      resetSelectionToTextNodes();
      setDivToSetSelectionTo(null);
    }
  }


  return (
    <>
      <h1>Texteditable Experiment</h1>
      <div style={buttonRowStyle}>
        {
          editTextButtons.map(etb => {

            const {dataKey, selectCallback, deselectCallback, wrapperInstructions, isReactComponent, isStateful, ...otherProps} = etb;

            // if React Element, derive wrapper args from Element, else use what's given
            const wrapperArgs = isReactComponent ?
              reactNodeToWrapperArgs(wrapperInstructions) : // placeholder
              wrapperInstructions;

            const query = generateQuery(wrapperArgs);
            const selection = window.getSelection();

            if (hasSelection && selection) {
              const {anchorNode, focusNode, anchorOffset, focusOffset} = selection;
  
              if (
                anchorNode == contentRef.current && 
                focusNode == contentRef.current &&
                anchorOffset == 0 && 
                focusOffset == 0
              ) {
                const thisRange = selection.getRangeAt(0);
                thisRange.insertNode(document.createTextNode(""));   
                selection.removeAllRanges();
                selection.addRange(thisRange);
              }
            }
    
            const status = getButtonStatus(selection, wrapperArgs.unbreakable, query, contentRef.current)

            if (!hasSelection) {
              status.enabled = false;
              status.selected = false;
            }
            const {selected, enabled} = status;

            return ( 
              <EditTextButton
                {...otherProps}
                wrapperArgs
                key={dataKey}
                disabled={!enabled}
                onMouseDown={(e: Event) => {e.preventDefault();}}
                selected={selected}
                onClick={() => handleEditTextButtonClick(selection, wrapperArgs, isReactComponent, selected, query, selectCallback, deselectCallback, wrapperInstructions, dataKey, isStateful)}
              />
            )
          })
        }
      </div>
      <div
        contentEditable
        spellCheck={false}
        onInput={updateContent}
        onFocus={() => { setHasSelection(true) }}
        onBlur={() => { setHasSelection(false) }}
        onKeyDown={(e) => {
          const selection = window.getSelection(); 
          if (!selection || selection.rangeCount === 0 || !contentRef.current) return;
          const range = selection.getRangeAt(0);

          if (e.code === "Enter") {
            e.preventDefault();
            range.extractContents();
            
            const br = document.createElement("br");
            const textNode = document.createTextNode('\u200B');
            range.insertNode(textNode);
            range.insertNode(br);
            
            range.setStart(textNode, 0);
            range.setEnd(textNode, textNode.length);
            
            selection.removeAllRanges();
            selection.addRange(range);  
            updateContent(); 
          }

          if (e.code === "Space") { 
            e.preventDefault();
            const spaceNode = document.createTextNode("\u0020\u200B");
            range.extractContents();
            range.insertNode(spaceNode);
            range.setStart(spaceNode, 2);
            range.collapse();
            selection.removeAllRanges();
            selection.addRange(range);
            updateContent();
          }

          if (e.code === "ArrowLeft") {
            if (
              !e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              e.preventDefault();
              moveSelection(selection, contentRef.current, "left");
            }
          }

          if (e.code === "ArrowRight") {
            if (
              !e.shiftKey &&
              !e.altKey &&
              !e.ctrlKey &&
              !e.metaKey
            ) {
              e.preventDefault();
              moveSelection(selection, contentRef.current, "right");
            }
          }    
        }}
        ref={contentRef}
        style={divStyle ? divStyle : {
          width: "100%",
          height: "150px",
          margin: "auto",
          border: "2px solid black",
          overflowY: "scroll"
        }}
      >
      </div>
      <div>
        {contentRef.current && 
          <ControlTextButton 
            refDiv={contentRef.current}
            callback={function(div) {
              div.innerHTML = "";
            }}
          />
        }
      </div>
      <div>
        <p>
          <span>Selection: </span>
          {selectionToString}
        </p>
      </div>
      <div>
        <p>
          <span>ContentRef.current Inner HTML: </span>
          {contentRefCurrentInnerHTML}
        </p>
      </div>
      {portals.map(portal => portal)};
    </>
  )
}
