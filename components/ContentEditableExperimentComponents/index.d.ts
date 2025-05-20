import { ButtonOwnProps } from "@mui/material";

export type EditableContentButtonProps = DefaultComponentProps<ExtendButtonBaseTypeMap<ButtonTypeMap<{}, "button">>> & {
  MUIButton: false,
  dataKey: string
  child: React.ReactNode,
  wrapperArgs: WrapperArgs,
  defaultColor?: ButtonOwnProps['color'],
  selectedColor?: ButtonOwnProps['color'],
}

export type EditTextButtonProps = EditableContentButtonProps & {
  contentRef?: React.MutableRefObject<HTMLDivElement | null>,
  // wrapSelection: () => void,
  selected: Boolean,
  onClick: () => void,
}


export type EditableContentProps = {
  initialHTML?: string,
  editTextButtons: Array<EditableContentButtonProps>
}

export type WrapperArgs = {
  element: string,
  classList?: Array<string>,
  id?: string
}