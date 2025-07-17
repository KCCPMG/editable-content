import { Link } from "@mui/material";

type EditableLinkProps = {
  href?: string,
  children?: React.ReactNode,
  [key: string]: any
}


export default function EditableLink({href, children, ...rest}: EditableLinkProps) {
  return (
    <Link href={href ? href : ""} {...rest} >{children}</Link>
  )
}