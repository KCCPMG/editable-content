import { useState, ReactNode } from "react"
import { Box } from "@mui/material";

type StatefulAndPropfulBoxProps = {
  initialClicks: number,
  borderC: string,
  children?: ReactNode,
  [key: string]: any
}

export default function StatefulAndPropfulBox(
  {initialClicks, borderC, children, ...rest}: StatefulAndPropfulBoxProps) 
{

  const [clickCount, setClickCount] = useState(initialClicks);

  function increaseClicks() {
    setClickCount(clickCount + 1);
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