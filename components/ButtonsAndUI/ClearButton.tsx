import { useEditableContentContext } from "@kccpmg/editable-content";
import { Button } from "@mui/material";

export default function ClearButton() {
  const {contentRef, setContentRefCurrentInnerHTML} = useEditableContentContext();

  function clear() {
    console.log(contentRef?.current);
    if (contentRef.current) {
      contentRef.current.innerHTML = ""; // this does not change the state
      setContentRefCurrentInnerHTML(""); // this does
    }
  }

  return (
    <Button variant="text" onClick={clear}>
      Clear
    </Button>
  )
}