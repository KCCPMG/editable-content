"use client"
import { Box, Button, Collapse, Container, Fade, Grow } from "@mui/material"
import React, { useState } from "react"
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

type DisplayContainerProps = {
  showInitial: boolean,
  title: string,
  children?: React.ReactNode
}

export default function DisplayContainer({showInitial, title, children}: DisplayContainerProps) {

  const [show, setShow] = useState<boolean>(showInitial)

  return (
    <>
      <Container sx={{display: "flex", justifyContent: "space-between"}}>
        <h2 
        >
          {title}
        </h2>

        <Button onClick={() => setShow(prevShow => !prevShow)} >
          <ExpandMoreIcon   
            sx={{
              color: "black",
              transition: "transform 0.5s",
              transform: `rotate(${show ? '180deg' : '0deg'})`
            }}
          />
        </Button>
      </Container>
      <hr style={{marginTop: "0px"}} />
      <Collapse in={show} timeout={600}>
        <Fade in={show} timeout={1200}>
          <Container>
            {children}
          </Container>
        </Fade>
      </Collapse>
    </>
  )
}