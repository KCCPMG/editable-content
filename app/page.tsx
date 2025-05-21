import theme from "@/theme";
import EditableContent from "@/components/EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { FormatItalic } from "@mui/icons-material";
import EditTextButtonRow from "@/components/ContentEditableExperimentComponents/EditTextButtonRow";
import { Button } from "@mui/material";
import { MUIButtonEditableContentButtonProps, HTMLButtonEditableContentButtonProps } from "@/components/ContentEditableExperimentComponents";



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
            isMUIButton: false, 
            dataKey: "bold",
            child: <FormatBoldIcon/>,
            // variant: "contained",
            wrapperArgs: {
              element: "strong"
            },
            // deselectedVariant: "",
            // selectedVariant: "outlined"

          },
          {
            isMUIButton: true, 
            dataKey: "italics",
            child: <FormatItalic/>,
            // variant: "contained",
            wrapperArgs: {
              element: "i"
            },
            selectedVariant: "contained",
            deselectedVariant: "outlined"
          },
          {
            isMUIButton: true, 
            dataKey: "italics",
            child: <FormatItalic/>,
            // variant: "contained",
            wrapperArgs: {
              element: "i"
            },
            
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
