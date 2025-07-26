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
import NextPageLink from "@/components/TestComponents/NextPageLink";
import { FormatBold, FormatItalic } from "@mui/icons-material";

const initialHTML = `
Normal Text 
<div 
  id="portal-container-12345" 
  data-button-key="propful-only" 
>
  Propful Component
</div>`.replaceAll(/\n */g, '');



export default function Page() {

  const [componentBorderColor, setComponentBorderColor] = useState("Red");
  const [editMode, setEditMode] = useState<boolean>(true);

  return (
    <main>
      <Typography variant="h2">Propful Only Components</Typography>
      <p>
        Since state does not persist across renders (and is difficult to get out of the component itself), the solution is to rely on props. In comparison to the last example, there are two examples here: <strong>Propful Box</strong> and <strong>Stateful Box</strong>.
      </p>
      <p>
        The text that is already wrapped here is in a <strong>Propful Box</strong>. You can create more of these or create a <strong>Stateful Box</strong> for comparison. What you will see with the <strong>Propful Box</strong> is that in addition to the color persisting as it did in the previous example, the number of clicks will also persist when going back and forth between <strong>Edit Text</strong> and <strong>Render Text</strong>. You can also see the props that are passed to all elements by expanding the <strong>All Props</strong> display container at the bottom of the page. This display uses the <code>getAllPortalProps</code> function which is passed through the <code>EditableContentContext</code> and allows developers to extract props to save for future hydration.
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
            dataKey: "strong",
            wrapper: <strong></strong>
          },
          {
            dataKey: "standard-italics",
            wrapper: <i></i>
          }
        ]}
        initialHTML={initialHTML}
      >

        {editMode && 
          <Box>
            <Box>
              <h4>
                Change Props For All Componennts
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
      </EditableContentContextProvider>
      <NextPageLink href="/styling-and-callbacks" />
    </main>
  )
}

