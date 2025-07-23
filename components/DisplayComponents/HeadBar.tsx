import { AppBar, Toolbar, Typography } from "@mui/material";

type HeadBarProps = {
  heightInPixels: number
}


export default function HeadBar({heightInPixels}: HeadBarProps) {
  return (
    <AppBar 
      position="fixed"
      sx={{
        height: `${heightInPixels}px`
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div">
          My Fixed App Bar
        </Typography>
      </Toolbar>
    </AppBar>
  );
}