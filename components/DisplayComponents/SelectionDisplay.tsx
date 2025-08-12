import { useEditableContentContext } from "@/context/EditableContentContext"
import DisplayContainer from "./DisplayContainer";
import { Table, TableRow, TableBody, TableCell, TableContainer} from "@mui/material";

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
    <DisplayContainer title="Selection Text (selectionToString)" showInitial={!!show}>
      <TableContainer>
        <Table>
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
        </Table>
      </TableContainer>
    </DisplayContainer>
  )

}


function stringRepresentationOfNode(node: Node | null) {
  if (!node) return "null"
  else if (node.nodeType === Node.TEXT_NODE) {
    return `Text Node: \"${node.textContent}\"`
  }
  else if (node.nodeType === Node.ELEMENT_NODE) {
    return `Element Node: \"${(node as Element).outerHTML}\"`
  }
  else if (node.nodeType === Node.ATTRIBUTE_NODE) {
    return `Attribute Node: \"${node.textContent}\"`
  }
  else if (node.nodeType === Node.CDATA_SECTION_NODE) {
    return `CDATA Section Node: \"${node.textContent}\"`
  }
  else if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
    return `Processing Instruction Node: \"${node.textContent}\"`
  }
  else if (node.nodeType === Node.COMMENT_NODE) {
    return `Comment Node: \"${node.textContent}\"`
  }
  else if (node.nodeType === Node.DOCUMENT_NODE) {
    return `Document Node: \"${node.textContent}\"`
  }
  else if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
    return `Document Type Node: \"${node.textContent}\"`
  }
  else if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
    return `Document Fragment Node: \"${node.textContent}\"`
  }
}