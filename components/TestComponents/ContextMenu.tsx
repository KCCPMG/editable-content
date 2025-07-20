import { Box, Menu, MenuItem} from "@mui/material";
import { useContextMenuContext } from "@/context/ContextMenuContext";



export default function ContextMenu() {

  const {        
    showMenu,
    menuX,
    menuY,
    additionalMenuItems
  } = useContextMenuContext();

  return (
    <Box sx={{
      left: menuX,
      top: menuY
    }}>
      <Menu open={showMenu}>
        {additionalMenuItems}
      </Menu>
    </Box>
  )

}

