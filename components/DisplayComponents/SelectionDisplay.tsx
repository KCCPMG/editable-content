import { useEditableContentContext } from "@/context/EditableContentContext"
import DisplayContainer from "./DisplayContainer";
import { Table, TableRow, TableBody, TableCell} from "@mui/material";

type SelectionToStringDisplayProps = {
  show?: boolean
}

export default function SelectionDisplay({show}: SelectionToStringDisplayProps) {

  const {
    selectionToString, 
    selectionAnchorNode, 
    selectionAnchorOffset, 
    selectionFocusNode, 
    selectionFocusOffset
  } = useEditableContentContext()

  return (
    <DisplayContainer title="Selection Text (selectionToString)" showInitial={!show}>
      <TableBody>
        <TableRow>
          <TableCell><strong>selectionToString:</strong></TableCell>
          <TableCell>{ selectionToString }</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><strong>selectionAnchorNode:</strong></TableCell>
          <TableCell>{ stringRepresentationOfNode(selectionAnchorNode) }</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><strong>selectionAnchorOffset:</strong></TableCell>
          <TableCell>{ selectionAnchorOffset }</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><strong>selectionFocusNode:</strong></TableCell>
          <TableCell>{ stringRepresentationOfNode(selectionFocusNode) }</TableCell>
        </TableRow>
        <TableRow>
          <TableCell><strong>selectionFocusOffset:</strong></TableCell>
          <TableCell>{ selectionFocusOffset }</TableCell>
        </TableRow>
      </TableBody> 
    </DisplayContainer>
  )

}


function stringRepresentationOfNode(node: Node | null) {
  if (!node) return "null"
  else if (node.nodeType === Node.TEXT_NODE) {
    return `Text Node: &quot;${node.textContent}&quot;`
  }
  else if (node.nodeType === Node.ELEMENT_NODE) {
    return `Text Node: &quot;${(node as Element).outerHTML}&quot;`
  }
  else if (node.nodeType === Node.ATTRIBUTE_NODE) {
    return `Attribute Node: &quot;${node.textContent}&quot;`
  }
  else if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `CDATA Section Node: &quot;${node.textContent}&quot;`
  }
  else if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    return `Processing Instruction Node: &quot;${node.textContent}&quot;`
  }
  else if (node.nodeType === Node.COMMENT_NODE) {
    return `Comment Node: &quot;${node.textContent}&quot;`
  }
  else if (node.nodeType === Node.DOCUMENT_NODE) {
    return `Document Node: &quot;${node.textContent}&quot;`
  }
  else if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
    return `Document Type Node: &quot;${node.textContent}&quot;`
  }
  else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    return `Document Fragment Node: &quot;${node.textContent}&quot;`
  }
}