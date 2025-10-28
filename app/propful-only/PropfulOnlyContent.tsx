import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import { EditableContentContext, EditableContent, EditTextButton, RenderedContent } from "@kccpmg/editable-content";
import { FormatBold, FormatItalic } from "@mui/icons-material";
import { Box, Button, Container, Divider, Paper, Typography } from "@mui/material";
import IncreaseColorButton from "./IncreaseColorButton";
import { useContext, useState } from "react";
import { EditModeContext } from "@/context/EditModeContext";
import ClearButton from "@/components/ButtonsAndUI/ClearButton";
import styles from "@/components/ContentWrappers/ButtonAndContentContainer.module.css";
import RenderedContentContainer from "@/components/ContentWrappers/RenderedContentContainer";




export default function PropfulOnlyContent() {

  const [componentBorderColor, setComponentBorderColor] = useState("Red");
  const editModeContext = useContext(EditModeContext);
  const editableContentContext = useContext(EditableContentContext);

  if (!editModeContext || !editableContentContext) return <></>;

  // else - contexts load safely
  const { editMode, setEditMode } = editModeContext;

  return (
    <>
      {editMode ?
        <Box>
          <Box 
            sx={{
              paddingBottom: "16px"
            }}
          >
            <h4>
              Change Props For All Components
            </h4>
            <IncreaseColorButton
              componentBorderColor={componentBorderColor}
              setComponentBorderColor={setComponentBorderColor}
            />
          </Box>
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
                <h4 style={{ margin: 0, marginTop: 4, marginLeft: 4 }}>React Buttons</h4>
                <Box display="flex">
                  <EditTextButton
                    isMUIButton={true}
                    dataKey="propful-only"
                    deselectedVariant="text"
                  >
                    Propful Box
                  </EditTextButton>
                  <Divider orientation="vertical" flexItem />
                  <EditTextButton
                    isMUIButton={true}
                    dataKey="stateful-component"
                    deselectedVariant="text"
                  >
                    Stateful Box
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
              <Button variant="text" onClick={
                () => setEditMode(false)
              }>
                Render Text
              </Button>
            </Box>
          </Box>
        </Box>

        :
        <Paper
          elevation={16}
          sx={{
            border: "1px solid black",
            borderRadius: "8px",
            overflow: 'hidden',
            padding: '4px',
            paddingRight: '10px'
          }}
        >
          <Typography variant="h5">Rendered Content</Typography>
          <hr />
          <RenderedContent />
          <hr />
          <Button onClick={() => setEditMode(true)}>
            Edit Text
          </Button>
        </Paper>
      }
      {/* {editMode ?
        <EditableContent
          className="default-editable-content"
        /> :
        <RenderedContent
          className="default-rendered-content"
        />
      }
      <Button variant="outlined" onClick={() => setEditMode(!editMode)}>
        {editMode ? "Render Text" : "Edit Text"}
      </Button> */}
      <Container>
        <AllPropsDisplay show={true} />
      </Container>
    </>
  )
}