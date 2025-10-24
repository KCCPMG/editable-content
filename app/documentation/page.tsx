import NextPageLink from "@/components/LayoutComponents/NextPageLink";
import Contents from "./Contents";
import fs from "fs";
import ReactMarkdown from "react-markdown";
import path from "path";


export default async function Page() {
  
  const file_path = path.join(process.cwd(), "packages/editable-content/readme.md")
  const content = fs.readFileSync(file_path);
  const stringified = content.toString();
  
  return (
    <>
      <h1>README</h1>
      <h3>Contents</h3>
      <Contents />
      <ReactMarkdown>
        {stringified}
      </ReactMarkdown>
      <NextPageLink href="/" text="Back to Main Demo" />
    </>
  )
}