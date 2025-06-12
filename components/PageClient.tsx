"use client"
import EditableContent from "./EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import { ReactNode, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { getSelectionDirection } from "@/utils/utils";
import { createPortal } from "react-dom";


export default function PageClient() {


  const [changeTextDialogIsOpen, setChangeTextDialogIsOpen] = useState<boolean>(false)
  const [changeTextDialogText, setChangeTextDialogText] = useState<string>("Blah blah blah");
  const [changeTextSelectionDirection, setChangeTextSelectionDirection] = useState<"none" | "forward" | "backward">("none")
  const [changeTextAnchorNode, setChangeTextAnchorNode] = useState<Node | null>(null);
  const [changeTextAnchorOffset, setChangeTextAnchorOffset] = useState<number | null>(null);
  const [changeTextFocusNode, setChangeTextFocusNode] = useState<Node | null>(null);
  const [changeTextFocusOffset, setChangeTextFocusOffset] = useState<number | null>(null);



  return (
    <>  
      <Dialog
        open={changeTextDialogIsOpen}
        onClose={() => {setChangeTextDialogIsOpen(false)}}
        // disableRestoreFocus
      >
        <DialogTitle>Test Dialog</DialogTitle>
        <DialogContent>
          Change the selected text!
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
      <h3>
        <SampleWrapper>
          Sample Wrapper text
        </SampleWrapper>
      </h3>
      <EditableContent 
        // initialHTML="Plain Text<strong>Strong Text</strong>"
        initialHTML='<strong>ahgosdjgodga</strong> ​adsfasdg ​sdg ​dsg ​<i>asgd;a ​sg<strong>asgasdga ​ ​ ​<br>asdg</strong> ​a</i>sdg ​af ​nsdf ​adg ​fdo;jvflbz/xbnb ​ ​askbznbagnnslsnlnslz ​ ​ ​<br>asj<u testattribute="ta" testattribute2="ta2" unbreakable="">dglasgnd</u>iagvaisghoesnfa ​dga ​ ​g ​napgnnasdng ​asdg ​ ​<br>askgnasgnasg ​ahadha<strong>sfgsafhasagdg<i>asdgsdgaa</i>sdgsadgasd</strong>gsag ​a ​sdg ​<strong>a ​gasdg<i> ​</i>asgd ​​</strong>'
        editTextButtons={[
          {
            isMUIButton: true,
            dataKey: "callback-samble",
            child: "CB",
            wrapperInstructions: {
              element: "strong"
            },
            selectCallback: () => {
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
            }
          },
          {
            isMUIButton: true, 
            dataKey: "bold",
            child: <FormatBoldIcon/>,
            // variant: "contained",
            wrapperInstructions: {
              element: "strong"
            }
            // deselectedVariant: "",
            // selectedVariant: "outlined"

          },
          {
            isMUIButton: true, 
            dataKey: "italics",
            child: <FormatItalic/>,
            // variant: "contained",
            wrapperInstructions: {
              element: "i"
            },
            // selectedVariant: "contained",
            // deselectedVariant: "outlined"
          },
          {
            isMUIButton: true, 
            dataKey: "underlined",
            child: <FormatUnderlined/>,
            // variant: "contained",
            wrapperInstructions: {
              element: "u",
              attributes: {
                testAttribute: "ta",
                testAttribute2: "ta2",
              },
              eventListeners: {
                click: function() {
                  console.log("clicked");
                }
              },
              unbreakable: true
            }
          },
          {
            isMUIButton: true,
            dataKey: "react-button",
            child: "RB",
            contentPortal: true, 
            wrapperInstructions: {
              element: "div",
              classList: ["test-div"]
              // unbreakable: true
            },
            selectCallback: function(wrapper: HTMLElement) {
              const selection = window.getSelection();
              if (!selection) return;
              const {anchorNode, anchorOffset, focusNode, focusOffset} = selection;
              console.log(wrapper);
              console.log(document.querySelector("div.test-div"));
              const portal = createPortal(
                (
                  <SampleWrapper>
                    New SampleWrapper Text
                  </SampleWrapper>
                ), document.body
              );
              console.log(portal);
            }
          }
        ]}
      />
    </>
  )
}


function SampleWrapper({children}: {children: ReactNode}) {
  return (
    <span
      className="sample-wrapper"
      onClick={(e) => console.log("clicked")}
    >
      {children}
    </span>
  )
}