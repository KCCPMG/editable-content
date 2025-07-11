import { Container } from "@mui/material";
import { useEditableContentContext } from "@/context/EditableContentContext";

export default function SelectionToStringContainer() {
  return (
    <Container sx={{border: "1px solid black", margin: "10px", padding: "10px"}}>
      <h4>Selection:</h4>
      {useEditableContentContext().selectionToString}
    </Container>
  )
}