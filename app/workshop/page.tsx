"use client"
import { Box } from "@mui/material";
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import StatefulBox from "@/components/Wrappers/StatefulBox";
import MultiLevelBox from "@/components/Wrappers/MultilLevelBox";
import UnderlineColor from "@/components/Wrappers/UnderlineColor";
import EditableLink from "@/components/Wrappers/EditableLink"
import { useState } from "react";
import { ContextMenuContextProvider } from "@/context/ContextMenuContext";
import ButtonAndContentContainer from "@/components/ContentWrappers/ButtonAndContentContainer";


const initialHTML = `Text <div id="portal-container-040262ba-3545-4db7-a441-8fd975018686" data-button-key="editable-link" style="display: inline;">text</div> text`.replaceAll(/\n */g, '');




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
        initialProps={{
          "040262ba-3545-4db7-a441-8fd975018686": {
            "href": "https://www.google.com"
          }
        }}
      >
        <ButtonAndContentContainer />
      </EditableContentContextProvider>
    </ContextMenuContextProvider>
  )

}