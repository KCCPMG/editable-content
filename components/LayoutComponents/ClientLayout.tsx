"use client"

import { Box, useMediaQuery } from "@mui/material"
import HeadBar from "./HeadBar"
import SideBar from "./SideBar"
import theme from "@/theme";
import { useState, useEffect, useLayoutEffect, useRef } from "react";


const sideBarWidthInPixels=200;
// const headBarHeightInPixels=70;

export default function ClientLayout({children}: React.PropsWithChildren) {

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [menuIsShowing, setMenuIsShowing] = useState<boolean>(false);

  const showMenu = () => setMenuIsShowing(true);
  const hideMenu = () => setMenuIsShowing(false);

  // console.log(window.innerWidth, window.innerWidth <=599.95 );
  // console.log("theme.breakpoints.down('sm')", theme.breakpoints.down('sm'));

  // console.log("isMobile, prior to useEffect", isMobile)

  // useEffect(() => {
  //   console.log("inside useEffect", window.innerWidth, window.innerWidth <= 599.95);
  //   console.log("isMobile, inside useEffect", isMobile)
  // }, [isMobile])

  // useLayoutEffect(() => {
  //   console.log("inside useLayoutEffect", window.innerWidth, window.innerWidth <= 599.95);
  //   console.log("isMobile, inside useLayoutEffect", isMobile)
  // }, [isMobile])


  const safeToUseMediaQueryRef = useRef<boolean>(false);
  const initialIsMobileRef = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!safeToUseMediaQueryRef.current) {
      console.log("not safeToUseMediaQueryRef");
      if (typeof window != 'undefined') {
        console.log("window is not undefined")
        initialIsMobileRef.current = window.innerWidth <= 599.95;
        console.log("initialIsMobileRef.current", initialIsMobileRef.current);
        if (initialIsMobileRef.current === isMobile) {
          safeToUseMediaQueryRef.current = true;
        }
      } 
      else console.log("window is undefined")
    } 
    else console.log("safeToUseMediaQueryRef")
  }, [isMobile])


  const safeIsMobile = safeToUseMediaQueryRef.current ? 
    isMobile : 
    initialIsMobileRef.current;

  console.log({safeIsMobile});

  const headBarHeightInPixels = isMobile ? 35 : 70;

  return (
    <>
      <HeadBar 
        isMobile={safeIsMobile} 
        showMenu={showMenu}
        heightInPixels={headBarHeightInPixels} 
      />
      <Box sx={{ marginTop: `${headBarHeightInPixels}px` }}>
        <SideBar
          widthInPixels={sideBarWidthInPixels}
          headBarHeightInPixels={headBarHeightInPixels}
          isMobile={safeIsMobile}
          menuIsShowing={menuIsShowing}
          hideMenu={hideMenu}
        />
        <Box
          sx={{
            marginLeft: safeIsMobile ? 0 : `${sideBarWidthInPixels}px`,
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


