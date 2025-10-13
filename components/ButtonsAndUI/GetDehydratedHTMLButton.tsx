import { useEditableContentContext } from "@/packages/editable-content/src/EditableContentContext";
import { Button } from "@mui/material";

export default function GetDehydratedHTMLButton() {
  const { prepareDehydratedHTML } = useEditableContentContext();

  function logDehydratedHTML (dehydratedHTML: string) {
    console.log(dehydratedHTML);
  }

  return (
    <Button onClick={() => { prepareDehydratedHTML(logDehydratedHTML) }}>
      Log Dehydrated HTML
    </Button>
  )
}