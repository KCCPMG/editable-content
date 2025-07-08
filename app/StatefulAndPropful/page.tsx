"use client"
import EditableContent from "@/components/EditableContent";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { EditableContentContextProvider, useEditableContentContext } from "@/context/EditableContentContext";
import StatefulAndPropfulBox from "@/components/TestComponents/StatefulAndPropfulBox";
import MultiLevelBox from "@/components/TestComponents/MultilLevelBox";
import UnderlineColor from "@/components/TestComponents/UnderlineColor";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import { Button } from "@mui/material";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import { Box } from "@mui/material";



export default function Page() {

  const [changeTextDialogIsOpen, setChangeTextDialogIsOpen] = useState<boolean>(false)
  const [changeTextDialogText, setChangeTextDialogText] = useState<string>("Blah blah blah");
  const [changeTextSelectionDirection, setChangeTextSelectionDirection] = useState<"none" | "forward" | "backward">("none")
  const [changeTextAnchorNode, setChangeTextAnchorNode] = useState<Node | null>(null);
  const [changeTextAnchorOffset, setChangeTextAnchorOffset] = useState<number | null>(null);
  const [changeTextFocusNode, setChangeTextFocusNode] = useState<Node | null>(null);
  const [changeTextFocusOffset, setChangeTextFocusOffset] = useState<number | null>(null);

  const [initialClicks, setInitialClicks] = useState(0);



  const [componentBorderColor, setComponentBorderColor] = useState("red");

  function increaseClicks() {
    setInitialClicks(initialClicks + 1);
  }


  return (
    <>
      <h1>Stateful and Propful Component Example</h1>
      <p>
        There are two values here which are passed as props to every StatefulAndPropfulBox that is rendered here. What I expect to happen is that changing these props at this level (which can be done with the buttons) will not affect existing instances of StatefulAndPropfulBox, but will change the startinng point for new instances which are created. Additionally, clicking on the StatefulAndPropfulBox itself should increase that component's clicks on its own.
      </p>
      <EditableContentContextProvider>
        <div>
          <IncreaseColorButton 
            componentBorderColor={componentBorderColor} 
            setComponentBorderColor={setComponentBorderColor} 
          />
          <Button onClick={increaseClicks}>
            Increase Clicks from {initialClicks}
          </Button>
        </div>
        <EditableContent
          initialHTML={`
            Normal Text 
            <div 
              id="portal-container-12345" 
              data-button-key="stateful-and-propful" 
            >
              Stateful and Propful Component
            </div>`
          }
          editTextButtons={[
            {
              isMUIButton: true,
              dataKey: "stateful-and-propful",
              child: "Stateful And Propful",
              isReactComponent: true,
              isStateful: true,
              component: <StatefulAndPropfulBox 
                initialClicks={initialClicks}
                borderC={componentBorderColor} 
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
      </EditableContentContextProvider>
    </>
  )
}



type IncreaseColorButtonProps = {
  componentBorderColor: string,
  setComponentBorderColor: Dispatch<SetStateAction<string>>
}


function IncreaseColorButton({componentBorderColor, setComponentBorderColor}: IncreaseColorButtonProps) {

  const { portals, updatePortalProps, contentRef } = useEditableContentContext();

  const colors = ["red", "blue", "green", "black"];

  useEffect(function() {
    console.log("useEffect");
    if (!contentRef.current) return;
    const divs = Array.from(contentRef.current.querySelectorAll("div[data-button-key='stateful-and-propful"));
    const keys = divs.map(div => div.getAttribute('id')?.split("portal-container-")[1]);
    keys.forEach(key => {
      if (key) updatePortalProps(key, {borderC: componentBorderColor});
    })
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