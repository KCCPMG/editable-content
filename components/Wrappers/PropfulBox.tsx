import { EditableContentContextType, useEditableContentContext } from "@/context/EditableContentContext";
import { Box } from "@mui/material";
import { ReactNode, useRef, useEffect } from "react";
import { EXCLUDE_FROM_DEHYDRATED } from "@/utils/constants";


type PropfulBoxProps = {
  portalId?: string, 
  clickCount: number,
  borderC: string,
  children?: ReactNode,
  getContext?: () => EditableContentContextType,
  [key: string]: any
}


export default function PropfulBox(
  {portalId, clickCount, borderC, children, getContext, ...rest}: PropfulBoxProps) 
{

  const containerRef = useRef<HTMLDivElement | null>(null);
  // const clickCountRef = useRef<HTMLSpanElement | null>(null);

  // useEffect(function() {

  //   console.log("propful box use effect")
  //   // need to create and append <span ref={clickCountRef}>{clickCount}</span> 
  //   const clickCountSpan = document.createElement("span");
  //   clickCountRef.current = clickCountSpan;
    
  //   if (containerRef.current) {
  //     // containerRef.current.insertNode(clickCountRef.current);
  //     containerRef.current.insertBefore(clickCountSpan, containerRef.current.firstChild)
  //   }

  //   return (() => {
  //     console.log("propful box teardown")
  //     if (clickCountRef.current) {
  //       clickCountRef.current.remove();
  //     }
  //   })
  // }, [])


  // useEffect(function() {
  //   if (clickCountRef.current) {
  //     clickCountRef.current.innerText = `${clickCount} `;
  //   }
  // }, [clickCount])

  // const { updatePortalProps } = useEditableContentContext();
  const { updatePortalProps=undefined } = getContext ? getContext() : {};

  function increaseClicks() {
    // console.log(`clicked ${portalId}`)
    if (portalId && updatePortalProps) updatePortalProps({
      [portalId]:
        {
          clickCount: clickCount+1
        }
    })
  }

  const blah="data-blah";

  return (
    <Box    
      // ref={containerRef}   
      sx={{
        display: 'block',
        p: 1,
        m: 1,
        bgcolor: '#fff',
        color: 'grey.800',
        border: '1px solid',
        borderColor: borderC,
        borderRadius: 2,
        fontSize: '0.875rem',
        fontWeight: '700',
      }} 
      onClick={increaseClicks} 
      {...rest}
    >
      <span 
        {...{[EXCLUDE_FROM_DEHYDRATED]: ""}}
      >
        {clickCount}&nbsp;
      </span>
      {children}
    </Box>
  )

}