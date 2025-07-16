import { useEditableContentContext } from "@/context/EditableContentContext"
import DisplayContainer from "./DisplayContainer";


type ContentRefCurrentInnerHTMLContainerProps = {
  show?: boolean
}


export default function ContentRefCurrentInnerHTMLContainer(
  {show} : ContentRefCurrentInnerHTMLContainerProps
) {

  const currentHTML = useEditableContentContext().contentRefCurrentInnerHTML

  return (
    <DisplayContainer 
      title="contentRefCurrentInnerHTML" 
      showInitial={!!show} 
    >
      {currentHTML}
    </DisplayContainer>
  )
}