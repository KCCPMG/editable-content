import theme from "@/theme";
import EditableContent from "@/components/EditableContent";

import EditTextButtonRow from "@/components/ContentEditableExperimentComponents/EditTextButtonRow";
import { Button } from "@mui/material";
import { MUIButtonEditableContentButtonProps, HTMLButtonEditableContentButtonProps } from "@/components/ContentEditableExperimentComponents";
import PageClient from "@/components/PageClient";
import PureReactDiv from "@/components/PureReactDiv";



export default function Home() {
  return (
    <main
      style={{
        width: 500,
        margin: "auto",
        marginTop: 100
      }}
    >
      <PageClient />
      <PureReactDiv />
      {/* <EditableContent>
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
      </EditableContent> */}
    </main>
  );
}
