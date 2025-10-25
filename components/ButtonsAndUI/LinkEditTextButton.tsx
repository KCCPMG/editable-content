import { useEditableLinkDialogContext } from "@/context/EditableLinkDialogContext";
import { EditTextButton } from "@kccpmg/editable-content";
import { ReactNode, useEffect } from "react";





export default function LinkEditTextButton({children}: {children: ReactNode}) {
  const { populateAndShowDialog, setPortalId } = useEditableLinkDialogContext();
  // const { portals } = 

  // useEffect(function() {

  // }, [portals])

  return (
    <EditTextButton 
      isMUIButton={true} 
      dataKey="editable-link"
      selectCallback={(wrapper, portalId) => {
        // setShowHrefDialog(true);
        // setPortalIdForHrefDialog(portalId);
        // console.log(wrapper, portalId);
        
        // console.log(populateAndShowDialog);
        // populateAndShowDialog(portalId);

        setPortalId(portalId);
      }}
    >
      {children}
    </EditTextButton>

  )
}