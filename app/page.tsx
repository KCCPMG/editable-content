import theme from "@/theme";
import EditableContent from "@/components/EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { FormatItalic } from "@mui/icons-material";
import EditTextButtonRow from "@/components/ContentEditableExperimentComponents/EditTextButtonRow";
import { Button } from "@mui/material";

export default function Home() {
  return (
    <main
      style={{
        width: 500,
        margin: "auto",
        marginTop: 100
      }}
    >
      <EditableContent 
        initialHTML="Plain Text<strong>Strong Text</strong>"
        editTextButtons={[
          {
            MUIButton: false, 
            dataKey: "bold",
            child: <FormatBoldIcon/>,
            wrapperArgs: {
              element: "strong"
            }

          },
          {
            MUIButton: true, 
            dataKey: "italics",
            child: <FormatItalic/>,
            wrapperArgs: {
              element: "i"
            }

          },
        ]}
      />
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
