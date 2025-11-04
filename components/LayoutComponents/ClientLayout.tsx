"use client"

import { Box, useMediaQuery } from "@mui/material"
import HeadBar from "./HeadBar"
import SideBar from "./SideBar"
import theme from "@/theme";
import { useState } from "react";


const sideBarWidthInPixels=200;
const headBarHeightInPixels=70;

export default function ClientLayout({children}: React.PropsWithChildren) {

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  const hideMobileMenu = () => setShowMobileMenu(false);

  console.log(theme.breakpoints.down('sm'));

  return (
    <>
      <HeadBar heightInPixels={headBarHeightInPixels} />
      <Box sx={{ marginTop: `${headBarHeightInPixels}px` }}>
        <SideBar
          widthInPixels={sideBarWidthInPixels}
          headBarHeightInPixels={headBarHeightInPixels}
          isMobile={isMobile}
          showMobileMenu={showMobileMenu}
          hideMobileMenu={hideMobileMenu}
        />
        <Box
          sx={{
            marginLeft: `${sideBarWidthInPixels}px`,
            marginTop: `${headBarHeightInPixels}px`,
            padding: "40px"
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


