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
          backgroundColor: theme.palette.primary.dark,
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
          <LinkItem href="/stateful-and-propful" text="Statefeul and Propful Components"/>
          <LinkItem href="/propful-only" text="Propful Only Components"/>
          <LinkItem href="/readme" text="README" />
        {/* <ListItem>
          <Link 
            href="/stateful-and-propful"
            sx={{
              color: "white",
              display: 'inline-block', // Or 'inline-block' if needed
              width: '100%',
              whiteSpace: 'normal', // Force wrapping
              overflowWrap: 'break-word' // For breaking long words
            }}
          >
            Stateful and Propful Components
          </Link>
        </ListItem> */}

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
          textDecorationColor: "white"
        }}
      >
        {text}
      </Link>
    </ListItem>
  )
}