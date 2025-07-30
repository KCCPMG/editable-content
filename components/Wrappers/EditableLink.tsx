import { ContextMenuContext } from "@/context/ContextMenuContext";
import { EditableContentContextType } from "@/context/EditableContentContext";
import { EditableLinkDialogContext } from "@/context/EditableLinkDialogContext";
import { Link, Box } from "@mui/material";
import { MutableRefObject, useEffect, useState, useContext } from "react";



type EditableLinkProps = {
  href?: string,
  children?: React.ReactNode,
  portalId?: string,
  key?: string,
  [key: string]: any,
  getContext?: () => EditableContentContextType,
}


export default function EditableLink({href, children, portalId, key, getContext, ...rest}: EditableLinkProps) {

  const menuContext = useContext(ContextMenuContext);
  const editableLinkDialogContext = useContext(EditableLinkDialogContext);

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
                editableLinkDialogContext?.setPortalId(portalId);
                menuContext.depopulateAndHideContextMenu();
              }
            }
          ]);
        }
      }}
    >
      {children}
    </Link>
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