import type { Metadata } from "next";
import "./globals.css";
import theme from "@/theme";
import { Box, ThemeProvider } from "@mui/material";
import { Montserrat, Roboto } from 'next/font/google';
import SideBar from "@/components/LayoutComponents/SideBar";
import HeadBar from "@/components/LayoutComponents/HeadBar";
import addTwoNumbers from "test-package";



const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '700'], // Example weights
  variable: '--font-montserrat', // Optional CSS variable name
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-roboto',
});


export const metadata: Metadata = {
  title: "<EditableContent />",
  description: "Use React components in editable-content divs",
};

const sideBarWidthInPixels=200;
const headBarHeightInPixels=70;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  console.log("test-package test addTwoNumbers(1,2): ", addTwoNumbers(1,2));

  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable}`}>
      <body>
        <ThemeProvider theme={theme}>
          <HeadBar heightInPixels={headBarHeightInPixels} />
          <Box sx={{marginTop: `${headBarHeightInPixels}px`}}>
            <SideBar 
              widthInPixels={sideBarWidthInPixels} 
              headBarHeightInPixels={headBarHeightInPixels}
            />
            <Box 
              component="main"
              sx={{
                marginLeft: `${sideBarWidthInPixels}px`,
                marginTop: `${headBarHeightInPixels}px`,
                padding: "40px"
              }}
            >
              {children}
            </Box>
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
