"use client"
import { Box, useMediaQuery } from "@mui/material"
import HeadBar from "./HeadBar"
import SideBar from "./SideBar"
import theme from "@/theme";
import { useState, useLayoutEffect } from "react";


const sideBarWidthInPixels = 200;

type ClientLayoutProps = {
  assumeIsMobile?: boolean
} & React.PropsWithChildren;

export default function ClientLayout({ assumeIsMobile, children }: ClientLayoutProps) {

  const [isMobile, setIsMobile] = useState<boolean>(assumeIsMobile || false);
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuIsShowing, setMenuIsShowing] = useState<boolean>(false);

  const showMenu = () => setMenuIsShowing(true);
  const hideMenu = () => setMenuIsShowing(false);


  useLayoutEffect(() => {
    if (isSmall) setIsMobile(true);
    else setIsMobile(false);
  }, [isSmall])

  const headBarHeightInPixels = isMobile ? 35 : 70;

  return (
    <>
      <HeadBar
        isMobile={isMobile}
        showMenu={showMenu}
        heightInPixels={headBarHeightInPixels}
      />
      <Box
        sx={{
          display: "flex",
          width: "100%"
        }}
      >
        <SideBar
          widthInPixels={sideBarWidthInPixels}
          headBarHeightInPixels={headBarHeightInPixels}
          isMobile={isMobile}
          menuIsShowing={menuIsShowing}
          hideMenu={hideMenu}
        />
        <Box
          component="main"
          p={5}
          sx={{
            width: `calc(100% - ${isMobile ? 0 : sideBarWidthInPixels}px)`,
            boxSizing: "border-box",
            marginTop: `${headBarHeightInPixels}px`,
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  )
}


