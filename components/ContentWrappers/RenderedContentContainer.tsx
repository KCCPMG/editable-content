"use client"
import React from "react";
import { EditableContent, RenderedContent } from "editable-content";
import { Paper, Typography, Button } from "@mui/material";
import { Dispatch, SetStateAction } from "react";


type RenderedContentContainerProps = {
  setEditMode:  Dispatch<SetStateAction<boolean>>
}


export default function RenderedContentContainer(
  {setEditMode}: RenderedContentContainerProps
) {

  return (
    <Paper 
      elevation={16}
      sx={{
        border: "1px solid black",
        borderRadius: "8px",
        overflow: 'hidden',
        padding: '4px',
        paddingRight: '10px'
      }}
    >
      <Typography variant="h5">Rendered Just Checking Content</Typography>
      <hr/>
      {/* <RenderedContent /> */}
      <EditableContent />
      <hr/>
      <Button onClick={() => setEditMode(true)}>
        Edit Text
      </Button>
    </Paper>
  )
}
