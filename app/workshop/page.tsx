"use client"
import DisplayContainer from "@/components/DisplayComponents/DisplayContainer";
import AllPropsDisplay from "@/components/DisplayComponents/AllPropsDisplay";
import { Box, Container } from "@mui/material";
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import StatefulBox from "@/components/TestComponents/StatefulBox";
import MultiLevelBox from "@/components/TestComponents/MultilLevelBox";
import UnderlineColor from "@/components/TestComponents/UnderlineColor";
import EditableLink from "@/components/TestComponents/EditableLink"
import EditableContent from "@/components/EditableContent";
import EditTextButton from "@/components/EditTextButton";
import FormatUnderlined from "@mui/icons-material/FormatUnderlined";


const initialHTML = `
<strong>Lorem, ipsum</strong>
  ​dolor ​sit ​ 
  ​<i>amet  ​cons
  <strong>
    ectetur adipisicing ​ ​ ​
    <br>
    elit.
  </strong> ​Sunt,
</i>
repudiandae. ​Lorem, ipsum ​dolor ​sit ​amet ​ ​consectetur ​ ​ ​
<br>
adipisicing
<u testattribute="ta" testattribute2="ta2" data-unbreakable="">
  elit.
</u>
Sunt, ​re
<div 
  id="portal-container-2bf69a61-17c5-498f-ad4c-ba9a2b01132d" 
  data-button-key="react-button" 
  style="display: inline;"
>
    pud
      iand
    a
  e. ​ ​Lorem
</div>
, ​ipsum ​dolor ​ ​
<br>
sit amet
<strong>
  consectetur
  <i>
    adipisicing
  </i>
  elit.
</strong>
  Sunt,  ​repudiandae. ​Lorem, ​
​<div id="portal-container-f56a36a4-00b7-42c8-9d92-e14691b2ee1a" data-button-key="react-button" style="display: inline;">
  ipsum ​dolorsit
</div>`.replaceAll(/\n */g, '');




export default function Page() {

  return (
    <EditableContentContextProvider
      keyAndWrapperObjs={[
        {
          dataKey: "callback-sample",
          wrapper: <strong className="callback-sample" />
        },
        {
          dataKey: "bold",
          wrapper: <strong></strong>
        },
        {
          dataKey: "italics",
          wrapper: <i />
        },
        {
          dataKey: "underlined",
          wrapper: <u 
            data-test-attribute="ta" 
            data-test-attribute2="ta2" 
            data-unbreakable=""
            onClick={(e) => {console.log("clicked")}} 
          />
        },
        {
          dataKey: "react-button",
          wrapper: <Box 
            component="div"
            sx={{
              display: 'inline',
              p: 1,
              m: 1,
              bgcolor: '#fff',
              color: 'grey.800',
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
              fontSize: '0.875rem',
              fontWeight: '700',
            }}
          /> 
        },
        {
          dataKey: "stateful-component",
          wrapper: <StatefulBox />
        },
        {
          dataKey: "multilevel-component",
          wrapper: <MultiLevelBox />
        },
        {
          dataKey: "underline-color",
          wrapper: <UnderlineColor color="blue" />
        },
        {
          dataKey: "editable-link",
          wrapper: <EditableLink />
        }
      ]}
      initialHTML={initialHTML}
    >
      <Container>
        <EditTextButton isMUIButton={true} dataKey="editable-link">
          Link
        </EditTextButton>
        <EditTextButton
          dataKey="underlined"
          isMUIButton={true}
        >
          <FormatUnderlined />
        </EditTextButton>
        <EditableContent />
        <DisplayContainer showInitial={false} title="Test" />
        <AllPropsDisplay show={false} />
        <DisplayContainer showInitial={false} title="Test" />
      </Container>
    </EditableContentContextProvider>
  )

}