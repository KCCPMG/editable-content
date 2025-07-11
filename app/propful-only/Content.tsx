import { useState } from "react";
import IncreaseColorButton from "./IncreaseColorButton";
import { useEditableContentContext } from "@/context/EditableContentContext";
import EditableContent from "@/components/EditableContent";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import PropfulBox from "@/components/TestComponents/PropfulBox";
import { Container } from "@mui/material";
import EditTextButton from "@/components/ContentEditableExperimentComponents/EditTextButton";

const initialHTML = `
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="propful-only" 
>
  Propful Component</div>`.replaceAll(/\n */g, '');

const tableStyle: React.CSSProperties = {
  border: "1px solid black", 
  borderCollapse: "collapse",
  whiteSpace: "pre",
  padding: "6px",
  minWidth: "60px"

};

export default function Content() {
  
  const [componentBorderColor, setComponentBorderColor] = useState("red");
  const context = useEditableContentContext();
  const getAllPortalProps = context.getAllPortalProps;

  const allPortalProps = getAllPortalProps();
  // console.log(allPortalProps);


  return (
    <>
      <div>
        <IncreaseColorButton 
          componentBorderColor={componentBorderColor} 
          setComponentBorderColor={setComponentBorderColor} 
        />
      </div>
      <div>
        <h4>React Buttons</h4>
        <EditTextButton
          isMUIButton={true}
          dataKey="propful-only"
        >
          Propful Box
        </EditTextButton>
        <EditTextButton
          isMUIButton={true}
          dataKey="stateful-component"
        >
          Stateful Box
        </EditTextButton>
      </div>
      <div>
        <h4>Non-React Buttons</h4>
        <EditTextButton
          isMUIButton={true}
          dataKey="non-react-strong"
        >
          Non React Strong
        </EditTextButton>
        <EditTextButton
          isMUIButton={false}
          dataKey="block-italics"
        >
          Block Italics
        </EditTextButton>
      </div>
      <EditableContent
        initialHTML={initialHTML}
        divStyle={{
          height: "200px",
          padding: "10px"
        }}
      />
      <Container>
        <h3>All Props</h3>
        {
          Object.entries(allPortalProps).map(([id, props]) => {
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
      </Container>
    </>
  )
}