import { Button } from "@mui/material";
import { EditTextButtonProps } from ".";



export default function EditTextButton({
  isMUIButton, 
  dataKey, 
  child, 
  defaultColor, 
  selectedColor, 
  contentRef, 
  onClick, 
  selected,
  selectedVariant,
  deselectedVariant,
  wrapperArgs : {element, classList, id}, 
  ...remainderProps}: EditTextButtonProps
) {


  return (
    isMUIButton ? 
      <Button 
        // regular button props
        {...remainderProps}
        
        // necessary, declared last to prevent override
        onClick={onClick}
        variant={selected ? 
          (selectedVariant || "outlined") : 
          (deselectedVariant || "contained")
        }
      >
        {child}
      </Button> :
      <button
        onClick={onClick}
        {...remainderProps}
      >
        {child}
      </button>
  )
}



