"use client"
import EditableContent from "@/components/EditableContent";
import { useState } from "react";
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

  const colors = ["red", "blue", "green", "black"];
  const [initialClicks, setInitialClicks] = useState(0);

  const [componentBorderColor, setComponentBorderColor] = useState("red");

  function rotateColor() {
    let index = colors.findIndex(c => c === componentBorderColor);
    index++;
    setComponentBorderColor(colors[index % colors.length])
  }

  function increaseClicks() {
    setInitialClicks(initialClicks + 1);
  }


  return (
    <>
      <h1>Stateful and Propful Component Example</h1>
      <p>
        There are two values here which are passed as props to every StatefulAndPropfulBox that is rendered here. What I expect to happen is that changing these props at this level (which can be done with the buttons) will not affect existing instances of StatefulAndPropfulBox, but will change the startinng point for new instances which are created. Additionally, clicking on the StatefulAndPropfulBox itself should increase that component's clicks on its own.
      </p>
      <div>
        <Button onClick={rotateColor}>
          Rotate Color from {componentBorderColor}
        </Button>
        <Button onClick={increaseClicks}>
          Increase Clicks from {initialClicks}
        </Button>
      </div>
      <EditableContentContextProvider>
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
              wrapperInstructions: <StatefulAndPropfulBox 
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
              wrapperInstructions: <StatefulBox />
            },
          ]}
        />

      </EditableContentContextProvider>
    </>
  )
}