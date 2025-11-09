import type { Metadata } from "next";
import "./globals.css";
import theme from "@/theme";
import { ThemeProvider } from "@mui/material";
import { Montserrat, Roboto } from 'next/font/google';
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


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  const reqHeaders = headers();

  const userAgent = reqHeaders.get('user-agent');
  const systemInformation = userAgent ? getSystemInformation(userAgent).toLowerCase() : "";

  let assumeIsMobile = false;

  for (let mobileOS of mobileOSs) {
    if (systemInformation.indexOf(mobileOS) >= 0) {
      assumeIsMobile = true;
      break;
    }
  }

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
