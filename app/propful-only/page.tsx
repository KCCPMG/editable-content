"use client"
import { EditableContentContextProvider, useEditableContentContext } from "@/context/EditableContentContext";
import { useState } from "react";
import PropfulBox from "@/components/TestComponents/PropfulBox";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import IncreaseColorButton from "./IncreaseColorButton";
import EditableContent from "@/components/EditableContent";
import { Container } from "@mui/material";
import EditTextButton from "@/components/EditTextButton";
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";


const initialHTML = `
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="propful-only" 
>
  Propful Component</div>`.replaceAll(/\n */g, '');



export default function Page() {

  const [componentBorderColor, setComponentBorderColor] = useState("red");

  return (
    <>
      <h1>Propful Only Component Example</h1>
      <p>
        There are two values here which are passed as props to every PropfulBox that is rendered here. What I expect to happen is that clicking an instance of PropfulBox will cause the click value to increase by setting its props directly with updatePortalProps.
      </p>
      <EditableContentContextProvider
        keyAndWrapperObjs={[
          {
            dataKey: "propful-only",
            wrapper: <PropfulBox 
              clickCount={0}
              borderC={componentBorderColor} 
            />
          },
          {
            dataKey: "stateful-component",
            wrapper: <StatefulBox />
          },
          {
            dataKey: "non-react-strong",
            wrapper: <strong className="non-react-strong"></strong>
          },
          {
            dataKey: "block-italics",
            wrapper: <div><i></i></div>
          }
        ]}
        initialHTML={initialHTML}
      >
        <Container>
          <IncreaseColorButton 
            componentBorderColor={componentBorderColor} 
            setComponentBorderColor={setComponentBorderColor} 
          />
        </Container>
        <Container>
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
        </Container>
        <Container>
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
        </Container>
        <EditableContent

          divStyle={{
            height: "200px",
            padding: "10px"
          }}
        />
        <Container>
          <AllPropsDisplay />
        </Container>
      </EditableContentContextProvider>
    </>
  )
}

