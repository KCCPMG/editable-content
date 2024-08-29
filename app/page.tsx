import SlateInput from "@/components/SlateInput";
import SlateCustomElements from "@/components/SlateCustomElements";
import SlateCustomFormatting from "@/components/SlateCustomFormatting";
import EditableDiv from "@/components/EditableDiv";
import ReactDynamicTextarea from "@/components/ReactDynamicTextarea";
import MuiRte from "@/components/MuiRte";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import theme from "@/theme";

export default function Home() {
  return (
    <main>
      {/* <SlateInput /> */}
      {/* <SlateCustomElements /> */}
      {/* <SlateCustomFormatting /> */}
      <EditableDiv />
      {/* <ReactDynamicTextarea /> */}
      <ThemeProvider theme={theme}>
        {/* <MuiRte /> */}
      </ThemeProvider>
    </main>
  );
}
