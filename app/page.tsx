import SlateInput from "@/components/SlateInput";
import SlateCustomElements from "@/components/SlateCustomElements";
import SlateCustomFormatting from "@/components/SlateCustomFormatting";
import EditableDiv from "@/components/EditableDiv";
import ReactDynamicTextarea from "@/components/ReactDynamicTextarea";
import theme from "@/theme";
import { ReactEditableDiv } from "@/components/ReactEditableDiv";
import EditableContent from "@/components/EditableContent";

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
      {/* <ReactEditableDiv initialContent="Hello" /> */}
      <EditableContent 
        initialHTML="<strong>Test <i>Test</i> Test</strong>"
        editTextButtons={[]}
      />
    </main>
  );
}
