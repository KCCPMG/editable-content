import { useEditableContentContext } from "@/context/EditableContentContext"

const tableStyle: React.CSSProperties = {
  border: "1px solid black", 
  borderCollapse: "collapse",
  whiteSpace: "pre",
  padding: "6px",
  minWidth: "60px"

};


export default function allPortalPropDisplay() {

  const { getAllPortalProps } = useEditableContentContext();
  const allProps = getAllPortalProps();

  return (
    <>
      <h3>All Props</h3>
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
                    if (k != "children" && k != "getContext")
                    return(
                      <tr key={k} style={tableStyle}>
                        <td style={tableStyle}>{k}</td>
                        <td style={tableStyle}>{v}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          )
        })
      }
    </>
  )
}