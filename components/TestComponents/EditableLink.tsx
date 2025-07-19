import { useEditableContentContext } from "@/context/EditableContentContext";
import { useEditableLinkDialogContext } from "@/context/EditableLinkDialogContext";
import { Container, Link, Box, Dialog, DialogTitle, Button, DialogActions, DialogContent, TextField } from "@mui/material";
import { Dispatch, MutableRefObject, ReactElement, SetStateAction, useEffect, useRef, useState} from "react";

type EditableLinkProps = {
  href?: string,
  children?: React.ReactNode,
  portalId?: string,
  // getContext: typeof useEditableContentContext,
  [key: string]: any
}


export default function EditableLink({href, children, portalId,  ...rest}: EditableLinkProps) {

  // const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const [showEditHrefDialog, setShowEditHrefDialog] = useState<boolean>(false);
  // const { portals, updatePortalProps } = getContext();

  const linkRef = useRef(null);


  useEffect(function() {
    (window as any).linkRef = linkRef;
  }, [linkRef])

  return (
    <Link 
      ref={linkRef}
      href={href ? href : ""} {...rest} 
      // onContextMenu={(e) => {
      //   e.preventDefault();
      //   console.log(e.pageX);
      //   setShowContextMenu(true)
      // }}

      // onContextMenu={(e) => { setPortalId(portalId) }}

      onContextMenu={(e) => {
        console.log("onContextMenu")
        e.preventDefault();
        setShowEditHrefDialog(true);
      }}
    
    
    >
      <EditableLinkEditHrefDialog
        show={showEditHrefDialog}
        setShow={setShowEditHrefDialog}
        portalId={portalId || ""}
      />
      {/* <CustomContextMenu show={showContextMenu} linkRef={linkRef}/> */}
      {children}
    </Link>
  )
}


type EditableLinkEditHrefDialogProps = {
  show: boolean,
  setShow: Dispatch<SetStateAction<boolean>>,
  portalId: string
}



function EditableLinkEditHrefDialog({show, setShow, portalId}: EditableLinkEditHrefDialogProps) {

  // const { portals, updatePortalProps } = useEditableContentContext();
  const [href, setHref] = useState<string>("");
  const [portalIsFound, setPortalIsFound] = useState<boolean>(false);


  // useEffect(function() {
  //   const foundPortal = portals.find(portal => portal.key === portalId);
  //   if (foundPortal) {
  //     const children = foundPortal.children as ReactElement;
  //     setPortalIsFound(true);
  //     if (children) {
  //       setHref(children.props?.href || "");
  //     }
  //   }
  //   else setPortalIsFound(false);

  // }, [portals, portalId])


  function cancelDialog() {
    setHref("");
    setShow(false);
  }

  function saveAndCloseDialog() {
    // updatePortalProps({[portalId]: {href: href}})
    setHref("");
    setShow(false);
  }


  return (
    <Dialog 
      open={show && portalIsFound} 
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