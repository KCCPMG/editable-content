"use client"
import { AppBar, Toolbar, Typography } from "@mui/material";


type HeadBarProps = {
  heightInPixels: number
}


export default function HeadBar({heightInPixels}: HeadBarProps) {

  return (
    <AppBar 
      position="fixed"
      sx={{
        color: "primary.light",
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
          &lt;&nbsp;&nbsp;
        </Typography>
        <Typography 
          variant="h3" 
          component="div" 
          color="primary.light"
          sx={{mt: 2.8}}
        >
           * 
        </Typography>
        <Typography 
          variant="h3" 
          component="div" 
          color="primary.light"
          // sx={{margin: "auto"}}
        >
          &nbsp;/&gt;
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