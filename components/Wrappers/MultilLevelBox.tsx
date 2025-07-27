import { useState, useEffect } from "react";
import { Box} from "@mui/material"


type MultiLevelBoxProps = {
  children?: React.ReactNode,
  [key: string]: any
}

export default function MultiLevelBox({children, ...rest}: MultiLevelBoxProps) {

  return (
    <Box sx={{display: "inline"}} {...rest} >
      <Box sx={{display: "block"}}>
        {children}
      </Box>
    </Box>
  )
}