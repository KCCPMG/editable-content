import { useState, useEffect } from "react";
import { Box} from "@mui/material"


type StatefulBoxProps = {
  children?: React.ReactNode
}

export default function StatefulBox({children}: StatefulBoxProps) {
  const [clicks, setClicks] = useState<number>(0);

  useEffect(() => {
    console.log("clicks: ", clicks);
  }, [clicks])

  return (
    <Box
      onFocus={()=>{console.log("focus on SC")}}
      onBlur={()=>{console.log("focus out SC")}}
      onClick={()=>{
        console.log("click SC")
        setClicks(clicks + 1);
      }}
      tabIndex={-1}
      data-unbreakable=""
      component="div"
      sx={{
        display: 'block',
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
    >
      {children}
    </Box>
  )
}
