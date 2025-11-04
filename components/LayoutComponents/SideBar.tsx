"use client"
import { Drawer, Link, List, ListItem, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';

type SideBarProps = {
  widthInPixels: number,
  headBarHeightInPixels: number,
  isMobile: boolean,
  menuIsShowing: boolean,
  hideMenu: () => void
}

export default function SideBar(
  { widthInPixels, headBarHeightInPixels, isMobile, menuIsShowing, hideMenu }: SideBarProps
) {

  const theme = useTheme();

  useEffect(() => {
    console.log(isMobile);
  }, [isMobile])

  return (
    <>
      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={!isMobile || menuIsShowing}
        onClose={hideMenu}
        anchor="left"
        transitionDuration={500}
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
          <LinkItem href="/stateful-and-propful" text="Stateful and Propful Components" />
          <LinkItem href="/propful-only" text="Propful Only Components" />
          <LinkItem href="/styling-and-callbacks" text="Styling and Callbacks" />
          <LinkItem href="/documentation" text="Documentation" />
        </List>
      </Drawer>
    </>
  )
}


type LinkItemProps = {
  href: string,
  text: string,
}


function LinkItem({ href, text }: LinkItemProps) {
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