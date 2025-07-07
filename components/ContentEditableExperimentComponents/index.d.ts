import { SxProps, ButtonOwnProps } from "@mui/material";
import { DefaultComponentProps } from "@mui/material/OverridableComponent";
import { ExtendButtonBaseTypeMap } from "@mui/material";
import { ButtonTypeMap } from "@mui/material";
import { CSSProperties, DetailedHTMLProps, ReactNode } from "react";
import { ButtonHTMLAttributes } from "react";



// defined
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

export type WrapperInstructions = WrapperArgs | ReactElement

// defined - not used
export type EditableContentButtonProps = {
  dataKey: string
  child: React.ReactNode,
  wrapperArgs: WrapperArgs,
  // defaultColor?: ButtonOwnProps['color'],
  // selectedColor?: ButtonOwnProps['color'],
}


// defined
export type MUIButtonEditableContentButtonProps = 
Omit<DefaultComponentProps<ExtendButtonBaseTypeMap<ButtonTypeMap<{}, "button">>>, "variant"> &
{
  isMUIButton: true,
  // deselectedVariant?: string,
  // selectedVariant?: string
}


// defined
export type HTMLButtonEditableContentButtonProps = 
DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & 
{
  isMUIButton: false
}


export type ReactWrapperInstructions = {
  isReactComponent: true,
  isStateful?: boolean,
  component: ReactElement
}

export type HTMLWrapperInstructions = {
  isReactComponent?: false,
  wrapperArgs: WrapperArgs
}


export type EditTextButtonObject = (
  MUIButtonEditableContentButtonProps | 
  HTMLButtonEditableContentButtonProps
) & (
  ReactWrapperInstructions |
  HTMLWrapperInstructions
) & {
  // contentRef?: React.MutableRefObject<HTMLDivElement | null> | undefined,
  // wrapSelection: () => void,
  dataKey: string,
  child: React.ReactNode,
  // selected: Boolean,
  // onClick: () => void,
  selectedVariant?: ButtonOwnProps["variant"] | undefined,
  deselectedVariant?: ButtonOwnProps["variant"] | undefined,
  selectCallback?: ((wrapper: HTMLElement) => void) | undefined,
  deselectCallback?: (() => void) | undefined
}


/** 
 * 

WrapperArgs
WrapperInstructions
EditableContentButtonProps
MUIButtonEditableContentButtonProps / HTMLButtonEditableContentButtonProps
EditTextButtonProps


*/



// not used
export type EditableContentEditTextButtonProps = (
  MUIButtonEditableContentButtonProps | HTMLButtonEditableContentButtonProps
) & {
  wrapperInstructions: WrapperInstructions,
  // wrapperArgs: WrapperArgs, 
  selectCallback?: () => void,
  deselectCallback?: () => void
}


export type EditableContentProps = {
  buttonRowStyle?: CSSProperties,
  divStyle?: CSSProperties,
  initialHTML?: string,
  // editTextButtons: Array<EditableContentButtonProps>
  // editTextButtons: Array<MUIButtonEditableContentButtonProps | HTMLButtonEditableContentButtonProps>,
  // editTextButtons: Array<EditableContentEditTextButtonProps>
  editTextButtons: Array<EditTextButtonObject>
}





