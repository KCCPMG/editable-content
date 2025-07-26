import { EditableContentContextType } from "@/context/EditableContentContext";
import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

type SampleReactButtonProp = {
  portalId?: string,
  children?: ReactNode,
  getContext?: () => EditableContentContextType,
  [key: string]: any
}


export default function SampleReactButton(
  {portalId, getContext, children, ...rest} : SampleReactButtonProp
) {
  return (
    <Box
      component="div"
      sx={{
        display: 'block',
        bgcolor: '#fff',
      }}
      {...rest}
    >
      <Box
        sx={{
          p: 1,
          m: 1,
          display: 'inline-block',
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
        }}
      >
        <Typography 
          fontFamily="var(--font-montserrat)" 
          color="primary.main"
          variant="h6"
        >
          {children}
        </Typography>
      </Box>
    </Box>
  )
}