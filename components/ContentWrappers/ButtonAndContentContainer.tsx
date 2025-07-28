import { Box } from "@mui/material";
import EditableContent from "../EditableContent";
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import EditTextButton from "../EditTextButton";


export default function ButtonAndContentContainer() {
  return (
    <Box>
      <Box 
        sx={{ 
          display: "flex",
          flexDirection: "row",
          gap: "4",
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "left"
        }} 
      >
        <Box
          sx={{
            width: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1,
          }}
        >
          <h4>Standard Wrappers</h4>
          <Box>
            <EditTextButton
              dataKey="bold"
              isMUIButton={true}
            >
              <FormatBoldIcon />
            </EditTextButton>
            <EditTextButton
              dataKey="italics"
              isMUIButton={true}
            >
              <FormatItalic />
            </EditTextButton>
            <EditTextButton
              dataKey="underlined"
              isMUIButton={true}
            >
              <FormatUnderlined />
            </EditTextButton>
          </Box>
        </Box>
      
        <Box 
          sx={{
            width: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1,
            boxShadow: "none",
          }}
        >
          <h4>Unbreakable Components</h4>
          <Box>
            <EditTextButton 
              dataKey="bold-unbreakable"
              isMUIButton={true}
            >
              <FormatBoldIcon />
            </EditTextButton>

            <EditTextButton
              dataKey="italics-unbreakable"
              isMUIButton={true}
            >
              <FormatItalic />
            </EditTextButton>
            <EditTextButton
              dataKey="underlined-unbreakable"
              isMUIButton={true}
            >
              <FormatUnderlined />
            </EditTextButton>
            {/* <EditTextButton
              dataKey="react-button"
              isMUIButton={true}
            >
              React Button
            </EditTextButton> */}
            <EditTextButton
              dataKey="react-button"
              isMUIButton={true}
            >
              Sample React Component
            </EditTextButton>
            {/* <EditTextButton
              dataKey="multilevel-component"
              isMUIButton={true}
            >
              Multilevel Component
            </EditTextButton>
            <EditTextButton
              dataKey="underline-color"
              isMUIButton={true}
            >
              Underline With Color
            </EditTextButton> */}
          </Box>
        </Box>
      </Box>

      <EditableContent />
    </Box>
  )
}