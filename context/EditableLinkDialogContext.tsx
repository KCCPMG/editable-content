import { useState, createContext, useContext, Dispatch, SetStateAction, useEffect, ReactElement } from "react";
import { useEditableContentContext } from "@kccpmg/editable-content";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { PORTAL_CONTAINER_ID_PREFIX, getAllTextNodes, getLastValidTextNode, getLastValidCharacterIndex } from "@kccpmg/editable-content/utils";
// import EditHrefDialog from "@/components/TestComponents/EditHrefDialog";

type EditLinkDialogContextProps = {
  children: React.ReactNode

}

export type EditableLinkDialogContextType = {
  // showDialog: boolean,
  // setShowDialog: Dispatch<SetStateAction<boolean>>,
  // showContextMenu: boolean, 
  // setShowContextMenu: Dispatch<SetStateAction<boolean>>,
  // portalId: string | undefined,

  populateAndShowContextMenu: () => void,
  depopulateAndHideContextMenu: () => void
  populateAndShowDialog: (linkPortalId: string | undefined) => void,
  depopulateAndCloseDialog: () => void,
  saveAndCloseDialog: () => void,
  href: string,
  setHref: Dispatch<SetStateAction<string>>,
  setPortalId: Dispatch<SetStateAction<string | undefined>>

  
}

export const EditableLinkDialogContext = createContext<EditableLinkDialogContextType | null>(null);



export function EditableLinkDialogContextProvider({children}: EditLinkDialogContextProps) {

  const { portals, updatePortalProps } = useEditableContentContext();

  const [portalId, setPortalId] = useState<string | undefined>(undefined);
  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [href, setHref] = useState<string>("")
  const [showDialog, setShowDialog] = useState<boolean>(false);

  // populate and show dialog
  useEffect(function() {
    if (portalId) {
      const foundPortal = portals.find(portal => portal.key === portalId);
      if (foundPortal) {
        setShowDialog(true);
        const children = foundPortal.children as ReactElement;
        if (children) {
          setHref(children.props?.href || "");
          return;
        }
      } 
    }
    setHref("");
    setShowDialog(false);
  }, [portalId, portals])


  function populateAndShowContextMenu() {

  }

  function depopulateAndHideContextMenu() {

  }

  function populateAndShowDialog(linkPortalId: string | undefined) {
    console.log(linkPortalId);
    if (linkPortalId) return;
    const foundPortal = portals.find(portal => portal.key === linkPortalId);
    console.log(foundPortal);
    if (!foundPortal) return;
    else {
      setShowDialog(true);
      setHref(foundPortal.props.children.href);
    }
  } 

  function depopulateAndCloseDialog() {
    setShowDialog(false);
    setHref("");
  }

  function saveAndCloseDialog() {
    updatePortalProps({[portalId || ""]: {
      href: href,
      test: "test prop"
    }});
    setHref("");
    setPortalId(undefined);
    setShowDialog(false);

    // get portal div, set selection to end of text
    const targetId = PORTAL_CONTAINER_ID_PREFIX + portalId;
    const containingDiv = document.querySelector(`#${targetId}`);

    console.log(targetId)

    console.log(containingDiv);

    if (containingDiv) {
      const textNodes = getAllTextNodes([containingDiv]);
      if (textNodes.length > 0) {
        const targetText = getLastValidTextNode(textNodes);
        const offset = getLastValidCharacterIndex(targetText);
        const selection = window.getSelection();
        if (selection) {
          selection.setBaseAndExtent(targetText, offset, targetText, offset);
        }
      }

    }

  }


  return (
    <EditableLinkDialogContext.Provider 
      value={{
        populateAndShowContextMenu,
        depopulateAndHideContextMenu,
        populateAndShowDialog,
        depopulateAndCloseDialog,
        href,
        setHref,
        saveAndCloseDialog,
        setPortalId
      }}
    >
      <EditHrefDialog showDialog={showDialog} />
      
      {children}
    </EditableLinkDialogContext.Provider>
  )

}


export function useEditableLinkDialogContext() {
  const context = useContext(EditableLinkDialogContext);

  if (!context) {
    throw new Error("useEditableLinkDialogContext must be in EditableContentContextProvider");
  }

  return context;

}


type EditHrefDialogProps = {
  showDialog: boolean
}

// make one version of this for selectCallback (current version below)
// make another version of this for clicking on link

function EditHrefDialog({showDialog}: EditHrefDialogProps) {

  const { portals } = useEditableContentContext();
  // const { portalId } = useEditableLinkDialogContext();
  const { href, setHref, depopulateAndCloseDialog, saveAndCloseDialog } = useEditableLinkDialogContext();

  // useEffect(function() {
  //   // if (!portalId) setPortalIsFound(false);
  //   // if (!portals) setPortalIsFound(false);
  //   if (portals.find(portal => portal.key === portalId)) {
  //     setPortalIsFound(true);
  //   }
  //   else setPortalIsFound(false);

  // }, [portals, portalId])


  return (
    <Dialog 
      open={showDialog} 
      fullWidth={true} 
      maxWidth={"sm"}
    >
      <DialogTitle>
        Set URL for Link
      </DialogTitle>
      <DialogContent sx={{padding: "18px"}}>
        <TextField 
          label="Set URL"
          fullWidth={true}
          variant="standard"
          // helperText="Set URL"
          value={href}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setHref(e.target.value)}
          }
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={depopulateAndCloseDialog}
        >
          Cancel
        </Button>
        <Button
          onClick={saveAndCloseDialog}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )

}