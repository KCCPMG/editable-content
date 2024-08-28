"use client";
import MUIRichTextEditor from "mui-rte";
import Chip from "@mui/material/Chip";
import { ReactNode } from "react";
import TableChartIcon from '@mui/icons-material/TableChart';
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import TableViewIcon from '@mui/icons-material/TableView';
import { useTheme } from "@mui/material";

function MyChip(props: {children: ReactNode}) {
  return (
    <Chip
      variant="outlined"
      size="small"
      color="primary"
      label={props.children}
    />
  )
}

export default function MuiRte() {

  const theme = useTheme();

  return (
    <>
      <MUIRichTextEditor 
        label="MUIRichTextEditor"
        controls={["title", "my-block", "my-chip", "my-style"]}
        customControls={[
          {
            name: "my-block",
            icon: <TableChartIcon />,
            type: "block",
            blockWrapper: <MyBlock />
          },
          {
            name: "my-chip",
            icon: <TableViewIcon />,
            type: "inline",
            inlineStyle: {
              borderWidth: "1px", 
              borderColor: "primary",
            }
            // blockWrapper: <MyChip />
          },
          {
            name: "my-style",
            icon: <InvertColorsIcon />,
            type: "inline",
            inlineStyle: {
                backgroundColor: "black",
                color: "white"
            }
          }
        ]}
      />
    </>
  )
}


const MyBlock = (props: {children: ReactNode}) => {
  return (
      <div style={{
          padding: 10,
          backgroundColor: "#ebebeb"
      }}>
          My Block content is:
          {props.children}
      </div>
  )
}

