import { useEditableContentContext } from "@/context/EditableContentContext"
import DisplayContainer from "./DisplayContainer";
import safeStringify from "safe-stringify";

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
      {
        Object.entries(allProps).map(([id, props]) => {
          return(
            <table key={id} style={tableStyle}>
              <thead style={tableStyle}>
                <tr>
                  <th style={tableStyle}><h5>PortalId: {id}</h5></th>
                </tr>
              </thead>
              <tbody>
                {
                  Object.entries(props).map(([k,v]) => {
                    return(
                      <tr key={k} style={tableStyle}>
                        <td style={tableStyle}>{k}</td>
                        <td style={tableStyle}>
                          {
                            typeof v === 'function' ? 
                            <i>{v.toString().slice(0,50)}</i> : 
                            safeStringify(v)
                          }
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          )
        })
      }
    </DisplayContainer>
  )
}