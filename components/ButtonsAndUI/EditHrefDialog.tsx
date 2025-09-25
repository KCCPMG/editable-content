import { useEditableContentContext } from "@/packages/editable-content/src/EditableContentContext"
import { Dialog, DialogTitle, DialogActions, DialogContent, Button, TextField } from "@mui/material"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

type EditHrefDialogProps = {
  portalId?: string,
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>
  href: string,
  setHref: Dispatch<SetStateAction<string>>
}

export default function EditHrefDialog(
  {portalId, isOpen, setIsOpen, href, setHref}: EditHrefDialogProps) 
{
  const { portals, updatePortalProps } = useEditableContentContext();
  const [portalIsFound, setPortalIsFound] = useState<boolean>(false);
  const [currentHref, setCurrentHref] = useState<string>(href);


  // do not open until portal is found
  useEffect(function() {
    if (!portalId) setPortalIsFound(false);
    if (!portals) setPortalIsFound(false);
    if (portals.find(portal => portal.key === portalId)) {
      setPortalIsFound(true);
    }
    else setPortalIsFound(false);

  }, [portals, portalId])


  return (
    <Dialog 
      open={isOpen && portalIsFound} 
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
          value={currentHref}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCurrentHref(e.target.value)}
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={(e) => {
          setIsOpen(false)
        }}>
          Cancel
        </Button>
        <Button onClick={(e) => {
          if (portalId) {
            updatePortalProps({
              [portalId]: {href: currentHref}
            })
          }
          setHref(currentHref);
          setIsOpen(false);
        }}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}