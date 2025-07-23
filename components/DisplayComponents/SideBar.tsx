import { Drawer, Link, List, ListItem } from "@mui/material"

type SideBarProps = {
  widthInPixels: number,
  headBarHeightInPixels: number,
}

export default function SideBar({widthInPixels, headBarHeightInPixels}: SideBarProps) {
  return (
    <Drawer 
      variant="permanent"
      anchor="left"
      sx={{
        paddingTop: `${headBarHeightInPixels}px`,
        width: `${widthInPixels}px`,
        height: "100vh",
        position: "absolute"
      }}
    >
      <List>
        <ListItem>
          <Link 
            href="/"
            sx={{
              display: 'block', // Or 'inline-block' if needed
              width: '100%',
              whiteSpace: 'normal', // Force wrapping
              overflowWrap: 'break-word' // For breaking long words
            }}
          >
            Home
          </Link>
        </ListItem>
        <ListItem>
          <Link 
            href="/stateful-and-propful"
            sx={{
              display: 'inline-block', // Or 'inline-block' if needed
              width: '100%',
              whiteSpace: 'normal', // Force wrapping
              overflowWrap: 'break-word' // For breaking long words
            }}
          >
            Stateful and Propful Components
          </Link>
        </ListItem>
        <ListItem>
          <Link href="/propful-only">Propful Only Components</Link>
        </ListItem>
      </List>
    </Drawer>
  )
}