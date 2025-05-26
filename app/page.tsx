import theme from "@/theme";
import EditableContent from "@/components/EditableContent";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
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
        // initialHTML="Plain Text<strong>Strong Text</strong>"
        // initialHTML="a"
        editTextButtons={[
          {
            isMUIButton: true, 
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
            // selectedVariant: "contained",
            // deselectedVariant: "outlined"
          },
          {
            isMUIButton: true, 
            dataKey: "underlined",
            child: <FormatUnderlined/>,
            // variant: "contained",
            wrapperArgs: {
              element: "u",
              attributes: {
                testAttribute: "ta",
                testAttribute2: "ta2"
              },
              unbreakable: true
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
