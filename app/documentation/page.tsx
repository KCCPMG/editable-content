import NextPageLink from "@/components/LayoutComponents/NextPageLink";
import path from "path";
import fs from "fs";
import MarkedDownDocumentation from "./MarkedDownDocumentation";


export default async function Page() {

  const file_path = path.join(process.cwd(), "documentation.md")
  const content = fs.readFileSync(file_path);
  const stringified = content.toString();


  return (
    <>
      <h1>Documentation</h1>
      <MarkedDownDocumentation stringified={stringified} />
      <NextPageLink href="/" text="Back to Main Demo" />
    </>
  )
}