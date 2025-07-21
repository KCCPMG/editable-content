import { Box, Menu, MenuItem} from "@mui/material";
import { useContextMenuContext } from "@/context/ContextMenuContext";
import { v4 as uuidv4 } from 'uuid';
import { Dispatch, SetStateAction } from "react";


type ContextMenuProps = {
  showMenu: boolean,
  setShowMenu: Dispatch<SetStateAction<boolean>>,
  menuX: number,
  menuY: number,
  additionalMenuItemProps: Array<React.ComponentProps<typeof MenuItem>>
}


export default function ContextMenu({
  showMenu, setShowMenu, menuX, menuY, additionalMenuItemProps
}: ContextMenuProps) {

  return (
    <Menu 
      open={showMenu}
      onClose={() => {setShowMenu(false)}}
      anchorReference="anchorPosition"
      anchorPosition={{
        top: menuY,
        left: menuX
      }}
    >
      {additionalMenuItemProps.map(item => {
        const {key=uuidv4(), ...rest} = item;

        return (
          <MenuItem key={key} {...rest} />
        )
      })}
    </Menu>
  )

}

