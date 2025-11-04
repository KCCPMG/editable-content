"use client"

import { Box, useMediaQuery } from "@mui/material"
import HeadBar from "./HeadBar"
import SideBar from "./SideBar"
import theme from "@/theme";
import { useState } from "react";


const sideBarWidthInPixels=200;
// const headBarHeightInPixels=70;

export default function ClientLayout({children}: React.PropsWithChildren) {

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuIsShowing, setMenuIsShowing] = useState<boolean>(false);

  const showMenu = () => setMenuIsShowing(true);
  const hideMenu = () => setMenuIsShowing(false);

  console.log(theme.breakpoints.down('sm'));

  const headBarHeightInPixels= isMobile ? 35 : 70;

  return (
    <>
      <HeadBar 
        isMobile={isMobile} 
        showMenu={showMenu}
        heightInPixels={headBarHeightInPixels} 
      />
      <Box sx={{ marginTop: `${headBarHeightInPixels}px` }}>
        <SideBar
          widthInPixels={sideBarWidthInPixels}
          headBarHeightInPixels={headBarHeightInPixels}
          isMobile={isMobile}
          menuIsShowing={menuIsShowing}
          hideMenu={hideMenu}
        />
        <Box
          sx={{
            marginLeft: isMobile ? 0 : `${sideBarWidthInPixels}px`,
            marginTop: `${headBarHeightInPixels}px`,
            padding: 5
          }}
        >
          <Box
            component="main"
            sx={{
              maxWidth: '1000px',
              margin: 'auto',
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </>
  )
}


