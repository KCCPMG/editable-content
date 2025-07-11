"use client"
import theme from "@/theme";
import EditableContent from "@/components/EditableContent";

import EditTextButtonRow from "@/components/ContentEditableExperimentComponents/EditTextButtonRow";
import { Button } from "@mui/material";
import { MUIButtonEditableContentButtonProps, HTMLButtonEditableContentButtonProps } from "@/components/ContentEditableExperimentComponents";
import PageClient from "@/components/PageClient";
import PureReactDiv from "@/components/PureReactDiv";
import { EditableContentContextProvider } from "@/context/EditableContentContext"



export default function Home() {
  return (
    <main
      style={{
        width: 900,
        margin: "auto",
        marginTop: 100
      }}
    >
    <h1>Texteditable Experiment</h1>
    <EditableContentContextProvider
      keyAndWrapperObjs={{
        key: "bold",
        wrapper: "strong"
      }}
    >
      <PageClient />
    </EditableContentContextProvider>
      {/* <PureReactDiv /> */}
      <EditableContent>
        <EditTextButtonRow>
          <Button
            dataKey="bold"
            wrapperArgs={
              element: "strong"
            }
          
          >
            <FormatBoldIcon />
          </Button>
          <button>
            <FormatBoldIcon />
          </button>

        </EditTextButtonRow>
        <EditableDiv />
        <ControlTextButtonRow>

        </ControlTextButtonRow>
      </EditableContent>
    </main>
  );
}
