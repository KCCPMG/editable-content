import { AppBar, Toolbar, Typography } from "@mui/material";
import Image from "next/image";


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
        >
          Editable
        </Typography>
        <Image 
          alt="editable-content logo"
          src="/editable-content-logo.png"
          width={200}
          height={120}
        
        />
        <Typography 
          variant="h3" 
          component="div" 
          color="primary"
        >
          Content
        </Typography>
      </Toolbar>
    </AppBar>
  );
}