"use client"
import EditableContent from "@/components/EditableContent";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { EditableContentContextProvider, useEditableContentContext } from "@/context/EditableContentContext";
import StatefulAndPropfulBox from "@/components/TestComponents/StatefulAndPropfulBox";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import { Box, Button, Typography } from "@mui/material";
import EditTextButton from "@/components/EditTextButton";
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import ContentRefCurrentInnerHTMLDisplay from "@/components/DisplayComponents/ContentRefCurrentInnerHTMLDisplay";
import SelectionDisplay from "@/components/DisplayComponents/SelectionDisplay";
import RenderedContent from "@/components/RenderedContent";

const initialHTML = `​Normal ​Text<br>
<div id=\"portal-container-3dbccd2a-6a07-460b-b2d2-fff8ba8e0595\" data-button-key=\"stateful-and-propful\" style=\"display: inline;\">First Stateful ​and ​Propful ​Component</div>
<div id="portal-container-55cbf53f-9039-4e53-95d7-f96560f40905" data-button-key="stateful-and-propful" style="display: inline;">
Second Stateful and Propful Component</div><div id=\"portal-container-5aabe861-8470-430d-b77e-310d272864f1\" data-button-key=\"stateful-component\" style=\"display: inline;\">​Stateful ​Only ​Component</div>​<br>`;

export default function Page() {

  const [initialClicks, setInitialClicks] = useState(0);
  const [componentBorderColor, setComponentBorderColor] = useState("red");
  const [editMode, setEditMode] = useState<boolean>(true);

  return (
    <>
      <Typography variant="h2">Stateful and Propful Components</Typography>
      <p>
        Since we are using React, we presumably want our components to have the ability to change. Generally speaking, the two ways that that is done are through changes to a component&apos;s props or its state. Here we have two different components which handle those changes differently.
      </p>
      <p>
        There are two components here: <strong>Stateful and Propful</strong> and <strong>Stateful Only</strong>. Both of these manage as state the number of times that they have been clicked, but <strong>Stateful and Propful</strong> will also take a border color as a prop, and the border color can be changed for all instances of <strong>Stateful and Propful</strong> by clicking the <strong>Rotate Color From...</strong> Button.
      </p>
      <p>
        What you should observe is that clicking the <strong>Rotate Color From...</strong> Button changes the border color of every instance of <strong>Stateful and Propful</strong>. These changes will not only persist when switching back and forth between <strong>Edit Text</strong> and <strong>Render Text</strong>, all new <strong>Stateful and Propful</strong> components will have the same border color when they are created.
      </p>
      <p>
        Additionally, clicking any of the rendered components should increase the click count that is displayed in that component, BUT, you will note that that number is reset every time when switching back and forth between <strong>Edit Text</strong> and <strong>Render Text</strong>. 
      </p>
      <p>
        <strong>Note:</strong> When switching back and forth, the previous count will still show, meaning more and more numbers will appear. This gives you a record of what the previous state was, but also demonstrates why it is not a good idea to render additional text in your wrappers.
      </p>
      {/* <p>
        There are two values here which are passed as props to every StatefulAndPropfulBox that is rendered here. What I expect to happen is that changing these props at this level (which can be done with the buttons) will have two distinct outcomes: 
      </p>
      <ul>
        <li>
          Clicking the &quot;Rotate Color From...&quot; button should change the props of all &quot;Stateful and Propful&quot; components, as these change a state value upstream which then updates the props of all found portal instances (see the logic in the useEffect hook). Each component&apos;s border color should immediately change as the component&apos;s background color is the prop passed to it.
        </li>
        <li>
          Clicking the &quot;Increase Clicks From...&quot; button will also change an upstream state value and this should also change the props, of each &quot;Stateful and Propful&quot; component, but the value displayed for the clicks of that component should not change, as the component&apos;s click count is determined by its internal state. However, future &quot;Stateful and Propful&quot; components that are created should all start from whatever value is held at the time from &quot;Increase Clicks From...&quot;
        </li>
      </ul> */}
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
        <Box>
          <Box>
            <h4>Change Props For All Components</h4>
            <IncreaseColorButton 
              componentBorderColor={componentBorderColor} 
              setComponentBorderColor={setComponentBorderColor} 
            />
            {/* <IncreaseClicksButton 
              initialClicks={initialClicks}
              setInitialClicks={setInitialClicks}
            /> */}
          </Box>
          <Box

          >
            <h4>Edit Text Buttons</h4>
            <Box>
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
            </Box>
          </Box>
        </Box>
        {
          editMode ?
            <EditableContent className="default-editable-content"/> :
            <RenderedContent className="default-rendered-content" />
        }
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Render Text" : "Edit Text"}
        </Button>
        <AllPropsDisplay show={false} />

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