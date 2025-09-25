import { useEditableContentContext } from "@/packages/editable-content/src/EditableContentContext";
import { Button } from "@mui/material";

export default function GetDehydratedHTMLButton() {
  const { getDehydratedHTML } = useEditableContentContext();

  function logDehydratedHTML (dehydratedHTML: string) {
    console.log(dehydratedHTML);
  }

  return (
    <Button onClick={() => { getDehydratedHTML(logDehydratedHTML) }}>
      Log Dehyrated HTML
    </Button>
  )
}