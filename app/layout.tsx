import type { Metadata } from "next";
import "./globals.css";
import theme from "@/theme";
import { Box, ThemeProvider, useMediaQuery } from "@mui/material";
import { Montserrat, Roboto } from 'next/font/google';
import SideBar from "@/components/LayoutComponents/SideBar";
import HeadBar from "@/components/LayoutComponents/HeadBar";
import { useState } from "react";
import ClientLayout from "@/components/LayoutComponents/ClientLayout";
import { headers } from "next/headers";


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


const mobileOSs = [
  "android",
  "ios"
]

function getSystemInformation(userAgentStr: string) {
  const parentheticalOpening = userAgentStr.indexOf("(");
  if (parentheticalOpening === -1) return "";
  const parentheticalClosing = userAgentStr.indexOf(")", parentheticalOpening);
  if (parentheticalClosing === -1) return "";
  return userAgentStr.slice(parentheticalOpening, parentheticalClosing+1);
}

function timeFunctions(testString: string) {
  const getSystemInformationStartTime = performance.now();
  const getSIString = getSystemInformation(testString);
  const getSystemInformationEndTime = performance.now();
  
  const regExStartTime = performance.now();
  const reMatch = testString.match(/\(.*?\)/)
  const matchedPattern = reMatch ? reMatch[0] : "";
  const regExEndTime = performance.now();

  console.log(
    "getSystemInformation:", 
    getSIString,
    getSystemInformationEndTime-getSystemInformationStartTime,
    "\nregEx:", 
    matchedPattern,
    regExEndTime-regExStartTime
  );

}



export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const reqHeaders = headers();

  const userAgent = reqHeaders.get('user-agent');
  const systemInformation = userAgent ? getSystemInformation(userAgent).toLowerCase() : "";


  console.log(systemInformation);

  let assumeIsMobile = false;

  for (let mobileOS of mobileOSs) {
    if (systemInformation.indexOf(mobileOS) >= 0) {
      assumeIsMobile = true;
      break;
    }
  }

  // for (let pair of reqHeaders.entries()) {
  //   console.log(pair);
  // }

  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable}`}>
      <body>
        <ThemeProvider theme={theme}>
          <ClientLayout 
            assumeIsMobile={assumeIsMobile}
          >
            {children}
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
