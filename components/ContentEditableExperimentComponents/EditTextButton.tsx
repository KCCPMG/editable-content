import { selectionIsDescendentOf } from "@/utils/utils";

export type EditTextButtonProps = {
  children: React.ReactNode,
  selection: Selection | null,
  contentRef?: React.MutableRefObject<HTMLDivElement | null>,
  query: string,
  // wrapper: Element,
  dataKey: string
}


export default function EditTextButton({children, selection, contentRef, query}: EditTextButtonProps) {

  function handleClick() {
    console.log(contentRef?.current?.innerHTML);
  }

  function getSelectionIsDescendentOf(): boolean {
    if (!selection || !contentRef || !contentRef.current) return false;
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
