"use client"
import EditableContent from "@/components/EditableContent";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { EditableContentContextProvider, useEditableContentContext } from "@/context/EditableContentContext";
import StatefulAndPropfulBox from "@/components/TestComponents/StatefulAndPropfulBox";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import { Button } from "@mui/material";
import EditTextButton from "@/components/EditTextButton";

const initialHTML = 
`
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="stateful-and-propful" 
>
  Stateful and Propful Component</div>`.replaceAll(/\n */g, '');

export default function Page() {

  const [initialClicks, setInitialClicks] = useState(0);
  const [componentBorderColor, setComponentBorderColor] = useState("red");

  return (
    <>
      <h1>Stateful and Propful Component Example</h1>
      <p>
        There are two values here which are passed as props to every StatefulAndPropfulBox that is rendered here. What I expect to happen is that changing these props at this level (which can be done with the buttons) will have two distinct outcomes: 
      </p>
      <ul>
        <li>
          Clicking the &quot;Rotate Color From...&quot; button should change the props of all &quot;Stateful and Propful&quot; components, as these change a state value upstream which then updates the props of all found portal instances (see the logic in the useEffect hook). Each component&apos;s border color should immediately change as the component&apos;s background color is the prop passed to it.
        </li>
        <li>
          Clicking the &quot;Increase Clicks From...&quot; button will also change an upstream state value and this should also change the props, of each &quot;Stateful and Propful&quot; component, but the value displayed for the clicks of that component should not change, as the component&apos;s click count is determined by its internal state. However, future &quot;Stateful and Propful&quot; components that are created should all start from whatever value is held at the time from &quot;Increase Clicks From...&quot;
        </li>
      </ul>
      <EditableContentContextProvider
        initialHTML={initialHTML}
        keyAndWrapperObjs={[
          {
            dataKey: "stateful-and-propful",
            wrapper: <StatefulAndPropfulBox 
              initialClicks={initialClicks}
              borderC={componentBorderColor} 
            />
          }, 
          {
            dataKey: "stateful-component",
            wrapper: <StatefulBox />
          }
        ]}

      >
        <div>
          <IncreaseColorButton 
            componentBorderColor={componentBorderColor} 
            setComponentBorderColor={setComponentBorderColor} 
          />
          <IncreaseClicksButton 
            initialClicks={initialClicks}
            setInitialClicks={setInitialClicks}
          />
        </div>
        <div>
          <EditTextButton
            isMUIButton={true}
            dataKey="stateful-and-propful"
          >
            Stateful and Propful
          </EditTextButton>
          <EditTextButton
            isMUIButton={true}
            dataKey="stateful-component"
          >
            Stateful Component
          </EditTextButton>          
        </div>
        <EditableContent
          divStyle={{
            height: "450px",
            padding: "10px"
          }}
        />
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


type IncreaseClicksButtonProps = {
  initialClicks: number,
  setInitialClicks: Dispatch<SetStateAction<number>>
}


function IncreaseClicksButton({initialClicks, setInitialClicks}: IncreaseClicksButtonProps) {

  const { updatePortalProps, contentRef } = useEditableContentContext();

  useEffect(function() {
    if (!contentRef.current) return;
    const divs = Array.from(contentRef.current.querySelectorAll("div[data-button-key='stateful-and-propful"));
    const keys = divs.map(div => div.getAttribute('id')?.split("portal-container-")[1]);

    const updateObj = Object.assign({}, ...keys.map(key => {
      if (typeof key != "string") return {}
      return {[key]: {initialClicks: initialClicks}}
    }))

    updatePortalProps(updateObj);
  }, [initialClicks])

  function increaseClicks() {
    setInitialClicks(initialClicks => (initialClicks + 1));
  }

  return (
    <Button onClick={increaseClicks}>
      Increase Clicks from {initialClicks}
    </Button>
  )
}