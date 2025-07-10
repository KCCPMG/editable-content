import { EditableContentContextType, useEditableContentContext } from "@/context/EditableContentContext";
import { Box } from "@mui/material";
import { ReactNode } from "react";


type PropfulBoxProps = {
  portalId?: string, 
  clickCount: number,
  borderC: string,
  children?: ReactNode,
  getContext?: () => EditableContentContextType,
  [key: string]: any
}


export default function PropfulBox(
  {portalId, clickCount, borderC, children, getContext, ...rest}: PropfulBoxProps) 
{

  // const { updatePortalProps } = useEditableContentContext();
  const { updatePortalProps } = getContext ? getContext() : {};

  function increaseClicks() {
    // console.log(`clicked ${portalId}`)
    if (portalId && updatePortalProps) updatePortalProps({
      [portalId]:
        {
          clickCount: clickCount+1
        }
    })
  }

  return (
    <Box       
      sx={{
        display: 'block',
        p: 1,
        m: 1,
        bgcolor: '#fff',
        color: 'grey.800',
        border: '1px solid',
        borderColor: borderC,
        borderRadius: 2,
        fontSize: '0.875rem',
        fontWeight: '700',
      }} 
      onClick={increaseClicks} 
      {...rest}
    >
      {clickCount} {children}
    </Box>
  )

}