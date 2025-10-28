"use client"
import { EditableContentContextProvider, useEditableContentContext, EditableContent, EditTextButton, RenderedContent } from "@kccpmg/editable-content";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import StatefulAndPropfulBox from "@/components/Wrappers/StatefulAndPropfulBox";
import StatefulBox from "@/components/Wrappers/StatefulBox";
import { Box, Button, Typography } from "@mui/material";
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import ContentRefCurrentInnerHTMLDisplay from "@/components/DisplayComponents/ContentRefCurrentInnerHTMLDisplay";
import SelectionDisplay from "@/components/DisplayComponents/SelectionDisplay";
import NextPageLink from "@/components/LayoutComponents/NextPageLink";
import { EditModeContextProvider } from "@/context/EditModeContext";
import StatefulAndPropfulContent from "./StatefulAndPropfulContent";

const initialHTML = `​Normal ​Text<br>
<div id=\"portal-container-3dbccd2a-6a07-460b-b2d2-fff8ba8e0595\" data-button-key=\"stateful-and-propful\" style=\"display: inline;\">First Stateful ​and ​Propful ​Component</div>
<div id="portal-container-55cbf53f-9039-4e53-95d7-f96560f40905" data-button-key="stateful-and-propful" style="display: inline;">
Second Stateful and Propful Component</div><div id=\"portal-container-5aabe861-8470-430d-b77e-310d272864f1\" data-button-key=\"stateful-component\" style=\"display: inline;\">​Stateful ​Only ​Component</div>​<br>`;

export default function Page() {

  const [initialClicks, setInitialClicks] = useState(0);
  const [componentBorderColor, setComponentBorderColor] = useState("Red");
  const [editMode, setEditMode] = useState<boolean>(true);

  return (
    <>
      <Typography variant="h2">Stateful and Propful Components</Typography>
      <p>
        Since we are using React, we presumably want our components to have the ability to change. Generally speaking, the two most common ways that that is done are through changes to a component&apos;s props or its state. Here we have two different components which handle those changes differently.
      </p>
      <p>
        There are two components here: <strong>Stateful and Propful</strong> and <strong>Stateful Only</strong>. Both of these component types will keep track of the number of times that they have been clicked in their own state. However, <strong>Stateful and Propful</strong> 
        also has its border color set by a prop. Try clicking on the <strong>Rotate Color From...</strong> Button to see all instances of the <strong>Stateful and Propful</strong> change their border color. Note that the change border color will persist when clicking the <strong>Render Text</strong> button and then the <strong>Edit Text</strong> button again. This means that the border color prop is stable across re-renders.
      </p>
      <p>
        What you should observe is that clicking the <strong>Rotate Color From...</strong> Button changes the border color of every instance of <strong>Stateful and Propful</strong>. These changes will not only persist when switching back and forth between <strong>Edit Text</strong> and <strong>Render Text</strong>, all new <strong>Stateful and Propful</strong> components will have the same border color when they are created.
      </p>
      <p>
        However, as you go back and forth between the text being rendered and the text being edited, you will see that the click count is not being preserved in the same way. The prior click count will remain, but a new click count will also appear as 0. For example, if you click the Stateful Only component 7 times, the component will read as &ldquo;7 Stateful Only Component&rdquo;. Clicking the &ldquo;Render Text Button&rdquo; will then change this to &ldquo;0 7 Stateful Only Component&rdquo;. There are two separate things happening here:
      </p>
      <ul>
        <li>
          The re-rendering of the component will cause it to reinitialize its click count state as 0, which it will then display at the beginning of the component.
        </li>
        <li>
          The previous click count of &ldquo;7&rdquo; is absorbed into the text that is being rendered.
        </li>
      </ul>
      <p>
        What this illustrates is that components are re-rendered by switching. This destroys the state, but props are preserved at a higher level. The next example will show a better way of managing this situation with a stable click count.
      </p>
      <p>
        Additionally, clicking any of the rendered components should increase the click count that is displayed in that component, BUT, you will note that that number is reset every time when switching back and forth between <strong>Edit Text</strong> and <strong>Render Text</strong>. 
      </p>
      <p>
        <strong>Note:</strong> When switching back and forth, the previous count will still show, meaning more and more numbers will appear. This gives you a record of what the previous state was, but also demonstrates why it is not a good idea to render additional text in your wrappers.
      </p>
      <EditModeContextProvider initialEditMode={true}>
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
          <StatefulAndPropfulContent />
        </EditableContentContextProvider>
      </EditModeContextProvider>
      <NextPageLink href="/propful-only" />
    </>
  )
}



type IncreaseColorButtonProps = {
  componentBorderColor: string,
  setComponentBorderColor: Dispatch<SetStateAction<string>>
}


function IncreaseColorButton({componentBorderColor, setComponentBorderColor}: IncreaseColorButtonProps) {

  const { updatePortalProps, contentRef } = useEditableContentContext();

  const colors = ["Red", "Blue", "Green", "Black"];

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
    <Button 
      variant="outlined" 
      sx={{borderColor: componentBorderColor}} 
      onClick={rotateColor}
    >
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