import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import { EditableContentContext, EditableContent, EditTextButton, RenderedContent } from "editable-content"; 
import { FormatBold, FormatItalic } from "@mui/icons-material";
import { Box, Button, Container } from "@mui/material";
import IncreaseColorButton from "./IncreaseColorButton";
import { useContext, useState } from "react";
import { EditModeContext } from "@/context/EditModeContext";




export default function PropfulOnlyContent() {

  const [componentBorderColor, setComponentBorderColor] = useState("Red");
  const editModeContext = useContext(EditModeContext);
  const editableContentContext = useContext(EditableContentContext);

  if (!editModeContext || !editableContentContext) return <></>;

  // else - contexts load safely
  const { editMode, setEditMode } = editModeContext;

  return (
    <>
      {editMode &&
        <Box>
          <Box>
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
                gap: 1
              }}
            >
              <h4>React Buttons</h4>
              <Box>
                <EditTextButton
                  isMUIButton={true}
                  dataKey="propful-only"
                >
                  Propful Box
                </EditTextButton>
                <EditTextButton
                  isMUIButton={true}
                  dataKey="stateful-component"
                >
                  Stateful Box
                </EditTextButton>
              </Box>
            </Box>
            <Box
              sx={{
                width: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 1
              }}
            >
              <h4>Non-React Buttons</h4>
              <Box>
                <EditTextButton
                  isMUIButton={true}
                  dataKey="strong"
                >
                  <FormatBold />
                </EditTextButton>
                <EditTextButton
                  isMUIButton={true}
                  dataKey="standard-italics"
                >
                  <FormatItalic />
                </EditTextButton>
              </Box>
            </Box>
          </Box>
        </Box>
      }
      {editMode ?
        <EditableContent
          className="default-editable-content"
        /> :
        <RenderedContent
          className="default-rendered-content"
        />
      }
      <Button variant="outlined" onClick={() => setEditMode(!editMode)}>
        {editMode ? "Render Text" : "Edit Text"}
      </Button>
      <Container>
        <AllPropsDisplay show={true} />
      </Container>
    </>
  )
}