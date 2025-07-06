import { Button } from "@mui/material";
import React from "react";
import { WrapperArgs } from ".";
import { ButtonProps } from "@mui/material";


type EditTextButtonProps = {
  isMUIButton: boolean,
  dataKey: string,
  child: React.ReactNode,
  contentRef: React.MutableRefObject<HTMLDivElement | null>,
  selected: Boolean,
  onClick: () => void,
  selectedVariant?: ButtonProps["variant"],
  deselectedVariant?: ButtonProps["variant"],
  selectCallback?: () => void,
  deselectCallback?: () => void,
  wrapperArgs: WrapperArgs
};

export default function EditTextButton({
  isMUIButton, 
  dataKey, 
  child, 
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
        onClick={onClick}
        variant={selected ? 
          (selectedVariant || "contained") : 
          (deselectedVariant || "outlined")
        }
        // Only pass valid MUI Button props here
        {...(remainderProps as React.ComponentProps<typeof Button>)}
      >
        {child}
      </Button> :
      <button
        onClick={onClick}
        id={id}
        className={classList?.join(" ")}
        {...remainderProps}
      >
        {child}
      </button>
  )
}



