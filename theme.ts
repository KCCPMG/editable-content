"use client";
import { createTheme } from "@mui/material";

export default createTheme({
  palette: {
    primary: {
      // main: "#1976d2",
      main: "#202A44",
      light: "#087ea4",
      dark: "#324268"
    },
    secondary: {
      main: "#324268",
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: 'var(--font-montserrat)',
          textTransform: 'none'
        }
      }
    }
  },
  typography:  {
    fontFamily: "Calibri"
  }
});