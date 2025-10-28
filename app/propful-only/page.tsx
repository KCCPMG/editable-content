"use client"
import { EditableContentContextProvider } from "@/packages/editable-content/src/EditableContentContext";
import { useState } from "react";
import PropfulBox from "@/components/Wrappers/PropfulBox";
import StatefulBox from "@/components/Wrappers/StatefulBox";
import { Typography } from "@mui/material";
import NextPageLink from "@/components/LayoutComponents/NextPageLink";
import { EditModeContextProvider } from "@/context/EditModeContext";
import PropfulOnlyContent from "./PropfulOnlyContent";

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
  // const [editMode, setEditMode] = useState<boolean>(true);

  return (
    <main>
      <Typography variant="h2">Propful Only Components</Typography>
      <p>
        Because state does not persist across renders (and is difficult to get out of the component itself), the solution is to rely on props. In comparison to the last example, there are two examples here: <strong>Propful Box</strong> and <strong>Stateful Box</strong>.
      </p>
      <p>
        The text that is already wrapped here is in a <strong>Propful Box</strong>. You can create more of these or create a <strong>Stateful Box</strong> for comparison. What you will see with the <strong>Propful Box</strong> is that in addition to the color persisting as it did in the previous example, the number of clicks will also persist when going back and forth between <strong>Edit Text</strong> and <strong>Render Text</strong>. You can also see the props that are passed to all elements by expanding the <strong>All Props</strong> display container at the bottom of the page. This display uses the <code>getAllPortalProps</code> function which is passed through the <code>EditableContentContext</code> and allows developers to extract props to save for future hydration.
      </p>
      <p>
        <strong>Note:</strong> this example is also not affected by the insertion of new numbers as the user switches back and from from editable and rendered text (as was seen in the prior example). This is not due to the switch to a Propful Only component, but is due to another fix related to the <code>EXCLUDE_FROM_DEHYDRATED</code> value. For more information on this, see the documentation.
      </p>
      <EditModeContextProvider initialEditMode={true}>
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
          <PropfulOnlyContent />
        </EditableContentContextProvider>
      </EditModeContextProvider>
      <NextPageLink href="/styling-and-callbacks" />
    </main>
  )
}

