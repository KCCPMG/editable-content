import { EditableContentContextType, useEditableContentContext } from "@/packages/editable-content/src/EditableContentContext";
import { Box } from "@mui/material";
import { ReactNode, useRef, useEffect } from "react";
import { EXCLUDE_FROM_DEHYDRATED } from "@/packages/editable-content/src/utils/constants";


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

  const containerRef = useRef<HTMLDivElement | null>(null);

  const { updatePortalProps=undefined } = getContext ? getContext() : {};

  function increaseClicks() {
    if (portalId && updatePortalProps) updatePortalProps({
      [portalId]:
        {
          clickCount: clickCount+1
        }
    })
  }

  return (
    <Box    
      // ref={containerRef}   
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
      <span 
        {...{[EXCLUDE_FROM_DEHYDRATED]: ""}}
      >
        {clickCount}&nbsp;
      </span>
      {children}
    </Box>
  )

}