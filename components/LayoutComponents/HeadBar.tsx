import { AppBar, Box, IconButton, Toolbar, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import Image from "next/image";


type HeadBarProps = {
  heightInPixels: number,
  isMobile: boolean,
  showMenu: () => void
}


export default function HeadBar(
  { heightInPixels, isMobile, showMenu }: HeadBarProps
) {

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
      <Toolbar 
        sx={{
          height: `${heightInPixels}px`,
          alignItems: "start"
        }}
      >
        {
          isMobile &&
          <IconButton
            onClick={showMenu}
            edge="start"
            // size="large"
          >
            <MenuIcon />
          </IconButton>
        }
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
            variant={isMobile ? "h5" : "h3"}
            component="div"
            color="primary"
          >
            editable
          </Typography>
          <Image
            // natural proportions: 5x3
            alt="editable-content logo"
            src="/editable-content-logo.png"
            width={(heightInPixels * 20 / 7)}
            height={(heightInPixels * 12 / 7)}
          />
          <Typography
            variant={isMobile ? "h5" : "h3"}
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