"use client"
import theme from "@/theme";
import EditableContent from "@/components/EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { useState } from "react";
import EditTextButtonRow from "@/components/ContentEditableExperimentComponents/EditTextButtonRow";
import { Box, Button } from "@mui/material";
import { MUIButtonEditableContentButtonProps, HTMLButtonEditableContentButtonProps } from "@/components/ContentEditableExperimentComponents";
import { getSelectionDirection } from "@/utils/utils";
import PageClient from "@/components/PageClient";
import PureReactDiv from "@/components/PureReactDiv";
import { EditableContentContextProvider } from "@/context/EditableContentContext"
import MultiLevelBox from "@/components/TestComponents/MultilLevelBox";
import UnderlineColor from "@/components/TestComponents/UnderlineColor";
import EditTextButton from "@/components/ContentEditableExperimentComponents/EditTextButton";
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";



export default function Home() {

  const [changeTextDialogIsOpen, setChangeTextDialogIsOpen] = useState<boolean>(false)
  const [changeTextDialogText, setChangeTextDialogText] = useState<string>("Blah blah blah");
  const [changeTextSelectionDirection, setChangeTextSelectionDirection] = useState<"none" | "forward" | "backward">("none")
  const [changeTextAnchorNode, setChangeTextAnchorNode] = useState<Node | null>(null);
  const [changeTextAnchorOffset, setChangeTextAnchorOffset] = useState<number | null>(null);
  const [changeTextFocusNode, setChangeTextFocusNode] = useState<Node | null>(null);
  const [changeTextFocusOffset, setChangeTextFocusOffset] = useState<number | null>(null);

  const [underlineColor, setUnderlineColor] = useState("red");

  return (
    <main
      style={{
        width: 900,
        margin: "auto",
        marginTop: 100
      }}
    >
    <h1>Texteditable Experiment</h1>
    <EditableContentContextProvider
      keyAndWrapperObjs={[
        {
          dataKey: "callback-sample",
          wrapper: <strong className="callback-sample" />
        },
        {
          dataKey: "bold",
          wrapper: <strong />
        },
        {
          dataKey: "italics",
          wrapper: <i />
        },
        {
          dataKey: "underlined",
          wrapper: <u 
            data-testAttribute="ta" 
            data-testAttribute2="ta2" 
            data-unbreakable=""
            onClick={(e) => {console.log("clicked")}} 
          />
        },
        {
          dataKey: "react-button",
          wrapper: <Box 
            component="div"
            sx={{
              display: 'inline',
              p: 1,
              m: 1,
              bgcolor: '#fff',
              color: 'grey.800',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: '700',
            }}
          /> 
        },
        {
          dataKey: "multilevel-component",
          wrapper: <MultiLevelBox />
        },
        {
          dataKey: "underline-color",
          wrapper: <UnderlineColor color={underlineColor} />
        }
      ]}
    >
      <div>
        <h3>Buttons</h3>
        <EditTextButton 
          dataKey="callback-sample"
          isMUIButton={true}
          selectCallback={() => {
            const selection = window.getSelection();
            if (!selection) return;
            const {anchorNode, anchorOffset, focusNode, focusOffset} = selection;
            setChangeTextSelectionDirection(getSelectionDirection(selection) || "none")
            setChangeTextDialogText(selection?.toString() || "")
            setChangeTextDialogIsOpen(true);
            setChangeTextAnchorNode(anchorNode);
            setChangeTextAnchorOffset(anchorOffset);
            setChangeTextFocusNode(focusNode);
            setChangeTextFocusOffset(focusOffset);
          }}
        >
          Callback Sample
        </EditTextButton>
        <EditTextButton 
          dataKey="bold"
          isMUIButton={true}
        >
          <FormatBoldIcon />
        </EditTextButton>
        <EditTextButton
          dataKey="italics"
          isMUIButton={true}
        >
          <FormatItalic/>
        </EditTextButton>
        <EditTextButton
          dataKey="underlined"
          isMUIButton={true}
        >
          <FormatUnderlined />
        </EditTextButton>
        <EditTextButton
          dataKey="react-button"
          isMUIButton={true}
        >
          React Button
        </EditTextButton>
        <EditTextButton
          dataKey="stateful-component"
          isMUIButton={true}
        >
          Stateful Component
        </EditTextButton>
        <EditTextButton
          dataKey="multilevel-component"
          isMUIButton={true}
        >
          Multilevel Component
        </EditTextButton>
        <EditTextButton
          dataKey="underline-color"
          isMUIButton={true}
        >
          Underline With Color
        </EditTextButton>
      </div>
      <EditableContent />
      {/* <PageClient /> */}
    </EditableContentContextProvider>
      {/* <PureReactDiv /> */}
      {/* <EditableContent>
        <EditTextButtonRow>
          <Button
            dataKey="bold"
            wrapperArgs={
              element: "strong"
            }
          
          >
            <FormatBoldIcon />
          </Button>
          <button>
            <FormatBoldIcon />
          </button>

        </EditTextButtonRow>
        <EditableDiv />
        <ControlTextButtonRow>

        </ControlTextButtonRow>
      </EditableContent> */}
    </main>
  );
}
