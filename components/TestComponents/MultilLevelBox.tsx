import { useState, useEffect } from "react";
import { Box} from "@mui/material"


type MultiLevelBoxProps = {
  children?: React.ReactNode
}

export default function MultiLevelBox({children}: MultiLevelBoxProps) {

  return (
    <Box sx={{display: "inline"}}>
      <Box sx={{display: "block"}}>
        {children}
      </Box>
    </Box>
  )
}