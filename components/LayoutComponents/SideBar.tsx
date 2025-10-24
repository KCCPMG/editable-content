"use client"
import { Drawer, Link, List, ListItem } from "@mui/material";
import { useTheme } from "@mui/material";

type SideBarProps = {
  widthInPixels: number,
  headBarHeightInPixels: number,
}

export default function SideBar({widthInPixels, headBarHeightInPixels}: SideBarProps) {

  const theme = useTheme();

  return (
    <Drawer 
      variant="permanent"
      anchor="left"
      sx={{
        width: `${widthInPixels}px`,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          backgroundColor: theme.palette.primary.light,
          width: `${widthInPixels}px`,
          boxSizing: 'border-box',
          position: 'fixed',
          top: `${headBarHeightInPixels}px`,
          height: `calc(100% = ${headBarHeightInPixels}px`,
        }
      }}
    >
      <List>
        <LinkItem href="/" text="Main Demo" />
        <LinkItem href="/stateful-and-propful" text="Stateful and Propful Components"/>
        <LinkItem href="/propful-only" text="Propful Only Components"/>
        <LinkItem href="/styling-and-callbacks" text="Styling and Callbacks" />
        <LinkItem href="/documentation" text="Documentation" />
      </List>
    </Drawer>
  )
}


type LinkItemProps = {
  href: string,
  text: string,
}


function LinkItem({href, text}: LinkItemProps) {
  return (
    <ListItem>
      <Link 
        href={href}
        sx={{
          color: "white",
          textDecoration: "none",
          '&:hover': {
            fontWeight: 'bold'
          }
        }}
      >
        {text}
      </Link>
    </ListItem>
  )
}