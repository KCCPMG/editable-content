import { useEditableContentContext } from "@/context/EditableContentContext";
import { Container } from "@mui/material";

export default function ContentRefCurrentInnerHTMLContainer() {
  return(
    <Container sx={{border: "1px solid black", margin: "10px", padding: "10px"}}>
      <h4>ContentRef.current InnerHTML:</h4>
      {useEditableContentContext().contentRefCurrentInnerHTML}
    </Container>
  )
}