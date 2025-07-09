import { useState } from "react";
import IncreaseColorButton from "./IncreaseColorButton";
import { useEditableContentContext } from "@/context/EditableContentContext";
import EditableContent from "@/components/EditableContent";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import PropfulBox from "@/components/TestComponents/PropfulBox";

const initialHTML = `
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="propful-only" 
>
  Propful Component</div>`.replaceAll(/\n */g, '');

export default function Content() {
  
  const [componentBorderColor, setComponentBorderColor] = useState("red");
  const context = useEditableContentContext();

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
      {/* <PropfulBox clickCount={0} borderC="red" context={useEditableContentContext()}>
        Propful Box
      </PropfulBox> */}
    </>
  )
}