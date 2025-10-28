import { useState, useEffect } from "react";
import { Box} from "@mui/material"
import { EditableContentContextType } from "@/packages/editable-content/src/EditableContentContext";


type StatefulBoxProps = {
  children?: React.ReactNode,
  portalId?: string,
  getContext?: () => EditableContentContextType
  [key: string]: any,
}


export default function StatefulBox(
  {children, portalId, getContext, ...rest}: StatefulBoxProps) 
{
  const [clicks, setClicks] = useState<number>(0);

  const { 
    updateContent,
    setContentRefCurrentInnerHTML,
    contentRef
  } = getContext ? getContext() : {};

  useEffect(() => {
    // if (updateContent) updateContent();
    if (setContentRefCurrentInnerHTML && contentRef?.current) {
      setContentRefCurrentInnerHTML(contentRef.current.innerHTML);
    }
  },[clicks])

  return (
    <Box>
      <Box
        // onFocus={()=>{console.log("focus on SC")}}
        // onBlur={()=>{console.log("focus out SC")}}
        onClick={()=>{
          setClicks(clicks + 1);
        }}
        tabIndex={-1}
        component="div"
        sx={{
          display: 'inline-block',
          p: 1,
          m: 1,
          bgcolor: '#fff',
          color: 'grey.800',
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
          fontSize: '0.875rem',
          fontWeight: '700',
        }}
        {...rest}
      >
        {clicks} {children}
      </Box>
    </Box>
  )
}