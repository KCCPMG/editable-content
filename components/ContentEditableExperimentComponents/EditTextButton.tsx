import { Button, ButtonOwnProps } from "@mui/material";
import React from "react";
import { WrapperArgs } from ".";
import { useEditableContentContext } from "@/context/EditableContentContext";

// "color", even when not named, causes type conflict from WrapperArgs
type EditTextButtonProps = Omit<ButtonOwnProps, "color"> 
  & React.ComponentPropsWithoutRef<'button'> & {
  isMUIButton: boolean,
  dataKey: string,
  child: React.ReactNode,
  // contentRef: React.MutableRefObject<HTMLDivElement | null> | undefined,
  selected: Boolean,
  onClick: () => void,
  selectedVariant?: ButtonOwnProps["variant"],
  deselectedVariant?: ButtonOwnProps["variant"],
  selectCallback?: ((wrapper: HTMLElement) => void) | undefined,
  deselectCallback?: () => void | undefined,
  wrapperArgs: WrapperArgs
};

export default function EditTextButton({
  isMUIButton, 
  dataKey, 
  child, 
  // contentRef, 
  onClick, 
  selected,
  selectedVariant,
  deselectedVariant,
  wrapperArgs: {element, classList, id}, 
  ...remainderProps
}: EditTextButtonProps
) {

  const { keyAndWrapperObjs } = useEditableContentContext();
  const thisKeyAndWrapper = keyAndWrapperObjs.find(kw => kw.dataKey === dataKey);

  const wrapper = thisKeyAndWrapper?.wrapper;

  function handleEditTextButtonClick() {
    if (!wrapper) return;
    // implement logic from etb.map, make determination about if and when to use 
    // isReactComponent
  }

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



