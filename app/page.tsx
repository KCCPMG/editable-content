import SlateInput from "@/components/SlateInput";
import SlateCustomElements from "@/components/SlateCustomElements";
import SlateCustomFormatting from "@/components/SlateCustomFormatting";
import EditableDiv from "@/components/EditableDiv";
import ReactDynamicTextarea from "@/components/ReactDynamicTextarea";
import MuiRte from "@/components/MuiRte";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import theme from "@/theme";
import { ReactEditableDiv } from "@/components/ReactEditableDiv";

export default function Home() {
  return (
    <main
      style={{
        width: 500,
        margin: "auto",
        marginTop: 100
      }}
    >
      {/* <SlateInput /> */}
      {/* <SlateCustomElements /> */}
      {/* <SlateCustomFormatting /> */}
      {/* <EditableDiv /> */}
      {/* <ReactDynamicTextarea /> */}
      <ReactEditableDiv initialContent="hello" />
      <ThemeProvider theme={theme}>
        {/* <MuiRte /> */}
      </ThemeProvider>
    </main>
  );
}
