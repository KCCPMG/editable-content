"use client"
import EditableContent from "@/components/EditableContent";
import { Dispatch, SetStateAction, useState, useEffect, ReactNode, useContext } from "react";
import { EditableContentContextProvider, EditableContentContextType, useEditableContentContext } from "@/context/EditableContentContext";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import PropfulBox from "@/components/TestComponents/PropfulBox";
import { Button, Box } from "@mui/material";

const initialHTML = 
`
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="propful-only" 
>
  Propful Component</div>`.replaceAll(/\n */g, '');


export default function Page() {

  return (
    <>
      <h1>Propful Only Component Example</h1>
      <p>
        There are two values here which are passed as props to every PropfulBox that is rendered here. What I expect to happen is that clicking an instance of PropfulBox will cause the click value to increase by setting its props directly with updatePortalProps.
      </p>
      <EditableContentContextProvider>
        <Content />
      </EditableContentContextProvider>
    </>
  )
}



type IncreaseColorButtonProps = {
  componentBorderColor: string,
  setComponentBorderColor: Dispatch<SetStateAction<string>>
}


function IncreaseColorButton({componentBorderColor, setComponentBorderColor}: IncreaseColorButtonProps) {

  const { updatePortalProps, contentRef } = useEditableContentContext();

  const colors = ["red", "blue", "green", "black"];

  // on componentBorderColor change, updatePortalProps
  useEffect(function() {
    if (!contentRef.current) return;
    const divs = Array.from(contentRef.current.querySelectorAll("div[data-button-key='stateful-and-propful"));
    const keys = divs.map(div => div.getAttribute('id')?.split("portal-container-")[1]);

    const updateObj = Object.assign({}, ...keys.map(key => {
      if (typeof key != "string") return {}
      return {[key]: {borderC: componentBorderColor}}
    }))

    updatePortalProps(updateObj);
  }, [componentBorderColor])


  function rotateColor() {
    let index = colors.findIndex(c => c === componentBorderColor);
    index++;
    setComponentBorderColor(colors[index % colors.length]);
  }

  return (
    <Button onClick={rotateColor}>
      Rotate Color from {componentBorderColor}
    </Button>
  )
}




type PropfulBoxProps = {
  clickCount: number,
  borderC: string,
  children?: ReactNode,
  context: EditableContentContextType,
  [key: string]: any
}




function Content() {
  
  // const [initialClicks, setInitialClicks] = useState(0);
  const [componentBorderColor, setComponentBorderColor] = useState("red");
  // const context = useEditableContentContext();

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
          height: "450px",
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
      <PropfulBox clickCount={0} borderC="red" context={useEditableContentContext()}>
        Propful Box
      </PropfulBox>
    </>
  )
}