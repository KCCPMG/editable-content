import { ReactNode } from "react"


type UnderlineColorProps = {
  color: string,
  children?: ReactNode,
  [key: string]: any
}

export default function UnderlineColor({color, children, ...rest} : UnderlineColorProps) {

  return (
    <u 
      style={{textDecorationColor: color}}
      {...rest}
    >
      {children}
    </u>
  )

}