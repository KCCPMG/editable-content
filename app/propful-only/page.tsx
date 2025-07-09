"use client"
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import Content from "./Content";
import { useState } from "react";
import PropfulBox from "@/components/TestComponents/PropfulBox";
import StatefulBox from "@/components/TestComponents/StatefulBox";


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
          }
        ]}
      >
        <Content />
      </EditableContentContextProvider>
    </>
  )
}









