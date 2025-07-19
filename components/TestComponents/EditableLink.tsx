import { Container, Link, Box } from "@mui/material";
import { MutableRefObject, useEffect, useRef, useState} from "react";
import { useEditableLinkDialogContext } from "@/context/EditableLinkDialogContext";

type EditableLinkProps = {
  href?: string,
  children?: React.ReactNode,
  portalId?: string,
  [key: string]: any
}


export default function EditableLink({href, children, portalId, ...rest}: EditableLinkProps) {

  const [showContextMenu, setShowContextMenu] = useState<boolean>(false);
  const linkRef = useRef(null);
  const { setPortalId } = useEditableLinkDialogContext();

  useEffect(function() {
    (window as any).linkRef = linkRef;
  }, [linkRef])

  return (
    <Link 
      ref={linkRef}
      href={href ? href : ""} {...rest} 
      // onContextMenu={(e) => {
      //   e.preventDefault();
      //   console.log(e.pageX);
      //   setShowContextMenu(true)
      // }}
      onContextMenu={(e) => { setPortalId(portalId) }}
    >
      <CustomContextMenu show={showContextMenu} linkRef={linkRef}/>
      {children}
    </Link>
  )
}


type CustomContextMenuProps = {
  show: boolean,
  linkRef: MutableRefObject<HTMLAnchorElement | null>
}


export function CustomContextMenu({show, linkRef}: CustomContextMenuProps) {

  const [xPos, setXPos] = useState<number>(0);
  const [yPos, setYPos] = useState<number>(0);

  useEffect(function() {
    if (!linkRef.current) return;
    console.log(linkRef.current?.getBoundingClientRect());
    const {x, width, y, height} = linkRef.current?.getBoundingClientRect();
    setXPos(x + width);
    setYPos(y + height);

  }, [show])


  if (show) {
    return (
      <Box
        sx={{
          position: "fixed",
          left: xPos,
          top: yPos,
          border: "1px solid black",
          borderRadius: "5px",
          padding: "10px"
        }}
      >
        Test Text which is editable due to being child of contentRef
      </Box> 
    )
  }
  else return null;
}