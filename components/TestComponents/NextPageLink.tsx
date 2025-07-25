import { Box, Link, Typography } from "@mui/material";

type NextPageLinkProps = {
  href: string,
  text?: string
}

export default function NextPageLink({href, text}: NextPageLinkProps) {
  return (
    <Box 
      sx={{
        width: '100%',
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Link 
        sx={{color: "primary.light"}} 
        href={href}
        underline="none"
      >
        <h3>{text || "NEXT"} &#9205;</h3>
      </Link>
    </Box>
  )
}