import { useEditableContentContext } from "@/packages/editable-content/src/EditableContentContext"
import DisplayContainer from "./DisplayContainer";
import safeStringify from "safe-stringify";
import { Table, TableContainer, TableHead, TableBody, TableRow, TableCell } from "@mui/material";

const tableStyle: React.CSSProperties = {
  border: "1px solid black", 
  borderCollapse: "collapse",
  whiteSpace: "pre",
  padding: "6px",
  minWidth: "60px"

};


type AllPropsDisplayProps = {
  show?: boolean
}


export default function AllPropsDisplay({show} : AllPropsDisplayProps) {


  const { getAllPortalProps } = useEditableContentContext();
  const allProps = getAllPortalProps();

  return (
    <DisplayContainer title="All Props" showInitial={!!show} >
      <TableContainer sx={{maxHeight: 500}}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><h4>Portal Id</h4></TableCell>
              <TableCell><h4>Prop</h4></TableCell>
              <TableCell><h4>Prop Value</h4></TableCell>
            </TableRow>
          </TableHead>
          {
            Object.entries(allProps).map(([id, props]) => {

              const propsArr = Object.entries(props);

              return (
                <TableBody key={id} >
                  <TableRow>
                    <TableCell rowSpan={propsArr.length}><strong>{id}</strong></TableCell>
                    <TableCell><strong>{propsArr[0][0]}</strong></TableCell>
                    <TableCell>{propsArr[0][1]}</TableCell>
                  </TableRow>           
                  {
                    propsArr.slice(1).map((propPair) => {
                      return (
                        <TableRow key={`${id}-${propPair[0]}`}>
                          <TableCell><strong>{propPair[0]}</strong></TableCell>
                          <TableCell>{safeStringify(propPair[1])}</TableCell>
                        </TableRow>
                      )
                    })
                  }
                </TableBody>
              )
            }
          )}
        </Table>
      </TableContainer>
    </DisplayContainer>
  )
}