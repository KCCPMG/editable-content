import { Dialog, DialogTitle, DialogActions, DialogContent, Button, TextField } from "@mui/material"
import { Dispatch, SetStateAction, useState } from "react"

type EditHrefDialogProps = {
  isOpen: boolean,
  setIsOpen: Dispatch<SetStateAction<boolean>>
  href: string,
  setHref: Dispatch<SetStateAction<string>>
}

export default function EditHrefDialog(
  {isOpen, setIsOpen, href, setHref}: EditHrefDialogProps) 
{

  const [currentHref, setCurrentHref] = useState<string>(href);

  return (
    <Dialog open={isOpen}>
      <DialogTitle>
        Set URL for Link
      </DialogTitle>
      <DialogContent>
        <TextField 
          label="Set URL"
          helperText="Set URL"
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
          setHref(currentHref);
          setIsOpen(false);
        }}>Save</Button>
      </DialogActions>
    </Dialog>
  )
}