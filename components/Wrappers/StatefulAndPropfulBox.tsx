import { useState, ReactNode, useEffect } from "react"
import { Box } from "@mui/material";
import { EditableContentContextType } from "@/packages/editable-content/src";

type StatefulAndPropfulBoxProps = {
  portalId?: string,
  getContext?: () => EditableContentContextType
  initialClicks: number,
  borderC: string,
  children?: ReactNode,
  [key: string]: any
}

export default function StatefulAndPropfulBox(
  {portalId, getContext, initialClicks, borderC, children, ...rest}: StatefulAndPropfulBoxProps) 
{

  const [clickCount, setClickCount] = useState(initialClicks);

  function increaseClicks() {
    setClickCount(clickCount + 1);
  }

  const { 
    setContentRefCurrentInnerHTML,
    contentRef
  } = getContext ? getContext() : {};

  useEffect(() => {
    if (setContentRefCurrentInnerHTML && contentRef?.current) {
      setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
    }
  },[clickCount] )

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