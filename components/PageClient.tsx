"use client"
import EditableContent from "./EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";


export default function PageClient() {


  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>(false)
  const [dialogText, setDialogText] = useState<string>("Blah blah blah")


  return (
    <>  
      <Dialog
        open={dialogIsOpen}
        onClose={() => {setDialogIsOpen(false)}}
        // disableRestoreFocus
      >
        <DialogTitle>Test Dialog</DialogTitle>
        <DialogContent>
          <TextField
            // autoFocus
            value={dialogText}
            onChange={(e) => {setDialogText(e.target.value)}}
          />
        </DialogContent>
        <DialogActions>
          <Button
            // onClick={(e) => {

            // }}
          >
            Change Text
          </Button>
        </DialogActions>

      </Dialog>
      <EditableContent 
        // initialHTML="Plain Text<strong>Strong Text</strong>"
        initialHTML='<strong>ahgosdjgodga</strong> ​adsfasdg ​sdg ​dsg ​<i>asgd;a ​sg<strong>asgasdga ​ ​ ​<br>asdg</strong> ​a</i>sdg ​af ​nsdf ​adg ​fdo;jvflbz/xbnb ​ ​askbznbagnnslsnlnslz ​ ​ ​<br>asj<u testattribute="ta" testattribute2="ta2" unbreakable="">dglasgnd</u>iagvaisghoesnfa ​dga ​ ​g ​napgnnasdng ​asdg ​ ​<br>askgnasgnasg ​ahadha<strong>sfgsafhasagdg<i>asdgsdgaa</i>sdgsadgasd</strong>gsag ​a ​sdg ​<strong>a ​gasdg<i> ​</i>asgd ​<br>​</strong>'
        editTextButtons={[
        {
          isMUIButton: true, 
          dataKey: "bold",
          child: <FormatBoldIcon/>,
          // variant: "contained",
          wrapperArgs: {
            element: "strong"
          },
          selectCallback: () => {
            setDialogText(window.getSelection()?.toString() || "")
            setDialogIsOpen(true);
          }
          // deselectedVariant: "",
          // selectedVariant: "outlined"

        },
        {
          isMUIButton: true, 
          dataKey: "italics",
          child: <FormatItalic/>,
          // variant: "contained",
          wrapperArgs: {
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
          wrapperArgs: {
            element: "u",
            attributes: {
              testAttribute: "ta",
              testAttribute2: "ta2"
            },
            unbreakable: true
          },
          
        },
        ]}
      />
    </>
  )
}