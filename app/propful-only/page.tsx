"use client"
import { EditableContentContextProvider } from "@/context/EditableContentContext";
import Content from "./Content";



export default function Page() {

  return (
    <>
      <h1>Propful Only Component Example</h1>
      <p>
        There are two values here which are passed as props to every PropfulBox that is rendered here. What I expect to happen is that clicking an instance of PropfulBox will cause the click value to increase by setting its props directly with updatePortalProps.
      </p>
      <EditableContentContextProvider>
        <Content />
      </EditableContentContextProvider>
    </>
  )
}









