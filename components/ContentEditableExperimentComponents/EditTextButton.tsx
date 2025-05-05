import { selectionIsDescendentOf, wrapInElement } from "@/utils/utils";
import { useState, useEffect } from "react";
import { Button, ListItemButton } from "@mui/material";
import { ButtonOwnProps } from "@mui/material";
import { SelectionTransforms } from "slate/dist/interfaces/transforms/selection";


export type EditTextButtonProps = {
  dataKey: string
  children: React.ReactNode,
  selection: Selection | null,
  wrapperElement: string,
  defaultColor?: ButtonOwnProps['color'],
  selectedColor?: ButtonOwnProps['color'],
  contentRef?: React.MutableRefObject<HTMLDivElement | null>,
  wrapperClassList?: Array<string>,
  wrapperId?: string

}


export default function EditTextButton({dataKey, children, selection, wrapperElement, defaultColor, selectedColor, contentRef, wrapperClassList, wrapperId}: EditTextButtonProps) {

  const [query, setQuery] = useState("");
  const [currentColor, setCurrentColor] = useState<ButtonOwnProps['color']>(defaultColor || "primary")

  useEffect(() => {
    
    const classList = wrapperClassList ? wrapperClassList.map(c => "."+c).join("") : "";
    const id = "#"+wrapperId;
    setQuery(wrapperElement + classList + id);

  }, [wrapperElement, wrapperClassList, wrapperId])

  useEffect(() => {
    console.log("selection listener useEffect");
    getSelectionIsDescendentOf() ? setCurrentColor(selectedColor) : setCurrentColor(defaultColor)
  }, [selection?.anchorNode, selection?.focusNode, selection?.anchorOffset, selection?.focusOffset])
  
  
  function handleClick() {
    // selection not descendent of wrapper, selection not covered
    console.log(`click from EditTextButton ${dataKey}`)
    
    // TODO: purge any contents within of wrapper
    
    
    if (!getSelectionIsDescendentOf() && !!selection) {
      const wrapper = document.createElement(wrapperElement);
      if (wrapperClassList) {
        wrapperClassList.forEach(wcl => {
          wrapper.classList.add(wcl);
        })
      }
      if (wrapperId) {
        wrapper.setAttribute('id', wrapperId);
      }
      wrapInElement(selection, wrapper);

      if (wrapper.childNodes.length === 0) {
        const textNode = document.createTextNode("\u00A0");
        wrapper.append(textNode);
      }
      selection.setBaseAndExtent(wrapper, 0, wrapper, wrapper.childNodes.length);

    }

    // TODO: selection not descendent of wrapper, selection covered


    // TODO: selection descendent of wrapper


    // TODO: Restore selection
    // console.log(window.getSelection());
    // !!selection && !!selection.anchorNode && !!selection.focusNode &&  selection.setBaseAndExtent(selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset);
  }


  function getSelectionIsDescendentOf(): boolean {
    if (
      !selection || 
      !contentRef || 
      !contentRef.current ||
      query.trim() === ""
    ) return false;
    else return selectionIsDescendentOf(selection, query, contentRef.current);
  }

  return (
    <>
      {/* <ListItemButton onClick={handleClick} selected>
        {children}
      </ListItemButton> */}
      <Button 
        variant="outlined"
        color={currentColor}
        onClick={handleClick}
      >
        {children}
      </Button>
      {/* <p>
        Is Descendent Of: {String(getSelectionIsDescendentOf())}, Selection Covered By: {String(true)}
      </p> */}
    </>
  )
}
