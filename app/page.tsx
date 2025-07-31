"use client"
import theme from "@/theme";
import EditableContent from "@/components/EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { useState, useEffect } from "react";
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Container, Typography, Paper } from "@mui/material";
import { getSelectionDirection, wrapInElement, selectionIsDescendentOfNode, generateQuery, selectionIsCoveredBy, createWrapper, unwrapSelectionFromQuery, resetSelectionToTextNodes, selectionHasTextNodes, getSelectionChildNodes, selectionContainsOnlyText, getButtonStatus, getRangeLowestAncestorElement, promoteChildrenOfNode, deleteEmptyElements, setSelection, moveSelection, getRangeChildNodes, getAncestorNode } from "@/utils/utils";
import { EditableContentContextProvider } from "@/context/EditableContentContext"
import MultiLevelBox from "@/components/Wrappers/MultilLevelBox";
import UnderlineColor from "@/components/Wrappers/UnderlineColor";
import EditTextButton from "@/components/EditTextButton";
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import StatefulBox from "@/components/Wrappers/StatefulBox";
import GetDehydratedHTMLButton from "@/components/ButtonsAndUI/GetDehydratedHTMLButton";
import ClearButton from "@/components/ButtonsAndUI/ClearButton";
import { renderToString } from "react-dom/server";
import RenderedContent from "@/components/RenderedContent";
import ContentRefCurrentInnerHTMLDisplay from "@/components/DisplayComponents/ContentRefCurrentInnerHTMLDisplay";
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import SelectionDisplay from "@/components/DisplayComponents/SelectionDisplay";
import Link from "next/link";
import NextPageLink from "@/components/LayoutComponents/NextPageLink";
import SampleReactButtonProp from "@/components/Wrappers/SampleReactButton";
import SampleReactButton from "@/components/Wrappers/SampleReactButton";
import DehydratedHTMLDisplay from "@/components/DisplayComponents/DehydratedHTMLDisplay";
import ButtonAndContentContainer from "@/components/ContentWrappers/ButtonAndContentContainer";
import RenderedContentContainer from "@/components/ContentWrappers/RenderedContentContainer";


const initialHTML = `​Welcome ​to <strong class=\"bold-standard\" data-bk=\"bold\"><i class=\"italics-standard\" data-bk=\"italics\"><u class=\"underlined-standard\" data-bk=\"underlined\">editable-content!</u></i></strong>\​ ​This tool is designed to give developers the ability to create rich-text editors which include <div id=\"portal-container-f40524bc-5e43-46ed-b9c2-7ae6585f5c34\" data-button-key=\"react-button\" style=\"display: inline;\">​React Components</div> ​as elements.<br>​​<br>​As a demo, please feel free to play around with the editable div below. As you can see, there are two types of buttons: ​<strong class=\"bold-standard\" data-bk=\"bold\">Standard ​Wrappers</strong>&nbsp;and <strong data-bk=\"bold-unbreakable\" data-unbreakable=\"\">Unbreakable ​Components.</strong><br>​<br><strong class=\"bold-standard\" data-bk=\"bold\">Standard ​Wrappers</strong> ​work ​as ​you ​would ​normally&nbsp;expect from a word processor- when text is selected and the button is clicked, the selected text will take on that text decoration. Click the button again, and the selected text will lose that given text decoration. Text can have multiple standard wrappers at work, such as text which is in italics and in bold while inside of other text which is bold. When the cursor is in just one space, clicking the button will make future text from the cursor have that decoration, or lose that decoration if the button was already clicked.<br>​​<br>​<strong data-bk=\"bold-unbreakable\" data-unbreakable=\"\">Unbreakable ​Components</strong>&nbsp;are different: Unlike Standard Wrappers, no other decoration can “nest” within an Unbreakable Component, and an Unbreakable Component cannot be inside of any other decoration. Additionally, ​<u data-bk=\"underlined-unbreakable\" data-unbreakable=\"\">unbreakable components cannot be “split”,</u>&nbsp; ​​and so <div id=\"portal-container-8441e5d6-e708-40cb-baaf-8037688b06b1\" data-button-key=\"react-button\" style=\"display: inline;\">clicking the Wrapper Component's​ ​button ​again will cause the entire component to disappear, ​leaving ​only ​the ​text ​behind. ​(try ​it ​here!)</div>The one exception to this is if the cursor is placed at the end of the text inside the Unbreakable Component, in which case the cursor will move out of the Unbreakable Component's text and back into plain text. ​<strong data-bk=\"bold-unbreakable\" data-unbreakable=\"\">All ​React ​Components ​are ​unbreakable.</strong>​<br>`


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
  useEffect(function () {
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
        maxWidth: '1000px',
        margin: 'auto'
      }}
    >
      <Typography variant="h2">Editable-Content</Typography>
      <p>
        Welcome to the <strong>Editable-Content</strong> demo! This tool is designed to give developers the ability to create rich-text editors which include React Components as elements.
      </p>
      <p>
        As a demo, please feel free to play around with the editable text container below. It should work like a normal rich text field, but with one key distinction: there are two types of styling buttons: <strong>Standard Wrappers</strong> and <strong>Unbreakable Components.</strong>
      </p>
      <p>
        <strong>Standard Wrappers</strong> work as you would normally expect from a word processor; when text is selected and the button is clicked, the selected text will take on that text style. Click the button again, and the selected text will lose that given text decoration. Text can have multiple standard wrappers at work, such as text which is in italics and in bold while inside of other text which is bold. When the cursor is in just one space, clicking the button will make future text from the cursor have that decoration, or lose that style if the button was already clicked.
      </p>
      <p>
        <strong>Unbreakable Components</strong> are different: Unlike Standard Wrappers, <strong>no other style can &ldquo;nest&rdquo; within an Unbreakable Component, and an Unbreakable Component cannot be inside of any other decoration.</strong> From a user standpoint, this means two things:
      </p>
        <ul>
          <li>
            Unbreakable Components cannot be &ldquo;split&rdquo;, and so clicking the Unbreakable Component&apos;s button again will cause the entire component to disappear, leaving only the text behind, unless...
          </li>
          <li>
            The cursor is placed at the end of the text inside the Unbreakable Component, in which case the cursor will move out of the Unbreakable Component&apos;s text and back into plain text. 
          </li>
        </ul> 
      <p>
        <strong>All React Components are unbreakable.</strong>
      </p>
      <p>
        Lastly, take a look at some of what&apos;s below the editable text container. There&apos;s a <strong>&ldquo;Clear&rdquo; button</strong> to clear the contents, as well as a <strong>&ldquo;Render Text&rdquo; button</strong> you can click. The Clear button will reset the content of the editable text container, and the Render Text button will make the content no longer editable. This means that a user can go back and forth between Editable Text and a Rendered (and non-editable) version of what they&apos;ve written. If you want to take a look at some of the state changes going on under the hood, take a look at some of the accordion menus underneath, which should give you an idea as to how as a developer, you can save and rehydrate user-created React data. When you're all done, click the <strong>NEXT</strong> button to head to the next example.
      </p>
      <EditableContentContextProvider
        keyAndWrapperObjs={[
          {
            dataKey: "callback-sample",
            wrapper: <strong className="callback-sample" />
          },
          {
            dataKey: "bold",
            wrapper: <strong className="bold-standard" />
          },
          {
            dataKey: "italics",
            wrapper: <i className="italics-standard" />
          },
          {
            dataKey: "underlined",
            wrapper: <u className="underlined-standard" />
          },
          {
            dataKey: "bold-unbreakable",
            wrapper: <strong data-unbreakable="" />
          },
          {
            dataKey: "italics-unbreakable",
            wrapper: <i data-unbreakable="" />
          },
          {
            dataKey: "underlined-unbreakable",
            wrapper: <u data-unbreakable="" />
          },
          {
            dataKey: "react-button",
            wrapper: <SampleReactButton />
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
          onClose={() => { setChangeTextDialogIsOpen(false) }}
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
              onChange={(e) => { setChangeTextDialogText(e.target.value) }}
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
        {
          // editMode &&
          // <>
          //   <Typography variant="h4">Buttons</Typography>
          //   <Box 
          //     sx={{ 
          //       display: "flex",
          //       flexDirection: "row",
          //       gap: "4",
          //       alignItems: "flex-start",
          //       flexWrap: "wrap",
          //       justifyContent: "left"
          //     }} 
          //   >
          //     {/* <Box
          //       sx={{
          //         width: 'fit-content',
          //         display: 'flex',
          //         flexDirection: 'column',
          //         alignItems: 'flex-start',
          //         gap: 1,
          //       }}
          //     >
          //       <h4>Standard Wrappers</h4>
          //       <Box>
          //         <EditTextButton
          //           dataKey="bold"
          //           isMUIButton={true}
          //         >
          //           <FormatBoldIcon />
          //         </EditTextButton>
          //         <EditTextButton
          //           dataKey="italics"
          //           isMUIButton={true}
          //         >
          //           <FormatItalic />
          //         </EditTextButton>
          //         <EditTextButton
          //           dataKey="underlined"
          //           isMUIButton={true}
          //         >
          //           <FormatUnderlined />
          //         </EditTextButton>
          //       </Box>
          //     </Box> */}
            
          //     <Box 
          //       sx={{
          //         width: 'fit-content',
          //         display: 'flex',
          //         flexDirection: 'column',
          //         alignItems: 'flex-start',
          //         gap: 1,
          //         boxShadow: "none",
          //       }}
          //     >
          //       <h4>Unbreakable Components</h4>
          //       <Box>
          //         {/* <EditTextButton 
          //           dataKey="bold-unbreakable"
          //           isMUIButton={true}
          //         >
          //           <FormatBoldIcon />
          //         </EditTextButton>

          //         <EditTextButton
          //           dataKey="italics-unbreakable"
          //           isMUIButton={true}
          //         >
          //           <FormatItalic />
          //         </EditTextButton>
          //         <EditTextButton
          //           dataKey="underlined-unbreakable"
          //           isMUIButton={true}
          //         >
          //           <FormatUnderlined />
          //         </EditTextButton> */}
          //         {/* <EditTextButton
          //           dataKey="react-button"
          //           isMUIButton={true}
          //         >
          //           React Button
          //         </EditTextButton> */}
          //         {/* <EditTextButton
          //           dataKey="react-button"
          //           isMUIButton={true}
          //         >
          //           Sample React Component
          //         </EditTextButton> */}
          //         {/* <EditTextButton
          //           dataKey="multilevel-component"
          //           isMUIButton={true}
          //         >
          //           Multilevel Component
          //         </EditTextButton>
          //         <EditTextButton
          //           dataKey="underline-color"
          //           isMUIButton={true}
          //         >
          //           Underline With Color
          //         </EditTextButton> */}
          //       </Box>
          //     </Box>
          //   </Box>
          // </>
        }
        {
          editMode ?
            <ButtonAndContentContainer 
              setEditMode={setEditMode}
            /> :
            // <EditableContent className="default-editable-content"/> :
            // <RenderedContent 
            //   className="default-rendered-content" 
            // />
            <RenderedContentContainer 
              setEditMode={setEditMode}
            />
        }

        {
          // editMode &&
          // <>
          //   {/* <GetDehydratedHTMLButton /> */}
          //   <ClearButton />
          // </>
        }
        {/* {!editMode &&
          <Button variant="outlined" onClick={() => setEditMode(true)}>
            Edit Text
          </Button>
        } */}
        <SelectionDisplay show={false} />
        <DehydratedHTMLDisplay show={false} />
        {/* <ContentRefCurrentInnerHTMLDisplay show={false} /> */}
        <AllPropsDisplay show={false} />
      </EditableContentContextProvider>
      <NextPageLink href="/stateful-and-propful" />
    </main>
  );
}
