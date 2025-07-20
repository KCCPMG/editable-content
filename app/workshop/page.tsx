"use client"
import DisplayContainer from "@/components/DisplayComponents/DisplayContainer";
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import { Box, Button, Container } from "@mui/material";
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import MultiLevelBox from "@/components/TestComponents/MultilLevelBox";
import UnderlineColor from "@/components/TestComponents/UnderlineColor";
import EditableLink from "@/components/TestComponents/EditableLink"
import EditableContent from "@/components/EditableContent";
import EditTextButton from "@/components/EditTextButton";
import FormatUnderlined from "@mui/icons-material/FormatUnderlined";
import { useState } from "react";
import RenderedContent from "@/components/RenderedContent";
import { EditableLinkDialogContextProvider, useEditableLinkDialogContext } from "@/context/EditableLinkDialogContext";
import { ContextMenuContextProvider } from "@/context/ContextMenuContext";
import LinkEditTextButton from "@/components/TestComponents/LinkEditTextButton";


const initialHTML = `Text text text`.replaceAll(/\n */g, '');




export default function Page() {

  const [showHrefDialog, setShowHrefDialog] = useState<boolean>(false);
  const [href, setHref] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(true);
  const [portalIdForHrefDialog, setPortalIdForHrefDialog] = useState<string | undefined>(undefined);

  return (
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
      >
        <EditableLinkDialogContextProvider>
          {/* <EditHrefDialog 
            isOpen={showHrefDialog} 
            setIsOpen={setShowHrefDialog}
            href={href}
            setHref={setHref}
            portalId={portalIdForHrefDialog}
          /> */}
          <Container>
            <LinkEditTextButton>
              Link
            </LinkEditTextButton>
            <EditTextButton
              dataKey="underlined"
              isMUIButton={true}
            >
              <FormatUnderlined />
            </EditTextButton>
            {editMode ? <EditableContent /> : <RenderedContent />}
            <Button onClick={() => setEditMode(em => (!em))}>
              {editMode ? "Render Text" : "Edit Text"}
            </Button>
            <DisplayContainer showInitial={false} title="Test" />
            <AllPropsDisplay show={false} />
            <DisplayContainer showInitial={false} title="Test" />
          </Container>
        </EditableLinkDialogContextProvider>
      </EditableContentContextProvider>
    </ContextMenuContextProvider>
  )

}