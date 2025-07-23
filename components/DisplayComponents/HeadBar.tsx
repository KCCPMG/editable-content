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
        <Typography variant="h3" component="div" sx={{marginLeft: "auto"}}>
          E&lt;?&gt;C
        </Typography>
      </Toolbar>
    </AppBar>
  );
}