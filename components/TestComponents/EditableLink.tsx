import { ContextMenuContext, ContextMenuContextType, useContextMenuContext } from "@/context/ContextMenuContext";
import { EditableContentContextType, useEditableContentContext } from "@/context/EditableContentContext";
import { useEditableLinkDialogContext } from "@/context/EditableLinkDialogContext";
import { Container, Link, Box, Dialog, DialogTitle, Button, DialogActions, DialogContent, TextField } from "@mui/material";
import { Dispatch, MutableRefObject, ReactElement, SetStateAction, useEffect, useRef, useState, useContext } from "react";

type PortalProps = {
  [key: string]: {[key: string]: any}
}


type EditableLinkProps = {
  href?: string,
  children?: React.ReactNode,
  portalId?: string,
  key?: string,
  [key: string]: any,
  getContext?: () => EditableContentContextType,
  // updatePortalProps?: (updateObj: PortalProps) => void
}


export default function EditableLink({href, children, portalId, key, getContext, ...rest}: EditableLinkProps) {

  const [showEditHrefDialog, setShowEditHrefDialog] = useState<boolean>(false);
  const { updatePortalProps=undefined } = getContext ? getContext() : {};

  const menuContext = useContext(ContextMenuContext);


  return (
    <Link 
      href={href ? href : ""} {...rest} 
      onContextMenu={(e) => {
        if (menuContext) {
          e.preventDefault();
          menuContext.populateContextMenu(e.clientX, e.clientY, [
            {
              key: "option-1",
              children: `Open ${href} in new tab`,
              onClick: (e) => {
                window.open(href);
                menuContext.depopulateAndHideContextMenu();
              }
            },
            {
              key: "option-2",
              children: "Change URL",
              onClick: (e) => {
                setShowEditHrefDialog(true);
                menuContext.depopulateAndHideContextMenu();
              }
            }
          ]);
        }
      }}
    >
      <EditableLinkEditHrefDialog
        show={showEditHrefDialog}
        setShow={setShowEditHrefDialog}
        hrefIn={href}
        portalId={portalId || ""}
        updatePortalProps={updatePortalProps}
      />
      {children}
    </Link>
  )
}


type EditableLinkEditHrefDialogProps = {
  show: boolean,
  setShow: Dispatch<SetStateAction<boolean>>,
  hrefIn?: string,
  portalId: string,
  updatePortalProps?: (updateObj: PortalProps) => void
}



function EditableLinkEditHrefDialog({show, setShow, hrefIn, portalId, updatePortalProps}: EditableLinkEditHrefDialogProps) {

  const [href, setHref] = useState<string>("");
  const [portalIsFound, setPortalIsFound] = useState<boolean>(false);

  useEffect(function() {
    if (show) setHref(hrefIn || "");
  }, [show])


  function cancelDialog() {
    setHref("");
    setShow(false);
  }

  function saveAndCloseDialog() {
    console.log(updatePortalProps)
    if (updatePortalProps){
      updatePortalProps({[portalId]: {href: href}})
      setHref("");
      setShow(false);
    }
  }

  return (
    <Dialog 
      open={show} 
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
          value={href}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setHref(e.target.value)
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={cancelDialog}
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





type CustomContextMenuProps = {
  show: boolean,
  linkRef: MutableRefObject<HTMLAnchorElement | null>
}


export function CustomContextMenu({show, linkRef}: CustomContextMenuProps) {

  const [xPos, setXPos] = useState<number>(0);
  const [yPos, setYPos] = useState<number>(0);

  useEffect(function() {
    if (!linkRef.current) return;
    console.log(linkRef.current?.getBoundingClientRect());
    const {x, width, y, height} = linkRef.current?.getBoundingClientRect();
    setXPos(x + width);
    setYPos(y + height);

  }, [show])


  if (show) {
    return (
      <Box
        sx={{
          position: "fixed",
          left: xPos,
          top: yPos,
          border: "1px solid black",
          borderRadius: "5px",
          padding: "10px"
        }}
      >
        Test Text which is editable due to being child of contentRef
      </Box> 
    )
  }
  else return null;
}