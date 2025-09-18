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
  // [key: string]: any,
  getContext?: () => EditableContentContextType,
}


export default function EditableLink({href, children, portalId, key, getContext, ...rest}: EditableLinkProps) {

  const menuContext = useContext(ContextMenuContext);
  const editableLinkDialogContext = useContext(EditableLinkDialogContext);

  return (
    <Link 
      href={href ? href : ""} 
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
      {...rest} 
    >
      {children}
    </Link>
  )
}