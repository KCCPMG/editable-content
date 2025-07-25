"use client"
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import { useState } from "react";
import PropfulBox from "@/components/TestComponents/PropfulBox";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import IncreaseColorButton from "./IncreaseColorButton";
import EditableContent from "@/components/EditableContent";
import { Container, Button, Box, Typography } from "@mui/material";
import EditTextButton from "@/components/EditTextButton";
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import RenderedContent from "@/components/RenderedContent";


const initialHTML = `
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="propful-only" 
>
  Propful Component
</div>`.replaceAll(/\n */g, '');



export default function Page() {

  const [componentBorderColor, setComponentBorderColor] = useState("red");
  const [editMode, setEditMode] = useState<boolean>(true);

  return (
    <main>
      <Typography variant="h2">Propful Only Components</Typography>
      <p>
        There are two values here which are passed as props to every PropfulBox that is rendered here. What I expect to happen is that clicking an instance of PropfulBox will cause the click value to increase by setting its props directly with updatePortalProps.
      </p>
      <EditableContentContextProvider
        keyAndWrapperObjs={[
          {
            dataKey: "propful-only",
            wrapper: <PropfulBox 
              clickCount={0}
              borderC={componentBorderColor} 
            />
          },
          {
            dataKey: "stateful-component",
            wrapper: <StatefulBox />
          },
          {
            dataKey: "non-react-strong",
            wrapper: <strong className="non-react-strong"></strong>
          },
          {
            dataKey: "block-italics",
            wrapper: <div><i></i></div>
          }
        ]}
        initialHTML={initialHTML}
      >
        {editMode && 
          <Box 
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: "4",
              alignItems: "flex-start",
              felxWrap: "wrap",
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
                  dataKey="non-react-strong"
                >
                  Non React Strong
                </EditTextButton>
                <EditTextButton
                  isMUIButton={false}
                  dataKey="block-italics"
                >
                  Block Italics
                </EditTextButton>
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
        {editMode && 
          <IncreaseColorButton 
            componentBorderColor={componentBorderColor} 
            setComponentBorderColor={setComponentBorderColor} 
          />
        }
        <Button onClick={() => setEditMode(!editMode)}>
          {editMode ? "Render Text" : "Edit Text"}
        </Button>
        <Container>
          <AllPropsDisplay show={true} />
        </Container>
      </EditableContentContextProvider>
    </main>
  )
}

