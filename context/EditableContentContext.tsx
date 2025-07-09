import { getRangeChildNodes } from "@/utils/utils";
import { useContext, createContext, useRef, useState, SetStateAction, Dispatch, MutableRefObject, ReactPortal, ReactNode, cloneElement, isValidElement } from "react";
import { createPortal } from "react-dom";


type UpdatePortalPropsArg = {
  [key: string]: {[key: string]: any}
}


// this would be a replacement for EditableContent's state in many cases
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
  portalsState: {[key: string]: any}, 
  setPortalsState: Dispatch<SetStateAction<{[key: string]: any}>>,
  mustReportState: {[key: string]: boolean},  
  setMustReportState: Dispatch<SetStateAction<{[key: string]: any}>>,
  divToSetSelectionTo: HTMLElement | null, 
  setDivToSetSelectionTo: Dispatch<SetStateAction<HTMLElement | null>>,
  getDehydratedHTML: (callback: (dehydratedHTML: string) => void) => void,
  updatePortalProps: (updateObj: UpdatePortalPropsArg) => void,
}

const EditableContentContext = createContext<EditableContentContextType | null>(null);


type EditableContentContextProviderProps = {
  children: ReactNode
}


export function EditableContentContextProvider({children}: EditableContentContextProviderProps) {

  const contentRef = useRef<null | HTMLDivElement>(null);
  const [contentRefCurrentInnerHTML, setContentRefCurrentInnerHTML] = useState<string>("");
  const [selectionToString, setSelectionToString] = useState<string>("");
  const [selectionAnchorNode, setSelectionAnchorNode] = useState<Node | null>(null)
  const [selectionAnchorOffset, setSelectionAnchorOffset] = useState<number | null>(null);
  const [selectionFocusNode, setSelectionFocusNode] = useState<Node | null>(null)
  const [selectionFocusOffset, setSelectionFocusOffset] = useState<number | null>(null);
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [portals, setPortals] = useState<Array<React.ReactPortal>>([]);
  const [portalsState, setPortalsState] = useState<{[key: string]: any}>({});
  const [mustReportState, setMustReportState] = useState<{[key: string]: any}>({});
  const [divToSetSelectionTo, setDivToSetSelectionTo] = useState<HTMLElement | null>(null)


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




  // function updatePortalProps(portalId: string, newProps: {[key: string]: any}) {
  function updatePortalProps(updateObj: UpdatePortalPropsArg) {

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
      portalsState, 
      setPortalsState,
      mustReportState, 
      setMustReportState,
      divToSetSelectionTo, 
      setDivToSetSelectionTo,
      getDehydratedHTML,
      updatePortalProps
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