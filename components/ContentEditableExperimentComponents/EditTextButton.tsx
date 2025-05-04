import { selectionIsDescendentOf, wrapInElement } from "@/utils/utils";
import { useState, useEffect } from "react";

export type EditTextButtonProps = {
  dataKey: string
  children: React.ReactNode,
  selection: Selection | null,
  contentRef?: React.MutableRefObject<HTMLDivElement | null>,
  wrapperElement: string,
  wrapperClassList?: Array<string>,
  wrapperId?: string

}


export default function EditTextButton({dataKey, children, selection, contentRef, wrapperElement, wrapperClassList, wrapperId}: EditTextButtonProps) {

  const [query, setQuery] = useState("")

  useEffect(() => {
    
    const classList = wrapperClassList ? wrapperClassList.map(c => "."+c).join("") : "";
    const id = "#"+wrapperId;
    setQuery(wrapperElement + classList + id);

  }, [wrapperElement, wrapperClassList, wrapperId])
  
  
  function handleClick() {
    // selection not descendent of wrapper, selection not covered
    
    // TODO: purge any contents within of wrapper
    
    console.log(`click from EditTextButton ${dataKey}`)
    // console.log(contentRef?.current?.innerHTML);
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

    }

    // TODO: selection not descendent of wrapper, selection covered


    // TODO: selection descendent of wrapper


    // TODO: Restore selection
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
      <button onClick={handleClick}>
        {children}
      </button>
      <p>
        Is Descendent Of: {String(getSelectionIsDescendentOf())}, Selection Covered By: {String(true)}
      </p>
    </>
  )
}
