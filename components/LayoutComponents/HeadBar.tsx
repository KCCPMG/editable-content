import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
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
        display: 'flex'
      }}
    >
      <Toolbar>
        <IconButton edge="start">
          <MenuIcon />
        </IconButton>
        <Box
          sx={{
            height: heightInPixels,
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
        <Typography 
          variant="h3" 
          component="div" 
          color="primary"
        >
          editable
        </Typography>
        <Image 
          // natural proportions: 5x3
          alt="editable-content logo"
          src="/editable-content-logo.png"
          width={(heightInPixels * 20 / 7 )}
          height={(heightInPixels * 12 / 7 )}
        />
        <Typography 
          variant="h3" 
          component="div" 
          color="primary"
        >
          content
        </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}