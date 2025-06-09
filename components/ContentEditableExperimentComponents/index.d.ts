import { ButtonOwnProps } from "@mui/material";
import { DefaultComponentProps } from "@mui/material/OverridableComponent";
import { ExtendButtonBaseTypeMap } from "@mui/material";
import { ButtonTypeMap } from "@mui/material";
import { DetailedHTMLProps } from "react";
import { ButtonHTMLAttributes } from "react";




export type MUIButtonEditableContentButtonProps = 
Omit<DefaultComponentProps<ExtendButtonBaseTypeMap<ButtonTypeMap<{}, "button">>>, "variant"> & 
EditableContentButtonProps & {
  isMUIButton: true,
  // deselectedVariant?: string,
  // selectedVariant?: string
}


export type HTMLButtonEditableContentButtonProps = 
DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & 
EditableContentButtonProps & {
  isMUIButton: false
}


// export type EditableContentButtonProps = {
//   dataKey: string
//   child: React.ReactNode,
//   wrapperArgs: WrapperArgs,
//   // defaultColor?: ButtonOwnProps['color'],
//   // selectedColor?: ButtonOwnProps['color'],
// }


export type EditTextButtonProps = (MUIButtonEditableContentButtonProps | HTMLButtonEditableContentButtonProps) & {
  contentRef?: React.MutableRefObject<HTMLDivElement | null>,
  // wrapSelection: () => void,
  selected: Boolean,
  onClick: () => void,
  selectedVariant?: OverridableStringUnion<"text" | "contained" | "outlined", ButtonPropsVariantOverrides> | undefined,
  deselectedVariant?: OverridableStringUnion<"text" | "contained" | "outlined", ButtonPropsVariantOverrides> | undefined,
  // selectCallback?: () => void,
  // deselectCallback?: () => void
}


export type EditableContentEditTextButtonProps = (
  MUIButtonEditableContentButtonProps | HTMLButtonEditableContentButtonProps
) & {
  wrapperArgs: WrapperArgs, 
  selectCallback?: () => void,
  deselectCallback?: () => void
}


export type EditableContentProps = {
  initialHTML?: string,
  // editTextButtons: Array<EditableContentButtonProps>
  // editTextButtons: Array<MUIButtonEditableContentButtonProps | HTMLButtonEditableContentButtonProps>,
  editTextButtons: Array<EditableContentEditTextButtonProps>
  // editTextButtons: Array<EditTextButtonProps>
}

export type WrapperArgs = {
  element: string,
  classList?: Array<string>,
  id?: string,
  unbreakable?: boolean,
  attributes?: {
    [key: string]: string | undefined
  },
  eventListeners?: {
    [key: string]: function
  }
}