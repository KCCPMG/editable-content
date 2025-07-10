import { Button, ButtonOwnProps } from "@mui/material";
import { isValidElement, ReactElement, ReactNode } from "react";
import { WrapperArgs } from ".";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { renderToString } from "react-dom/server";

// "color", even when not named, causes type conflict from WrapperArgs
type EditTextButtonProps = Omit<ButtonOwnProps, "color"> 
  & React.ComponentPropsWithoutRef<'button'> & {
  isMUIButton: boolean,
  dataKey: string,
  child: React.ReactNode,
  // contentRef: React.MutableRefObject<HTMLDivElement | null> | undefined,
  selected: Boolean,
  onClick: () => void,
  selectedVariant?: ButtonOwnProps["variant"],
  deselectedVariant?: ButtonOwnProps["variant"],
  selectCallback?: ((wrapper: HTMLElement) => void) | undefined,
  deselectCallback?: () => void | undefined,
  wrapperArgs: WrapperArgs
};

export default function EditTextButton({
  isMUIButton, 
  dataKey, 
  child, 
  // contentRef, 
  onClick, 
  selected,
  selectedVariant,
  deselectedVariant,
  // wrapperArgs: {element, classList, id}, 
  ...remainderProps
}: EditTextButtonProps
) {

  // get wrapper
  const { keyAndWrapperObjs } = useEditableContentContext();
  const thisKeyAndWrapper = keyAndWrapperObjs.find(kw => kw.dataKey === dataKey);
  const wrapper = thisKeyAndWrapper?.wrapper;

  if (!wrapper) return;

  // get wrapperArgs
  const element = isReactComponent(wrapper) ? 
    reactNodeToElement(wrapper) : 
    wrapper as Element;
  const wrapperArgs = {
    element: element.tagName,
    classList: element.className ? element.className.split(" ") : [],
    id: element.getAttribute('id') || undefined,
    attributes: mappedAttributes,
    // unbreakable: typeof mappedAttributes['data-unbreakable'] === 'string'
    unbreakable: true
    // eventListeners: getEventListeners(element)   
  }


  

  function handleEditTextButtonClick() {
    if (!wrapper) return;
    // implement logic from etb.map, make determination about if and when to use 
    // isReactComponent

  }

  return (
    isMUIButton ? 
      <Button 
        onClick={onClick}
        variant={selected ? 
          (selectedVariant || "contained") : 
          (deselectedVariant || "outlined")
        }
        // Only pass valid MUI Button props here
        {...(remainderProps as React.ComponentProps<typeof Button>)}
      >
        {child}
      </Button> :
      <button
        onClick={onClick}
        id={id}
        className={classList?.join(" ")}
        {...remainderProps}
      >
        {child}
      </button>
  )
}


function isReactComponent(component: ReactElement) {
  if (!isValidElement(component)) return false;
  return (typeof component.type === "function" || 
    typeof component.type === "object");
}


function getWrapperArgs(component: ReactElement) {
  const element = isReactComponent(component) ?
    reactNodeToElement(component) : 
    component as unknown as Element;

  
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


function reactNodeToElement(reactNode: ReactNode) {
  const stringified = renderToString(reactNode);
  const parsedElement = new DOMParser().parseFromString(stringified, "text/html").body.children[0];
  return parsedElement;
}