import { Button, ButtonOwnProps } from "@mui/material";
import { isValidElement, JSXElementConstructor, MutableRefObject, ReactElement, ReactNode, ReactPortal, useCallback, useEffect,  useRef,  useState } from "react";
import { WrapperArgs } from "./";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { renderToString } from "react-dom/server";
import { PORTAL_CONTAINER_ID_PREFIX } from "@/utils/constants";
import { getAllTextNodes, getAncestorNode, getButtonStatus, getIsReactComponent, getLastValidCharacterIndex, getLastValidTextNode, getRangeChildNodes, getRangeLowestAncestorElement } from "@/utils/checks";
import { generateQuery, unwrapSelectionFromQuery, createWrapper, wrapInElement, cushionTextNode } from "@/utils/dom_operations";
import { resetRangeToTextNodes, resetSelectionToTextNodes, moveSelection } from "@/utils/selection_movements";


/**
 * Takes a ReactNode and a dataKey and generates a 
 * WrapperArgs object
 * @param rn 
 * @param dataKey 
 * @returns 
 */
function reactNodeToWrapperArgs(rn: ReactNode, dataKey: string): WrapperArgs {

  const element = reactNodeToElement(rn);
  if (!element) return { element: "" };

  let mappedAttributes: { [key: string]: string | undefined } = {
    'data-bk': dataKey
  }

  for (let attr of Array.from(element.attributes)) {
    if ((attr.name) === 'class' || (attr.name) === 'getContext') continue;
    if (attr.name === 'style') {
      // TODO: make style compatible for wrapperArgs search
      continue;
    }
    const attrName = attr.name;
    const attrValue = attr.value || '';

    mappedAttributes[attrName] = attrValue;
  }

  // set all react elements to unbreakable, might change this later
  const wrapperArgs = {
    element: element.tagName,
    classList: element.className ? element.className.split(" ") : [],
    id: element.getAttribute('id') || undefined,
    attributes: mappedAttributes,
    unbreakable: element.hasAttribute("data-unbreakable") || getIsReactComponent(rn as ReactElement)
  };

  return wrapperArgs;
}


/**
 * If the window exists, generates an Element from 
 * a given ReactNode. If the window does not exist,
 * returns null
 * @param reactNode 
 * @returns 
 */
function reactNodeToElement(reactNode: ReactNode) {
  const stringified = renderToString(reactNode);

  const parsedElement = (typeof window !== "undefined") ? 
    new DOMParser().parseFromString(stringified, "text/html").body.children[0] : 
    null;
  return parsedElement;
}


type htmlSelectCallback = (wrapper: HTMLElement) => void
type reactSelectCallback = (wrapper: ReactElement<any, string | JSXElementConstructor<any>>, portalId: string | undefined) => void

// "color", even when not named, causes type conflict from WrapperArgs
type EditTextButtonProps = Omit<ButtonOwnProps, "color">
  & React.ComponentPropsWithoutRef<'button'> & {
    isMUIButton: boolean,
    dataKey: string,
    children?: ReactNode,
    selectedVariant?: ButtonOwnProps["variant"],
    deselectedVariant?: ButtonOwnProps["variant"],
    selectCallback?: htmlSelectCallback | reactSelectCallback,
    deselectCallback?: () => void | undefined,
  };

export default function EditTextButton({
  isMUIButton,
  dataKey,
  children,
  selectedVariant,
  deselectedVariant,
  selectCallback,
  deselectCallback,
  ...remainderProps
}: EditTextButtonProps
) {

  const { 
    contextInstanceId,
    hasSelection, 
    selectionAnchorNode, 
    selectionAnchorOffset, 
    selectionFocusNode, 
    selectionFocusOffset, 
    keyAndWrapperObjs, 
    contentRef, 
    updateContent, 
    createContentPortal, 
    portals, 
    removePortal,
    buttonUpdateTrigger,
    triggerButtonUpdate
  } = useEditableContentContext();


  const [selected, setSelected] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [beingClicked, setBeingClicked] = useState<boolean>(false);

  const thisKeyAndWrapperRef = useRef(keyAndWrapperObjs.find(kw => kw.dataKey === dataKey));
  const wrapperRef = useRef(thisKeyAndWrapperRef?.current?.wrapper);

  const isReactComponentRef = useRef(wrapperRef.current ? getIsReactComponent(wrapperRef?.current) : false);
  
  // get wrapperArgs
  const wrapperArgsRef = useRef(reactNodeToWrapperArgs(wrapperRef.current, dataKey));
  const queryRef = useRef(generateQuery(wrapperArgsRef.current));

  // on selection change
  useEffect(function () {
    const selection = window.getSelection();

    // disable button if div doesn't have selection and button is not actively being clicked
    if (!hasSelection && !beingClicked) {
      setSelected(false);
      setEnabled(false);
    }
    else {
      const status = getButtonStatus(selection, wrapperArgsRef.current.unbreakable, queryRef.current, contentRef.current);
      setSelected(status.selected);
      setEnabled(status.enabled);
    }
  }, [hasSelection, selectionAnchorNode, selectionAnchorOffset, selectionFocusNode, selectionFocusOffset, buttonUpdateTrigger])


  /**
   * Handle moving out of React component (if range is collapsed and at 
   * end) or removal of React component, including removal of portal, 
   * promotion of children to div containing portal, marking that div 
   * for deletion in EditableContent useEffect [portals]
   */
  const unwrapReactComponent = useCallback((selection: Selection, portalsState: ReactPortal[]) => {
    const range = selection.getRangeAt(0);
    if (!selection.anchorNode || !contentRef.current) return;
    const targetDiv = getAncestorNode(selection.anchorNode, "div[data-button-key]", contentRef.current) as Element;

    if (!targetDiv) return;

    const id = targetDiv.getAttribute('id')
    const key = id?.split(PORTAL_CONTAINER_ID_PREFIX)[1];

    if (!key || key.length === 0) return;

    const targetPortal = portalsState.find(p => p.key === key);

    if (!targetPortal) return;

    if (targetPortal.children && range.toString().length === 0) {

      const childrenRange = new Range();

      childrenRange.setStart(targetDiv, 0);
      childrenRange.setEnd(targetDiv, targetDiv.childNodes.length)

      const textNodes = getAllTextNodes([targetDiv]);

      const lastTextNode = getLastValidTextNode(textNodes);
      const lastTextIndex = getLastValidCharacterIndex(lastTextNode);

      // if at end of react component, break element at end
      if (range.startContainer === lastTextNode && range.startOffset >= lastTextIndex) {
        breakElementAtEnd(targetDiv, selection);
        return;
      }
    }

    // else - there is a target portal and range is over 1 or more characters
    const targetComponent = targetPortal.children;
    if (!targetComponent || !isValidElement(targetComponent)) return;

    // target component exists, remove portal, copy children to targetDiv
    const children = targetComponent.props.children;
    const htmlChildren = (typeof children === "string") ?
      document.createTextNode(children) :
      reactNodeToElement(children);
    htmlChildren && targetDiv.appendChild(htmlChildren);

    removePortal(key);

    /**
     * mark targetDiv for cleanup, which will promote children in EditableContent
     * useEffect with portals dependency
     */ 
    targetDiv.setAttribute('data-mark-for-deletion', '');

  }, [removePortal])


  /**
   * Handle moving out of unbreakable element (if range is collapsed
   * and at end) or promotion of children from unbreakable element.
   * Assumes that range's lowest ancestor element is the element to
   * unwrap, requires caution when calling
   */
  const unwrapUnbreakableElement = useCallback((selection: Selection) => {
    if (!contentRef.current) return;
    const range = selection.getRangeAt(0);
    const element = getRangeLowestAncestorElement(range);
    if (element) {

      const elementRange = new Range();
      elementRange.setStart(element, 0);
      elementRange.setEnd(element, element.childNodes.length);
      resetRangeToTextNodes(elementRange);
      const childNodes = getRangeChildNodes(elementRange, contentRef.current);

      const textNodes = childNodes.filter(cn => cn.nodeType === Node.TEXT_NODE) as Array<Text>;

      // handle break off from end of element
      if (range.toString().length === 0) {
        const lastTextNode = getLastValidTextNode(textNodes);
        const lastTextIndex = getLastValidCharacterIndex(lastTextNode);

        if (range.startContainer === lastTextNode && range.startOffset >= lastTextIndex) {
          breakElementAtEnd(element, selection);
          return;
        }
      }

      // else - selection is not at end of element
      const startNodeIndex = childNodes.findIndex(cn => cn === range.startContainer);
      const startNodeOffset = range.startOffset;
      const endNodeIndex = childNodes.findIndex(cn => cn === range.endContainer);
      const endNodeOffset = range.endOffset;

      const parentNode = element.parentNode;

      for (let i = 0; i < childNodes.length; i++) {
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
  }, [updateContent]);


  /**
   * Move selection out of end of targetElement and into next
   * text node if it exists, and if it does not exist, creates
   * it.
   */
  const breakElementAtEnd = useCallback((targetElement: Element, selection: Selection) => {
    if (!contentRef.current) return;

    const childrenRange = new Range();

    childrenRange.setStart(targetElement, 0);
    childrenRange.setEnd(targetElement, targetElement.childNodes.length);

    const textNodes = getAllTextNodes([targetElement]);

    if (targetElement.nextSibling && targetElement.nextSibling.nodeType === Node.TEXT_NODE) {
      moveSelection(selection, contentRef.current, "right");
    }
    else {
      const newEmptyTextNode = new Text('\u200B\u200B');
      if (targetElement.nextSibling) {
        contentRef.current.insertBefore(newEmptyTextNode, targetElement.nextSibling);
      }
      else {
        contentRef.current.append(newEmptyTextNode);
      }
      window.getSelection()?.setBaseAndExtent(newEmptyTextNode, 1, newEmptyTextNode, 1);
    }

    /**
     * get new selection, make sure it starts with zero width space
     * if not, add it, put selection after zero width space)
     */
    if (!(selection?.anchorNode)) return;

    // if selection is still inside of element, - end of text
    if (textNodes.includes(selection.anchorNode as Text)) {
      const newRange = new Range();
      newRange.setStartAfter(targetElement);
      newRange.collapse();
      const newTextNode = document.createTextNode("\u200B\u200B");
      newRange.insertNode(newTextNode);

      // directly set new selection
      window.getSelection()?.setBaseAndExtent(newTextNode, 1, newTextNode, 1);
    }

    // make sure next text node starts with zero width space
    if (selection.anchorNode.textContent != null && (
      selection.anchorNode.textContent.length == 0 ||
      !selection.anchorNode.textContent[0].match("\u200B"))
    ) {
      selection.anchorNode.nodeValue = "\u200B" + selection.anchorNode.textContent;
      selection.setBaseAndExtent(selection.anchorNode, 1, selection.anchorNode, 1);
    }
    return;

  }, []);


  /**
   * Handler for all button clicks for wrapping and unwrapping text
   * with React wrappers, non-React unbreakable wrappers, and standard
   * wrappers
   */
  const handleEditTextButtonClick = useCallback((portalArray: ReactPortal[], isSelected: boolean) => {

    if (!wrapperRef.current) return;

    const selection = window.getSelection();

    if (selection) {
      if (isSelected) {
        // selected - this action should unwrap

        if (isReactComponentRef.current) {
          unwrapReactComponent(selection, portalArray);
        }
        else if (!isReactComponentRef.current) {
          if (wrapperArgsRef.current.unbreakable) {
            const originalRange = selection.getRangeAt(0); // pre unwrap selection for comparison
            unwrapUnbreakableElement(selection);

            // update button status if selection does not change
            const newRange = selection.getRangeAt(0);
            if (originalRange == newRange) {
              triggerButtonUpdate();
            }  
          }
          else if (!wrapperArgsRef.current.unbreakable) {
            const originalRange = selection.getRangeAt(0); // pre unwrap selection for comparison
            unwrapSelectionFromQuery(selection, queryRef.current, contentRef.current!) // typescript not deeply analyzing callback, prior check of contentRef.current is sufficient

            // update button status if selection does not change
            const newRange = selection.getRangeAt(0);
            if (originalRange == newRange) {
              triggerButtonUpdate();
            }  
          } 
          updateContent();
        }

        if (deselectCallback) {
          deselectCallback();
        }
      }
      else if (!selected) {
        // not selected - this action should wrap

        if (isReactComponentRef.current) {
          // if isReactComponent, can assert wrapperInstructions as ReactElement
          const portalId = createContentPortal(wrapperRef.current, dataKey);
          if (selectCallback) {
            (selectCallback as reactSelectCallback)(wrapperRef.current, portalId);
          }
        } 
        else if (!isReactComponentRef.current) {
          const wrapper = createWrapper(wrapperArgsRef.current, document);
          wrapInElement(selection, wrapper, contentRef.current!);
          
          // make sure all text nodes are cushioned, reset range to include ZWSs
          const textNodes = getAllTextNodes([wrapper]);
          textNodes.forEach(tn => cushionTextNode(tn));
          const range = window.getSelection()?.getRangeAt(0);
          range?.setStart(textNodes[0], 0);
          const lastTextNode = textNodes[textNodes.length - 1];
          range?.setEnd(lastTextNode, lastTextNode.length);

          updateContent();
          if (selectCallback) {
            (selectCallback as htmlSelectCallback)(wrapper);
          }
        }
      }
    }
    // if no selection, no click handler
  }, [wrapperRef, wrapperArgsRef, queryRef, contentRef, isReactComponentRef, createContentPortal, updateContent])


  if (!wrapperRef.current) return;

  return (
    isMUIButton ?
      <Button
        disabled={!enabled}
        onMouseDown={() => {
          // prevent !hasSelection from blocking button's ability to click
          setBeingClicked(true);
        }}
        onClick={(e) => {
          handleEditTextButtonClick(portals, selected);
          setBeingClicked(false);
        }}
        variant={selected ?
          (selectedVariant || "contained") :
          (deselectedVariant || "outlined")
        }
        // Only pass valid MUI Button props here
        data-context-id={contextInstanceId}
        {...(remainderProps as React.ComponentProps<typeof Button>)}
      >
        {children}
      </Button> :
      <button
        disabled={!enabled}
        onMouseDown={() => {
          // prevent !hasSelection from blocking button's ability to click
          setBeingClicked(true);
        }}
        onClick={() => { handleEditTextButtonClick(portals, selected) }}
        data-context-id={contextInstanceId}
        {...remainderProps}
      >
        {children}
      </button>
  )
}