import { Box, Button, Divider, Typography } from "@mui/material";
import EditableContent from "../EditableContent";
import { FormatItalic, FormatUnderlined } from "@mui/icons-material";
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import EditTextButton from "../EditTextButton";
import ClearButton from "../ButtonsAndUI/ClearButton";
import { Dispatch, SetStateAction } from "react";
import styles from "./ButtonAndContentContainer.module.css";


type ButtonAndContentContainerProps = {
  setEditMode: Dispatch<SetStateAction<boolean>>
}

export default function ButtonAndContentContainer(
  {setEditMode}: ButtonAndContentContainerProps
) {
  return (
    <Box
      sx={{
        border: "2px solid black",
        borderRadius: "8px",
        overflow: 'hidden',
        // padding: '2px',
        paddingRight: '10px'
      }}
    >
      <Box 
        className="all-buttons-box"
        sx={{ 
          display: "flex",
          flexDirection: "row",
          gap: "4",
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "left",
          backgroundColor: "#fafaf1",
          paddingTop: '2px',
          marginRight: '-8px'
          // internalPadding: "4px"
        }} 
      >
        <Box
          sx={{
            width: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 1
          }}
        >
          <h4 style={{margin: 0, marginTop: 4, marginLeft: 4}}>Standard Wrappers</h4>
          <Box display="flex">
            <EditTextButton
              dataKey="bold"
              isMUIButton={true}
              deselectedVariant="text"
            >
              <FormatBoldIcon />
            </EditTextButton>
            <Divider orientation="vertical" flexItem />
            <EditTextButton
              dataKey="italics"
              isMUIButton={true}
              deselectedVariant="text"
            >
              <FormatItalic />
            </EditTextButton>
            <Divider orientation="vertical" flexItem />
            <EditTextButton
              dataKey="underlined"
              isMUIButton={true}
              deselectedVariant="text"
            >
              <FormatUnderlined />
            </EditTextButton>
          </Box>
        </Box>  
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{
            margin: '4px'
          }}
        />    
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
          <h4 style={{margin: 0, marginTop: 4, marginLeft: 4}}>Unbreakable Components</h4>
          <Box display="flex">
            <EditTextButton 
              dataKey="bold-unbreakable"
              isMUIButton={true}
              deselectedVariant="text"
            >
              <FormatBoldIcon />
            </EditTextButton>
            <Divider orientation="vertical" flexItem />
            <EditTextButton
              dataKey="italics-unbreakable"
              isMUIButton={true}
              deselectedVariant="text"
            >
              <FormatItalic />
            </EditTextButton>
            <Divider orientation="vertical" flexItem />
            <EditTextButton
              dataKey="underlined-unbreakable"
              isMUIButton={true}
              deselectedVariant="text"
            >
              <FormatUnderlined />
            </EditTextButton>
            <Divider orientation="vertical" flexItem />
            <EditTextButton
              dataKey="react-button"
              isMUIButton={true}
              deselectedVariant="text"
            >
              <Typography sx={{fontWeight: 700}}>Sample React Component</Typography>
            </EditTextButton>
          </Box>
        </Box>
      </Box>
      <EditableContent 
        className={styles.ButtonAndContentContainerEditableContent}
      />
      <Box
        className="all-buttons-box"
        sx={{ 
          display: "flex",
          flexDirection: "row",
          gap: "4",
          alignItems: "flex-start",
          flexWrap: "wrap",
          justifyContent: "right",
          backgroundColor: "#fafaf1",
          paddingTop: '2px',
          marginRight: '-8px'
          // internalPadding: "4px"
        }} 
      >
        <ClearButton />
        <Divider 
          orientation="vertical" 
          flexItem 
          sx={{
            margin: '4px'
          }}
        />   
        <Button variant="text" onClick={() => setEditMode(false)}>
          Render Text
        </Button>
      </Box>
    </Box>
  )
}