"use client"
import { Box } from "@mui/material";
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import StatefulBox from "@/components/Wrappers/StatefulBox";
import MultiLevelBox from "@/components/Wrappers/MultilLevelBox";
import UnderlineColor from "@/components/Wrappers/UnderlineColor";
import EditableLink from "@/components/Wrappers/EditableLink"
import { useState } from "react";
import { ContextMenuContextProvider } from "@/context/ContextMenuContext";
import ButtonAndContentContainer from "@/components/ContentWrappers/ButtonAndContentContainer";
import SampleReactButton from "@/components/Wrappers/SampleReactButton";


const initialHTML = `​Welcome ​to <strong class=\"bold-standard\" data-bk=\"bold\"><i class=\"italics-standard\" data-bk=\"italics\"><u class=\"underlined-standard\" data-bk=\"underlined\">editable-content!</u></i></strong>\​ ​This tool is designed to give developers the ability to create rich-text editors which include <div id=\"portal-container-f40524bc-5e43-46ed-b9c2-7ae6585f5c34\" data-button-key=\"react-button\" style=\"display: inline;\">​React Components</div> ​as elements.<br><br>​As a demo, please feel free to play around with the editable div below. As you can see, there are two types of buttons: ​<strong class=\"bold-standard\" data-bk=\"bold\">Standard ​Wrappers</strong>&nbsp;and <strong data-bk=\"bold-unbreakable\" data-unbreakable=\"\">Unbreakable ​Components.</strong><br>​<br><strong class=\"bold-standard\">Standard ​Wrappers</strong> ​work ​as ​you ​would ​normally&nbsp;expect from a word processor- when text is selected and the button is clicked, the selected text will take on that text decoration. Click the button again, and the selected text will lose that given text decoration. Text can have multiple standard wrappers at work, such as text which is in italics and in bold while inside of other text which is bold. When the cursor is in just one space, clicking the button will make future text from the cursor have that decoration, or lose that decoration if the button was already clicked.<br><br>​<strong data-bk=\"bold-unbreakable\" data-unbreakable=\"\">Unbreakable ​Components</strong>&nbsp;are different: Unlike Standard Wrappers, no other decoration can “nest” within an Unbreakable Component, and an Unbreakable Component cannot be inside of any other decoration. Additionally,  ​ <u data-bk=\"underlined-unbreakable\" data-unbreakable=\"\">unbreakable components cannot be “split”,</u>&nbsp; ​​and so <div id=\"portal-container-8441e5d6-e708-40cb-baaf-8037688b06b1\" data-button-key=\"react-button\" style=\"display: inline;\">clicking the Wrapper Component's​ ​button ​again will cause the entire component to disappear, ​leaving ​only ​the ​text ​behind. ​(try ​it ​here!)</div>The one exception to this is if the cursor is placed at the end of the text inside the Unbreakable Component, in which case the cursor will move out of the Unbreakable Component's text and back into plain text. ​<strong data-bk=\"bold-unbreakable\" data-unbreakable=\"\">All ​React ​Components ​are ​unbreakable.</strong>​<br>`




export default function Page() {

  const [showHrefDialog, setShowHrefDialog] = useState<boolean>(false);
  const [href, setHref] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(true);
  const [portalIdForHrefDialog, setPortalIdForHrefDialog] = useState<string | undefined>(undefined);

  const [underlineColor, setUnderlineColor] = useState("red");

  return (
    <ContextMenuContextProvider>
      <EditableContentContextProvider
        initialHTML={initialHTML}
        keyAndWrapperObjs={[
          {
            dataKey: "callback-sample",
            wrapper: <strong className="callback-sample" />
          },
          {
            dataKey: "bold",
            wrapper: <strong className="bold-standard" />
          },
          {
            dataKey: "italics",
            wrapper: <i className="italics-standard" />
          },
          {
            dataKey: "underlined",
            wrapper: <u className="underlined-standard" />
          },
          {
            dataKey: "bold-unbreakable",
            wrapper: <strong data-unbreakable="" />
          },
          {
            dataKey: "italics-unbreakable",
            wrapper: <i data-unbreakable="" />
          },
          {
            dataKey: "underlined-unbreakable",
            wrapper: <u data-unbreakable="" />
          },
          {
            dataKey: "react-button",
            wrapper: <SampleReactButton />
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
            wrapper: <UnderlineColor color={underlineColor} />
          }
        ]}
        
      >
        <ButtonAndContentContainer />
      </EditableContentContextProvider>
    </ContextMenuContextProvider>
  )

}