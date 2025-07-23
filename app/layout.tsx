import type { Metadata } from "next";
import "./globals.css";
import theme from "@/theme";
import { Box, ThemeProvider } from "@mui/material";
import { Montserrat, Roboto } from 'next/font/google';
import SideBar from "@/components/DisplayComponents/SideBar";
import HeadBar from "@/components/DisplayComponents/HeadBar";



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
const headBarHeightInPixels=100;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable}`}>
      <body>
        <ThemeProvider theme={theme}>
          <HeadBar heightInPixels={headBarHeightInPixels} />
          <SideBar 
            widthInPixels={sideBarWidthInPixels} 
            headBarHeightInPixels={headBarHeightInPixels}
          />
          <Box 
            component="main"
            sx={{
              marginLeft: `${sideBarWidthInPixels}px`,
              marginTop: `${headBarHeightInPixels}px`
            }}
          >
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  );
}
