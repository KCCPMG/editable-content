import { useState, useEffect } from "react";
import { Box} from "@mui/material"
import { EditableContentContextType } from "@/context/EditableContentContext";


type StatefulBoxProps = {
  children?: React.ReactNode,
  reportState?: (stateObj: {[key: string]: any} ) => void,
  mustReportState?: boolean,
  portalId?: string,
  getContext?: () => EditableContentContextType
  [key: string]: any,
}


export default function StatefulBox(
  {children, reportState, mustReportState, portalId, getContext, ...rest}: StatefulBoxProps) 
{
  const [clicks, setClicks] = useState<number>(0);

  useEffect(() => {
    if (reportState) reportState({clicks});
    console.log("clicks: ", clicks);
  }, [clicks])

  useEffect(() => {
    if (mustReportState && reportState) reportState({clicks})
  }, [mustReportState])

  return (
    <Box>
      <Box
        // onFocus={()=>{console.log("focus on SC")}}
        // onBlur={()=>{console.log("focus out SC")}}
        onClick={()=>{
          console.log("click SC")
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