import { useContext, createContext, useRef, useState, SetStateAction, Dispatch, MutableRefObject, ReactPortal, ReactNode } from "react";


// this would be a replacement for EditableContent's state in many cases
type EditableContentContextType = {
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
  setDivToSetSelectionTo: Dispatch<SetStateAction<HTMLElement | null>>
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
      setDivToSetSelectionTo
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