"use client"
import EditableContent from "./EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import { Button } from "@mui/material";
import { MUIButtonEditableContentButtonProps, HTMLButtonEditableContentButtonProps } from "@/components/ContentEditableExperimentComponents";


export default function PageClient() {


  return (
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
          console.log("selected");
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
  )
}