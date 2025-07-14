"use client"
import theme from "@/theme";
import EditableContent from "@/components/EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { useState, useEffect } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Container } from "@mui/material";
import { getSelectionDirection, wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes, getAncestorNode } from "@/utils/utils";
import { EditableContentContextProvider } from "@/context/EditableContentContext"
import MultiLevelBox from "@/components/TestComponents/MultilLevelBox";
import UnderlineColor from "@/components/TestComponents/UnderlineColor";
import EditTextButton from "@/components/EditTextButton";
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import GetDehydratedHTMLButton from "@/components/TestComponents/GetDehydratedHTMLButton";
import ClearButton from "@/components/TestComponents/ClearButton";
import SelectionToStringContainer from "@/components/TestComponents/SelectionToStringContainer";
import ContentRefCurrentInnerHTMLContainer from "@/components/TestComponents/ContentRefCurrentInnerHTMLContainer";
import { renderToString } from "react-dom/server";
import RenderedContent from "@/components/RenderedContent";

const initialHTML = `
<strong>Lorem, ipsum</strong>
  ​dolor ​sit ​ 
  ​<i>amet  ​cons
  <strong>
    ectetur adipisicing ​ ​ ​
    <br>
    elit.
  </strong> ​Sunt,
</i>
repudiandae. ​Lorem, ipsum ​dolor ​sit ​amet ​ ​consectetur ​ ​ ​
<br>
adipisicing
<u testattribute="ta" testattribute2="ta2" data-unbreakable="">
  elit.
</u>
Sunt, ​re
<div 
  id="portal-container-2bf69a61-17c5-498f-ad4c-ba9a2b01132d" 
  data-button-key="react-button" 
  style="display: inline;"
>
    pud
      iand
    a
  e. ​ ​Lorem
</div>
, ​ipsum ​dolor ​ ​
<br>
sit amet
<strong>
  consectetur
  <i>
    adipisicing
  </i>
  elit.
</strong>
  Sunt,  ​repudiandae. ​Lorem, ​
​<div id="portal-container-f56a36a4-00b7-42c8-9d92-e14691b2ee1a" data-button-key="react-button" style="display: inline;">
  ipsum ​dolorsit
</div>`.replaceAll(/\n */g, '');



export default function Page() {

  const [changeTextDialogIsOpen, setChangeTextDialogIsOpen] = useState<boolean>(false)
  const [changeTextDialogText, setChangeTextDialogText] = useState<string>("Blah blah blah");
  const [changeTextSelectionDirection, setChangeTextSelectionDirection] = useState<"none" | "forward" | "backward">("none")
  const [changeTextAnchorNode, setChangeTextAnchorNode] = useState<Node | null>(null);
  const [changeTextAnchorOffset, setChangeTextAnchorOffset] = useState<number | null>(null);
  const [changeTextFocusNode, setChangeTextFocusNode] = useState<Node | null>(null);
  const [changeTextFocusOffset, setChangeTextFocusOffset] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<boolean>(true)

  const [underlineColor, setUnderlineColor] = useState("red");

  
  // utilities in window
  useEffect(function() {
    window.wrapInElement = wrapInElement;
    window.selectionIsDescendentOfNode = selectionIsDescendentOfNode;
    window.generateQuery = generateQuery;
    window.selectionIsCoveredBy = selectionIsCoveredBy;
    window.createWrapper = createWrapper;
    window.unwrapSelectionFromQuery = unwrapSelectionFromQuery;
    window.resetSelectionToTextNodes = resetSelectionToTextNodes;
    window.selectionHasTextNodes = selectionHasTextNodes;
    window.getSelectionChildNodes = getSelectionChildNodes;
    window.selectionContainsOnlyText = selectionContainsOnlyText;
    window.getButtonStatus = getButtonStatus;
    window.getRangeLowestAncestorElement = getRangeLowestAncestorElement;
    window.promoteChildrenOfNode = promoteChildrenOfNode;
    window.deleteEmptyElements = deleteEmptyElements;
    window.setSelection = setSelection;
    window.moveSelection = moveSelection;
    window.getRangeChildNodes = getRangeChildNodes;
    window.limitingContainer = document.querySelector("[contenteditable]")
    window.getAncestorNode = getAncestorNode;
    window.initialHTML = initialHTML;
    window.renderToString = renderToString
  }, [])

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
            wrapper: <strong></strong>
          },
          {
            dataKey: "italics",
            wrapper: <i />
          },
          {
            dataKey: "underlined",
            wrapper: <u 
              data-test-attribute="ta" 
              data-test-attribute2="ta2" 
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
            dataKey: "stateful-component",
            wrapper: <StatefulBox />
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
        initialHTML={initialHTML}
      >
        <Dialog
          open={changeTextDialogIsOpen}
          onClose={() => {setChangeTextDialogIsOpen(false)}}
          // disableRestoreFocus
        >
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogContent>
            <Container>
              Change the selected text!
            </Container>
            <TextField
              // autoFocus
              value={changeTextDialogText}
              onChange={(e) => {setChangeTextDialogText(e.target.value)}}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={(e) => {
                setChangeTextDialogIsOpen(false);
                const selectionUpdateRange = new Range();

                if (!changeTextAnchorNode || !changeTextFocusNode) return;
                if (changeTextAnchorOffset === null || changeTextFocusOffset === null) return;

                if (changeTextSelectionDirection === "backward") {
                  selectionUpdateRange.setEnd(changeTextAnchorNode, changeTextAnchorOffset);
                  selectionUpdateRange.setStart(changeTextFocusNode, changeTextFocusOffset);
                } else {
                  selectionUpdateRange.setStart(changeTextAnchorNode, changeTextAnchorOffset);
                  selectionUpdateRange.setEnd(changeTextFocusNode, changeTextFocusOffset);
                }

                selectionUpdateRange.extractContents();
                const newTextNode = document.createTextNode(changeTextDialogText);
                selectionUpdateRange.insertNode(newTextNode);

                const selection = window.getSelection();
                selection?.removeAllRanges();
                selection?.addRange(selectionUpdateRange);
              }}
            >
              Change Text
            </Button>
          </DialogActions>

        </Dialog>
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
            deselectCallback={() => {
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
        {
          editMode ? 
            <EditableContent 
              // initialHTML={initialHTML}
              divStyle={{
                width: "100%",
                height: "250px",
                margin: "auto",
                border: "2px solid black",
                overflowY: "scroll"
              }}
            /> :
            null 
            // <RenderedContent 
            //   // initialHTML={initialHTML}
            //   divStyle={{
            //     width: "100%",
            //     height: "250px",
            //     margin: "auto",
            //     border: "2px solid black",
            //     overflowY: "scroll"
            //   }}
            // />
        }

        <GetDehydratedHTMLButton />
        <ClearButton />
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Render Text" : "Edit Text"}
        </Button>
        <SelectionToStringContainer />
        <ContentRefCurrentInnerHTMLContainer />

      </EditableContentContextProvider>
    </main>
  );
}
