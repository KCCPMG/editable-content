import { Button, ButtonOwnProps } from "@mui/material";
import { isValidElement, MutableRefObject, ReactElement, ReactNode, useEffect, useState } from "react";
import { WrapperArgs } from "./";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { renderToString } from "react-dom/server";
import { generateQuery, getButtonStatus, unwrapSelectionFromQuery, createWrapper, wrapInElement, getAncestorNode, resetSelectionToTextNodes, resetRangeToTextNodes, getRangeChildNodes, getLastValidTextNode, getLastValidCharacterIndex, getRangeLowestAncestorElement, moveSelection, getIsReactComponent} from "@/utils/utils";
import { PORTAL_CONTAINER_ID_PREFIX } from "@/utils/constants";

// "color", even when not named, causes type conflict from WrapperArgs
type EditTextButtonProps = Omit<ButtonOwnProps, "color"> 
  & React.ComponentPropsWithoutRef<'button'> & {
  isMUIButton: boolean,
  dataKey: string,
  children?: ReactNode,
  // child: React.ReactNode,
  // contentRef: React.MutableRefObject<HTMLDivElement | null> | undefined,
  // selected: Boolean,
  // onClick: () => void,
  selectedVariant?: ButtonOwnProps["variant"],
  deselectedVariant?: ButtonOwnProps["variant"],
  selectCallback?: ((wrapper: HTMLElement) => void) | undefined,
  deselectCallback?: () => void | undefined,
  // wrapperArgs: WrapperArgs
};

export default function EditTextButton({
  isMUIButton, 
  dataKey, 
  children,
  // child, 
  // contentRef, 
  // onClick, 
  // selected,
  selectedVariant,
  deselectedVariant,
  selectCallback,
  deselectCallback,
  // wrapperArgs: {element, classList, id}, 
  ...remainderProps
}: EditTextButtonProps
) {

  // get wrapper
  const { hasSelection, selectionAnchorNode, selectionAnchorOffset, selectionFocusNode, selectionFocusOffset, keyAndWrapperObjs, contentRef, updateContent, createContentPortal, portals, removePortal } = useEditableContentContext();


  const [selected, setSelected] = useState<boolean>(false);
  const [enabled, setEnabled] = useState<boolean>(false);

  useEffect(function() {
    const selection = window.getSelection();
  
    const status = getButtonStatus(selection, wrapperArgs.unbreakable, query, contentRef.current);
    setSelected(status.selected);
    setEnabled(status.enabled);


  }, [hasSelection, selectionAnchorNode, selectionAnchorOffset, selectionFocusNode, selectionFocusOffset])

  // opportunity for useMemo
  const thisKeyAndWrapper = keyAndWrapperObjs.find(kw => kw.dataKey === dataKey);
  const wrapper = thisKeyAndWrapper?.wrapper;
  if (!wrapper) return;
  const isReactComponent = getIsReactComponent(wrapper);

  // get wrapperArgs
  const wrapperArgs = reactNodeToWrapperArgs(wrapper);
  const query = generateQuery(wrapperArgs);


  
  


  function handleEditTextButtonClick() {

    if (!wrapper) return;

    const selection = window.getSelection();

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
          createContentPortal(wrapper, dataKey);

        
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
      const newRange = new Range();
      newRange.setStartAfter(targetElement);
      newRange.collapse();
      const newTextNode = document.createTextNode("\u200B\u200B");
      newRange.insertNode(newTextNode);


      window.getSelection()?.setBaseAndExtent(newTextNode, 1, newTextNode, 1);
      // moveSelection(selection, contentRef?.current, "right");

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
    
  }

  return (
    isMUIButton ? 
      <Button 
        disabled={!enabled}
        onClick={() => { handleEditTextButtonClick() }}
        variant={selected ? 
          (selectedVariant || "contained") : 
          (deselectedVariant || "outlined")
        }
        // Only pass valid MUI Button props here
        {...(remainderProps as React.ComponentProps<typeof Button>)}
      >
        {children}
      </Button> :
      <button
        disabled={!enabled}
        onClick={() => { handleEditTextButtonClick() }}
        // id={id}
        // className={classList?.join(" ")}
        {...remainderProps}
      >
        {children}
      </button>
  )
}





// unfinished, unused
function getWrapperArgs(component: ReactElement, isReactComponent: boolean) {
  const element = isReactComponent ?
    reactNodeToElement(component) : 
    component as unknown as Element;

  
}


function reactNodeToWrapperArgs(rn: ReactNode): WrapperArgs {

  const element = reactNodeToElement(rn);

  let mappedAttributes: {[key: string] : string | undefined} = {}

  for (let attr of Array.from(element.attributes)) {
    if ((attr.name) === 'class' || (attr.name) === 'getContext') continue;
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
    // unbreakable: true
    unbreakable: element.hasAttribute("data-unbreakable") || getIsReactComponent(rn as ReactElement)
    // eventListeners: getEventListeners(element)      
  };

  // console.log(rn?.type?.name, wrapperArgs);

  return wrapperArgs;
}


function reactNodeToElement(reactNode: ReactNode) {
  const stringified = renderToString(reactNode);
  const parsedElement = new DOMParser().parseFromString(stringified, "text/html").body.children[0];
  return parsedElement;
}

function getIsSelected(selection: Selection, query: string, contentRef: MutableRefObject<HTMLDivElement>) {

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