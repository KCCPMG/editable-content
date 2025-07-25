import { Dispatch, SetStateAction, useEffect } from "react";
import { useEditableContentContext } from "@/context/EditableContentContext";
import { Button } from "@mui/material";

type IncreaseColorButtonProps = {
  componentBorderColor: string,
  setComponentBorderColor: Dispatch<SetStateAction<string>>
}


export default function IncreaseColorButton({componentBorderColor, setComponentBorderColor}: IncreaseColorButtonProps) {

  const { updatePortalProps, contentRef, portals } = useEditableContentContext();

  const colors = ["Red", "Blue", "Green", "Black"];

  // on componentBorderColor change, updatePortalProps
  useEffect(function() {
    if (!contentRef.current) return;
    const divs = Array.from(contentRef.current.querySelectorAll("div[data-button-key='propful-only"));
    const keys = divs.map(div => div.getAttribute('id')?.split("portal-container-")[1]);

    const updateObj = Object.assign({}, ...keys.map(key => {
      if (typeof key != "string") return {}
      return {[key]: {borderC: componentBorderColor}}
    }))

    updatePortalProps(updateObj);
  }, [componentBorderColor])


  function rotateColor() {
    let index = colors.findIndex(c => c === componentBorderColor);
    index++;
    setComponentBorderColor(colors[index % colors.length]);
  }

  return (
    <Button 
      sx={{borderColor: componentBorderColor}} 
      onClick={rotateColor}
      variant="outlined"
    >
      Rotate Color From {componentBorderColor}
    </Button>
  )
}