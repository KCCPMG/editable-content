import { useState } from "react";
import IncreaseColorButton from "./IncreaseColorButton";
import { useEditableContentContext } from "@/context/EditableContentContext";
import EditableContent from "@/components/EditableContent";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import PropfulBox from "@/components/TestComponents/PropfulBox";
import { Container } from "@mui/material";

const initialHTML = `
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="propful-only" 
>
  Propful Component</div>`.replaceAll(/\n */g, '');

const tableStyle: React.CSSProperties = {border: "1px solid black", borderCollapse: "collapse"};

export default function Content() {
  
  const [componentBorderColor, setComponentBorderColor] = useState("red");
  const context = useEditableContentContext();
  const getAllPortalProps = context.getAllPortalProps;

  const allPortalProps = getAllPortalProps();
  console.log(allPortalProps);


  return (
    <>
      <div>
        <IncreaseColorButton 
          componentBorderColor={componentBorderColor} 
          setComponentBorderColor={setComponentBorderColor} 
        />
      </div>
      <EditableContent
        initialHTML={initialHTML}
        divStyle={{
          height: "200px",
          padding: "10px"
        }}
        editTextButtons={[
          {
            isMUIButton: true,
            dataKey: "propful-only",
            child: "Propful Box",
            isReactComponent: true,
            isStateful: true,
            component: <PropfulBox 
              clickCount={0}
              borderC={componentBorderColor} 
              context={useEditableContentContext()}
            />,
          },
          {
            isMUIButton: true,
            dataKey: "stateful-component",
            child: "SC",
            isReactComponent: true,
            isStateful: true,
            component: <StatefulBox />
          },

        ]}
      />
      <Container>
        <h3>All Props</h3>
        <table style={tableStyle}>
          <thead style={tableStyle}>
            <tr>
              <td><h5>Component ID</h5></td>
              <td><h5>Props</h5></td>
            </tr>
          </thead>
          {
            Object.entries(allPortalProps).map(([id, props]) => {
              return(
                <tr style={tableStyle}>
                  <td style={tableStyle}>{id}</td>
                  {
                    Object.entries(props).map(([k,v]) => {
                      if (k != "children" && k != "context")
                      return(
                        <tr style={tableStyle}>
                          <td style={tableStyle}>{k}</td>
                          <td style={tableStyle}>{v}</td>
                        </tr>
                      )
                    })
                  }
                </tr>
              )
            })
          }
        </table>
      </Container>
    </>
  )
}