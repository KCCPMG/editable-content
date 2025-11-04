import type { Metadata } from "next";
import "./globals.css";
import theme from "@/theme";
import { Box, ThemeProvider, useMediaQuery } from "@mui/material";
import { Montserrat, Roboto } from 'next/font/google';
import SideBar from "@/components/LayoutComponents/SideBar";
import HeadBar from "@/components/LayoutComponents/HeadBar";
import { useState } from "react";
import ClientLayout from "@/components/LayoutComponents/ClientLayout";


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



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable}`}>
      <body>
        <ThemeProvider theme={theme}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
