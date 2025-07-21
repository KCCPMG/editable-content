import { Box, Menu, MenuItem} from "@mui/material";
import { useContextMenuContext } from "@/context/ContextMenuContext";
import { v4 as uuidv4 } from 'uuid';


type ContextMenuProps = {
  showMenu: boolean,
  menuX: number,
  menuY: number,
  additionalMenuItemProps: Array<React.ComponentProps<typeof MenuItem>>
}


export default function ContextMenu({
  showMenu, menuX, menuY, additionalMenuItemProps
}: ContextMenuProps) {

  return (
    <Box sx={{
      left: menuX,
      top: menuY
    }}>
      <Menu open={showMenu}>
        {additionalMenuItemProps.map(item => {
          return (
            <MenuItem key={uuidv4()} {...item} />
          )
        })}
      </Menu>
    </Box>
  )

}

