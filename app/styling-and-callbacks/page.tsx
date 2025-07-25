"use client"
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import { Box, Button, Typography } from "@mui/material";
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import MultiLevelBox from "@/components/TestComponents/MultilLevelBox";
import UnderlineColor from "@/components/TestComponents/UnderlineColor";
import EditableLink from "@/components/TestComponents/EditableLink"
import { useState } from "react";
import RenderedContent from "@/components/RenderedContent";
import { EditableLinkDialogContextProvider, useEditableLinkDialogContext } from "@/context/EditableLinkDialogContext";
import { ContextMenuContextProvider } from "@/context/ContextMenuContext";
import LinkEditTextButton from "@/components/TestComponents/LinkEditTextButton";
import EditableTextField from "@/components/TestComponents/EditableTextField";
import NextPageLink from "@/components/TestComponents/NextPageLink";


const initialHTML = `<div id="portal-container-040262ba-3545-4db7-a441-8fd975018686" data-button-key="editable-link" style="display: inline;">Sample Link</div>`.replaceAll(/\n */g, '');




export default function Page() {

  const [showHrefDialog, setShowHrefDialog] = useState<boolean>(false);
  const [href, setHref] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(true);
  const [portalIdForHrefDialog, setPortalIdForHrefDialog] = useState<string | undefined>(undefined);

  return (
    <>
      <ContextMenuContextProvider>
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
              wrapper: <UnderlineColor color="blue" />
            },
            {
              dataKey: "editable-link",
              wrapper: <EditableLink />
            }
          ]}
          initialHTML={initialHTML}
          initialProps={{
            "040262ba-3545-4db7-a441-8fd975018686": {
              "href": "https://www.google.com"
            }
          }}
        >
          <EditableLinkDialogContextProvider>
            <main
              style={{
                maxWidth: '1000px',
                margin: 'auto'
              }}
            >
              <Typography variant="h2">Styling and Callbacks</Typography>
              <p>
                The EditableContent component and the RenderedContent components can both be styled on their own or as parts of other components. The below component is actually an EditableContent that was given an appearance generally resembling a basic TextField. 
              </p>
              <p>
                As you can see, there is some text already populated in this field. Since this is an EditableContent component, clicking on the link will give you the ability to edit its text rather than taking you to the link. However, if you right click on the link, you will see that you have the ability to see the url, to open the url in a new tab, or to change the url. Try changing the URL to see this in action.
              </p>
              <p>
                Additionally, this field gives us the ability to create a new link. Try typing in some new text (outside of the existing link), and click the Link button. A dialogue should appear giving you the ability to say where this link should go. Additionally, just like with the sample link provided, you can right click on your new link to edit the url.
              </p>
              <LinkEditTextButton>
                Link
              </LinkEditTextButton>
              {editMode ? <EditableTextField /> : <RenderedContent />}
              <Button onClick={() => setEditMode(em => (!em))}>
                {editMode ? "Render Text" : "Edit Text"}
              </Button>
              <AllPropsDisplay show={false} />
            </main>
          </EditableLinkDialogContextProvider>
        </EditableContentContextProvider>
      </ContextMenuContextProvider>
      <NextPageLink href="/readme" text="README" />
    </>
  )

}