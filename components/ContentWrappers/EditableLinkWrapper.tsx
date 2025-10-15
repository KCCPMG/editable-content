import { useState } from "react";
import { ContextMenuContextProvider } from "@/context/ContextMenuContext";
import { EditableLinkDialogContextProvider } from "@/context/EditableLinkDialogContext";
import { EditableContentContextProvider } from "@/packages/editable-content/src";
import { Button } from "@mui/material";
import LinkEditTextButton from "../ButtonsAndUI/LinkEditTextButton";
import AllPropsDisplay from "../DisplayComponents/AllPropsDisplay";
import EditableLink from "../Wrappers/EditableLink";
import EditableTextField from "./EditableTextField";


type EditableLinkWrapperProps = {
  initialHTML?: string,
}

export default function EditableLinkWrapper({initialHTML}: EditableLinkWrapperProps) {

  const [editMode, setEditMode] = useState<boolean>(true);


  return (
    <ContextMenuContextProvider>
      <EditableContentContextProvider
        keyAndWrapperObjs={[
          {
            dataKey: "editable-link",
            wrapper: <EditableLink />
          }
        ]}
        initialHTML={initialHTML}
      >
        <EditableLinkDialogContextProvider>
          <LinkEditTextButton>
            Link
          </LinkEditTextButton>
          <EditableTextField editMode={editMode} />
          <Button onClick={() => setEditMode(em => (!em))}>
            {editMode ? "Render Text" : "Edit Text"}
          </Button>
          <AllPropsDisplay show={false} />
        </EditableLinkDialogContextProvider>
      </EditableContentContextProvider>
    </ContextMenuContextProvider>
  )
}