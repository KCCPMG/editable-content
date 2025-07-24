"use client"
import { AppBar, Toolbar, Typography, useTheme } from "@mui/material";


type HeadBarProps = {
  heightInPixels: number
}


export default function HeadBar({heightInPixels}: HeadBarProps) {

  const theme = useTheme();

  return (
    <AppBar 
      position="fixed"
      sx={{
        color: theme.palette.primary.light,
        // bgcolor: 'secondary',
        bgcolor: "white",
        height: `${heightInPixels}px`,
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Toolbar>
        <Typography 
          variant="h3" 
          component="div" 
          color="primary"
          // sx={{margin: "auto"}}
        >
          Editable&nbsp;
        </Typography>
        <Typography 
          variant="h3" 
          component="div" 
          color="primary.light"
          // sx={{margin: "auto"}}
        >
          &lt; * /&gt;
        </Typography>
        <Typography 
          variant="h3" 
          component="div" 
          color="primary"
          // sx={{margin: "auto"}}
        >
           &nbsp;Content
        </Typography>
      </Toolbar>
    </AppBar>
  );
}