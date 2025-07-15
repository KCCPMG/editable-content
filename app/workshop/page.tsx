import DisplayContainer from "@/components/DisplayComponents/DisplayContainer";
import { Container } from "@mui/material";

export default function Page() {

  return (
    <Container>
      <DisplayContainer showInitial={true} title="Test" />
    </Container>
  )

}