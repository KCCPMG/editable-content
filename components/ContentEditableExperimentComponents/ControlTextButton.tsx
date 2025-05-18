import { Button } from "@mui/material";

type ControlTextButtonProps = {
  refDiv: HTMLDivElement,
  callback: (div: HTMLDivElement) => void
}


export default function ControlTextButton({refDiv, callback}: ControlTextButtonProps) {

  return (
    <Button 
      onClick={() => {callback(refDiv)} }
    >
      Placeholder
    </Button>
  )


}