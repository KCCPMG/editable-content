import { useEditableContentContext } from "@/context/EditableContentContext"
import DisplayContainer from "./DisplayContainer";

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
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam arcu nibh, fringilla ultricies efficitur quis, volutpat at nulla. Mauris et ornare nibh. Vestibulum sodales nulla ligula, et lobortis neque dapibus vel. Curabitur venenatis faucibus tincidunt. In lobortis tristique euismod. Nulla a tristique erat. Suspendisse potenti.

      Pellentesque arcu dui, finibus sed aliquam eu, condimentum vitae lectus. Aliquam viverra id mi vel euismod. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean porta nunc et mollis rhoncus. Proin lacinia eu nulla sit amet convallis. Integer vitae nisl eu nunc dignissim varius. Cras vitae sapien sed arcu lacinia consequat. Vivamus sed magna viverra, maximus odio in, lacinia massa. Quisque lorem est, malesuada quis odio ut, tincidunt accumsan enim. Integer a elementum lectus.

      Maecenas et blandit leo, id imperdiet justo. Proin imperdiet sem ut massa dignissim, sed sollicitudin dui mollis. Praesent fringilla nisi lorem, sit amet pretium nunc suscipit quis. Cras porta facilisis erat a feugiat. Quisque a urna tristique, scelerisque nisi ut, rhoncus neque. Nunc malesuada turpis eget vehicula maximus. Aliquam lacinia leo vel arcu tincidunt sagittis. Cras scelerisque mollis dolor dictum molestie. Proin id erat nibh. Nunc bibendum magna et urna volutpat, ac dapibus nisl hendrerit. Vivamus finibus porttitor viverra. Aenean lacinia velit non ante semper molestie.

      Praesent sagittis, felis a volutpat iaculis, neque enim tincidunt risus, quis condimentum eros purus elementum ipsum. Pellentesque id euismod augue. Integer accumsan tortor ut diam tempor dignissim. Phasellus faucibus ac ipsum nec iaculis. Etiam laoreet neque et tellus aliquet iaculis. Curabitur in pretium ligula. Vivamus mollis pulvinar varius. Nullam urna tortor, malesuada at eleifend et, dapibus eu nisi. Etiam diam velit, gravida quis porttitor vel, mollis at mauris. Pellentesque non porta orci, vitae condimentum urna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Proin posuere ipsum ac ante sagittis, porttitor dapibus justo porta.

      Aliquam vehicula sodales risus eu mollis. Aenean ac tortor eu sem bibendum posuere ut non quam. Fusce non lectus et metus fringilla pellentesque. Integer eleifend tincidunt odio laoreet bibendum. Maecenas tempus turpis eu erat auctor, ut facilisis lacus sagittis. Curabitur mattis mollis rhoncus. Nullam bibendum erat eget suscipit luctus. Morbi cursus rutrum purus eget laoreet. Ut suscipit odio quis nisi lacinia, nec facilisis neque auctor. Fusce in enim dapibus, feugiat nibh nec, posuere nibh. Nullam quam ex, fermentum nec venenatis ac, volutpat a ex. Nam turpis ligula, commodo non sodales eu, ullamcorper a sapien. Pellentesque quis diam mollis tellus malesuada rutrum.
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
    </DisplayContainer>
  )
}