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
    [key: string]: (e: Event) => void
  }
}


export type ContentProps = {
  className?: string,
  disableNewLines?: boolean
}
